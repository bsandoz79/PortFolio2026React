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

$mailSubject = '[Portfolio] ' . ($subject !== '' ? $subject : 'Nouveau message de ' . $name);
$body = "Nom : {$name}\nE-mail : {$email}\n"
      . ($subject !== '' ? "Sujet : {$subject}\n" : '')
      . "\n{$message}\n\n--\nEnvoyé depuis portfolio.bsandoz.fr le " . date('d/m/Y à H:i');

$headers = [
    'From: Portfolio Baptiste Sandoz <' . FROM_EMAIL . '>',
    'Reply-To: ' . $headerSafe($name) . ' <' . $headerSafe($email) . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
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
