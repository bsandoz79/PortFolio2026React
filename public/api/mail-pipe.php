#!/usr/local/bin/php -q
<?php
// Relais de contact@bsandoz.fr, branché dans cPanel → Redirecteurs → « Diriger vers un programme ».
// Exim fournit l'e-mail brut sur l'entrée standard. Le script :
//   1. le retransmet à Proton en tant que contact@bsandoz.fr (Reply-To = expéditeur) :
//      un simple renvoi garde l'expéditeur d'origine et Proton le rejette quand ce
//      domaine impose DMARC p=reject ;
//   2. envoie l'accusé de réception (CV, brochure, coordonnées) à l'expéditeur,
//      une fois par 24 h maximum, jamais aux robots, listes ou spams.
// Toute sortie serait renvoyée à l'expéditeur comme erreur : le script reste muet
// et se termine toujours avec le code 0. Inaccessible depuis le web (.htaccess).

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

ini_set('display_errors', '0');
error_reporting(E_ALL);
ob_start();

const ACK_INTERVAL = 86400;   // un accusé par expéditeur et par 24 h
const RELAY_HEADER = 'X-Bsandoz-Relay';

function log_line(string $msg): void {
    // Journal hors du dossier web : /home/<compte>/mail-pipe.log
    @file_put_contents(dirname(__DIR__, 2) . '/mail-pipe.log', date('c') . ' ' . $msg . "\n", FILE_APPEND | LOCK_EX);
}

function header_value(array $headers, string $name): string {
    foreach ($headers as [$k, $v]) {
        if (strcasecmp($k, $name) === 0) return $v;
    }
    return '';
}

/** Sépare « Nom <adresse> » en [nom décodé, adresse en minuscules]. */
function parse_address(string $raw): array {
    if (preg_match('/<([^<>\s]+@[^<>\s]+)>/', $raw, $m)) {
        $addr = $m[1];
        $name = trim(substr($raw, 0, (int)strpos($raw, '<')));
    } else {
        $addr = trim($raw);
        $name = '';
    }
    $name = trim(mb_decode_mimeheader($name), " \t\"'");
    return [$name, strtolower($addr)];
}

/** Retransmet l'e-mail tel quel (corps, pièces jointes) avec des en-têtes à notre nom. */
function relay(array $headers, string $body, string $fromRaw, string $name, string $addr): bool {
    $subject = header_value($headers, 'Subject');
    if ($subject === '') $subject = '(sans objet)';
    elseif (preg_match('/[^\x20-\x7E]/', $subject)) $subject = encode_header($subject);

    $label = ($name !== '' ? $name : $addr) . ' (via contact@bsandoz.fr)';
    $out = [
        'From: ' . encode_header($label) . ' <' . FROM_EMAIL . '>',
        'Reply-To: ' . header_safe(header_value($headers, 'Reply-To') ?: $fromRaw),
        'X-Original-From: ' . header_safe($fromRaw),
        RELAY_HEADER . ': 1',
        'MIME-Version: 1.0',
        'Content-Type: ' . header_safe(header_value($headers, 'Content-Type') ?: 'text/plain; charset=UTF-8'),
    ];
    foreach (['Content-Transfer-Encoding', 'Date'] as $h) {
        $v = header_value($headers, $h);
        if ($v !== '') $out[] = $h . ': ' . header_safe($v);
    }

    return mail(PROTON_EMAIL, header_safe($subject), str_replace("\n", "\r\n", $body), implode("\r\n", $out), '-f' . FROM_EMAIL);
}

/** Raison de ne pas envoyer d'accusé (robot, liste, bounce, nous-mêmes), ou null. */
function skip_ack(array $headers, string $addr): ?string {
    if (!filter_var($addr, FILTER_VALIDATE_EMAIL)) return 'adresse invalide';
    if (preg_match('/@(?:[\w-]+\.)*bsandoz\.fr$/', $addr)) return 'notre domaine';
    if (preg_match('/^(?:no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounces?)[@+.-]/', $addr)) return 'adresse automatique';
    if (getenv('SENDER') === '') return 'bounce (expéditeur vide)';

    $auto = strtolower(header_value($headers, 'Auto-Submitted'));
    if ($auto !== '' && $auto !== 'no') return 'Auto-Submitted';
    if (preg_match('/^(?:bulk|list|junk)$/i', header_value($headers, 'Precedence'))) return 'Precedence';
    foreach (['List-Id', 'List-Unsubscribe', 'X-Autoreply', 'X-Autorespond'] as $h) {
        if (header_value($headers, $h) !== '') return $h;
    }
    return null;
}

function run(): void {
    $raw = stream_get_contents(STDIN);
    if ($raw === false || $raw === '') return;

    $raw = str_replace("\r\n", "\n", $raw);
    $parts = explode("\n\n", $raw, 2);
    $head = preg_replace("/\n[ \t]+/", ' ', $parts[0]);   // en-têtes repliés sur plusieurs lignes
    $body = $parts[1] ?? '';

    $headers = [];
    foreach (explode("\n", $head) as $line) {
        if (preg_match('/^([!-9;-~]+):\s*(.*)$/', $line, $m)) $headers[] = [$m[1], trim($m[2])];
    }

    // Déjà relayé par nous : on s'arrête là (évite toute boucle)
    if (header_value($headers, RELAY_HEADER) !== '') return;

    $fromRaw = header_value($headers, 'From');
    [$name, $addr] = parse_address($fromRaw);

    // Spam détecté par le serveur : conservé dans la boîte contact@ (webmail), ni relayé ni accusé
    $isSpam = stripos(header_value($headers, 'X-Spam-Status'), 'yes') === 0
           || strcasecmp(header_value($headers, 'X-Spam-Flag'), 'yes') === 0;
    if ($isSpam) {
        log_line("spam ignoré de {$addr}");
        return;
    }

    if (!relay($headers, $body, $fromRaw, $name, $addr)) {
        log_line("échec du relais vers Proton pour un message de {$addr}");
    }

    $reason = skip_ack($headers, $addr);
    if ($reason !== null) return;

    // Un seul accusé par expéditeur et par 24 h
    $stamp = sys_get_temp_dir() . '/contact_ack_' . hash('sha256', $addr);
    if (is_file($stamp) && filemtime($stamp) > time() - ACK_INTERVAL) return;
    touch($stamp);

    if (!send_ack($addr, $name, 'contact@bsandoz.fr')) {
        log_line("échec de l'accusé vers {$addr}");
    }
}

try {
    require __DIR__ . '/_mail.php';
    run();
} catch (Throwable $err) {
    log_line('erreur : ' . $err->getMessage());
} finally {
    ob_end_clean();
}
exit(0);
