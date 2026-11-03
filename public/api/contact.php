<?php
// Formulaire de contact du portfolio (hébergement o2switch).
// Reçoit un JSON { name, email, subject, message, website } et envoie un e-mail via mail().

declare(strict_types=1);

const TO_EMAIL   = 'contact@bsandoz.fr';
const FROM_EMAIL = 'contact@bsandoz.fr';
const ALLOWED_ORIGINS = ['https://portfolio.bsandoz.fr', 'https://www.portfolio.bsandoz.fr'];
const RATE_LIMIT  = 5;     // messages max…
const RATE_WINDOW = 3600;  // …par heure et par IP

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function reply(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(405, ['ok' => false, 'error' => 'Méthode non autorisée.']);
}

// Requêtes venant d'un autre site refusées
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, ALLOWED_ORIGINS, true)) {
    reply(403, ['ok' => false, 'error' => 'Origine non autorisée.']);
}

$data = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($data)) {
    reply(400, ['ok' => false, 'error' => 'Requête invalide.']);
}

// Pot de miel : champ caché que seuls les robots remplissent
if (!empty($data['website'])) {
    reply(200, ['ok' => true]);
}

$clean = static fn($v, int $max) => mb_substr(trim(strip_tags((string)($v ?? ''))), 0, $max);
$name    = $clean($data['name'] ?? '', 100);
$email   = $clean($data['email'] ?? '', 150);
$subject = $clean($data['subject'] ?? '', 150);
$message = mb_substr(trim((string)($data['message'] ?? '')), 0, 5000);

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reply(422, ['ok' => false, 'error' => 'Merci de remplir votre nom, un e-mail valide et votre message.']);
}
if (mb_strlen($message) < 10) {
    reply(422, ['ok' => false, 'error' => 'Votre message est un peu court.']);
}

// Limite d'envoi par IP (fichier dans le dossier temporaire du compte)
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/contact_rate_' . hash('sha256', $ip);
$now = time();
$hits = is_file($rateFile) ? (json_decode((string)file_get_contents($rateFile), true) ?: []) : [];
$hits = array_values(array_filter($hits, static fn($t) => $t > $now - RATE_WINDOW));
if (count($hits) >= RATE_LIMIT) {
    reply(429, ['ok' => false, 'error' => 'Trop de messages envoyés. Réessayez plus tard.']);
}
$hits[] = $now;
file_put_contents($rateFile, json_encode($hits), LOCK_EX);

// Pas de retour à la ligne dans les en-têtes (injection d'en-têtes)
$headerSafe = static fn(string $v) => str_replace(["\r", "\n"], ' ', $v);

date_default_timezone_set('Europe/Paris');
$sentAt      = date('d/m/Y à H:i');
$mailSubject = '[Portfolio] ' . ($subject !== '' ? $subject : 'Nouveau message de ' . $name);

// Version texte (messageries sans HTML)
$text = "Nouveau message depuis le portfolio\n\n"
      . "Nom : {$name}\nE-mail : {$email}\n"
      . ($subject !== '' ? "Sujet : {$subject}\n" : '')
      . "\n{$message}\n\n--\nEnvoyé depuis portfolio.bsandoz.fr le {$sentAt}";

// Version HTML : styles en ligne et tableaux, seuls rendus fiables dans les messageries
$e = static fn(string $v) => htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
$replyHref = 'mailto:' . rawurlencode($email) . '?subject=' . rawurlencode('Re: ' . ($subject !== '' ? $subject : 'Votre message'));
$subjectRow = $subject !== ''
    ? '<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:80px;vertical-align:top;">Sujet</td>'
      . '<td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">' . $e($subject) . '</td></tr>'
    : '';
$html = <<<HTML
<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(17,24,39,.08);">
      <tr><td style="background:#6366f1;background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 28px;">
        <p style="margin:0;color:#e0e7ff;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Portfolio · portfolio.bsandoz.fr</p>
        <h1 style="margin:6px 0 0;color:#ffffff;font-size:21px;font-weight:800;">📬 Nouveau message</h1>
      </td></tr>
      <tr><td style="padding:24px 28px 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:80px;vertical-align:top;">De</td>
              <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">{$e($name)}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;vertical-align:top;">E-mail</td>
              <td style="padding:6px 0;font-size:14px;"><a href="mailto:{$e($email)}" style="color:#6366f1;text-decoration:none;font-weight:600;">{$e($email)}</a></td></tr>
          {$subjectRow}
        </table>
      </td></tr>
      <tr><td style="padding:12px 28px 4px;">
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-left:4px solid #6366f1;border-radius:10px;padding:16px 18px;color:#1f2937;font-size:15px;line-height:1.65;white-space:pre-wrap;">{$e($message)}</div>
      </td></tr>
      <tr><td style="padding:20px 28px 26px;">
        <a href="{$e($replyHref)}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 22px;border-radius:9px;">Répondre à {$e($name)}</a>
      </td></tr>
      <tr><td style="padding:14px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
        Reçu le {$sentAt} via le formulaire de contact du portfolio.
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>
HTML;

$boundary = 'b_' . bin2hex(random_bytes(12));
$body = "--{$boundary}\r\n"
      . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
      . chunk_split(base64_encode($text)) . "\r\n"
      . "--{$boundary}\r\n"
      . "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
      . chunk_split(base64_encode($html)) . "\r\n"
      . "--{$boundary}--\r\n";

$headers = [
    'From: Portfolio Baptiste Sandoz <' . FROM_EMAIL . '>',
    'Reply-To: =?UTF-8?B?' . base64_encode($headerSafe($name)) . '?= <' . $headerSafe($email) . '>',
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
    'X-Mailer: portfolio-contact',
];

$sent = mail(
    TO_EMAIL,
    '=?UTF-8?B?' . base64_encode($headerSafe($mailSubject)) . '?=',
    $body,
    implode("\r\n", $headers),
    '-f' . FROM_EMAIL
);

if (!$sent) {
    reply(500, ['ok' => false, 'error' => "L'envoi a échoué. Écrivez-moi directement à " . TO_EMAIL . '.']);
}

reply(200, ['ok' => true]);
