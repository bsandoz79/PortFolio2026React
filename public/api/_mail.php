<?php
// Fonctions e-mail partagées par le formulaire (contact.php) et le relais de
// contact@bsandoz.fr (mail-pipe.php). Inaccessible depuis le web (.htaccess).

declare(strict_types=1);

const TO_EMAIL     = 'contact@bsandoz.fr';
const FROM_EMAIL   = 'contact@bsandoz.fr';
const PROTON_EMAIL = 'baptiste.sandoz@proton.me';
const SITE_URL     = 'https://portfolio.bsandoz.fr';
const PHONE        = '+33 7 69 28 78 37';
// Documents proposés dans l'accusé de réception (chemins sous public/).
// Un document absent du serveur est simplement omis.
const ACK_DOCUMENTS = [
    ['label' => 'Mon CV',                         'icon' => '📄', 'path' => '/assets/CV/CV_Baptiste_SANDOZ_-_EPSI_Mastere_Expert_DevOps.pdf'],
    ['label' => "Brochure de l'EPSI, mon école", 'icon' => '🎓', 'path' => '/assets/EPSI/Brochure_EPSI-WEB.pdf'],
];

date_default_timezone_set('Europe/Paris');

function e(string $v): string {
    return htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
}

// Pas de retour à la ligne dans les en-têtes (injection d'en-têtes)
function header_safe(string $v): string {
    return str_replace(["\r", "\n"], ' ', $v);
}

function encode_header(string $v): string {
    return '=?UTF-8?B?' . base64_encode(header_safe($v)) . '?=';
}

// E-mail multipart (texte + HTML) encodé en UTF-8
function send_mail(string $to, string $subject, string $text, string $html, array $headers): bool {
    $boundary = 'b_' . bin2hex(random_bytes(12));
    $body = "--{$boundary}\r\n"
          . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
          . chunk_split(base64_encode($text)) . "\r\n"
          . "--{$boundary}\r\n"
          . "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
          . chunk_split(base64_encode($html)) . "\r\n"
          . "--{$boundary}--\r\n";

    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: multipart/alternative; boundary="' . $boundary . '"';
    $headers[] = 'X-Mailer: portfolio-contact';

    return mail($to, encode_header($subject), $body, implode("\r\n", $headers), '-f' . FROM_EMAIL);
}

// Le prénom n'est repris que s'il ressemble à un nom (jamais de contenu arbitraire)
function greet_name(string $name): string {
    return preg_match("/^[\p{L}][\p{L} '\-]{0,39}$/u", $name) ? ' ' . $name : '';
}

/**
 * Accusé de réception : CV, brochure, téléphone et e-mail.
 * Ne recopie jamais le message reçu : l'expéditeur peut être usurpé, l'accusé
 * ne doit pas servir à relayer du contenu vers un tiers.
 * $origin : « le formulaire de contact » ou « contact@bsandoz.fr ».
 */
function send_ack(string $to, string $name, string $origin): bool {
    $greetName = greet_name($name);
    $sentAt    = date('d/m/Y à H:i');
    $phone     = PHONE;
    $phoneHref = 'tel:' . str_replace(' ', '', PHONE);

    $docs = [];
    foreach (ACK_DOCUMENTS as $doc) {
        if (is_file(dirname(__DIR__) . $doc['path'])) {
            $doc['url'] = SITE_URL . implode('/', array_map('rawurlencode', explode('/', $doc['path'])));
            $docs[] = $doc;
        }
    }

    $text = "Bonjour{$greetName},\n\n"
          . "Merci pour votre message, je l'ai bien reçu.\n"
          . "Je le traite personnellement et vous réponds sous 24 h (jours ouvrés).\n\n"
          . ($docs ? "Documents à télécharger :\n" . implode('', array_map(static fn($d) => "- {$d['label']} : {$d['url']}\n", $docs)) . "\n" : '')
          . "Me joindre directement :\n- Téléphone : " . PHONE . "\n- E-mail : " . FROM_EMAIL . "\n\n"
          . "Portfolio : " . SITE_URL . "\n\n"
          . "Bien cordialement,\n\nBaptiste Sandoz\nDéveloppeur Full Stack — Mastère Expert DevOps (EPSI Arras)\n"
          . PHONE . " · contact@bsandoz.fr · https://portfolio.bsandoz.fr\n"
          . "LinkedIn : https://www.linkedin.com/in/baptiste-sandoz · GitHub : https://github.com/bsandoz79\n\n"
          . "Ceci est une réponse automatique, envoyée suite à votre message du {$sentAt} via {$origin}.";

    $docRows = '';
    foreach ($docs as $d) {
        $docRows .= '<tr><td style="padding:6px 0;">'
                  . '<a href="' . e($d['url']) . '" style="display:block;background:#ffffff;border:1px solid #e0e7ff;border-radius:9px;padding:12px 14px;color:#4338ca;text-decoration:none;font-size:14px;font-weight:700;">'
                  . $d['icon'] . '&nbsp; ' . e($d['label']) . ' <span style="color:#9ca3af;font-weight:400;">— PDF</span></a></td></tr>';
    }
    $docsBlock = $docRows === '' ? '' : <<<HTML
      <tr><td style="padding:8px 32px 4px;">
        <p style="margin:0 0 6px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Documents à télécharger</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">{$docRows}</table>
      </td></tr>
HTML;

    $greet = e($greetName);
    $originHtml = e($origin);
    $html = <<<HTML
<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(17,24,39,.08);">
      <tr><td style="background:#6366f1;background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;">
        <p style="margin:0;color:#e0e7ff;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Baptiste Sandoz · Développeur Full Stack</p>
        <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:800;">Message bien reçu ✓</h1>
      </td></tr>
      <tr><td style="padding:28px 32px 8px;color:#1f2937;font-size:15px;line-height:1.7;">
        <p style="margin:0 0 14px;">Bonjour{$greet},</p>
        <p style="margin:0 0 14px;">Merci pour votre message, je l'ai bien reçu.</p>
        <p style="margin:0 0 8px;">Je le traite personnellement et vous réponds <strong>sous 24&nbsp;h</strong> (jours ouvrés).</p>
      </td></tr>
{$docsBlock}
      <tr><td style="padding:14px 32px 4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border:1px solid #e0e7ff;border-radius:10px;">
          <tr><td style="padding:14px 18px;font-size:14px;color:#374151;line-height:1.9;">
            <span style="color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Me joindre directement</span><br>
            📞&nbsp; <a href="{$phoneHref}" style="color:#4338ca;text-decoration:none;font-weight:700;">{$phone}</a><br>
            ✉️&nbsp; <a href="mailto:contact@bsandoz.fr" style="color:#4338ca;text-decoration:none;font-weight:700;">contact@bsandoz.fr</a>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:22px 32px 8px;">
        <a href="https://portfolio.bsandoz.fr" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:9px;">Voir mon portfolio</a>
      </td></tr>
      <tr><td style="padding:24px 32px 28px;">
        <p style="margin:0 0 4px;color:#1f2937;font-size:15px;">Bien cordialement,</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:14px;border-top:1px solid #e5e7eb;padding-top:14px;width:100%;">
          <tr><td style="padding-top:14px;">
            <p style="margin:0;color:#111827;font-size:15px;font-weight:800;">Baptiste Sandoz</p>
            <p style="margin:2px 0 8px;color:#6b7280;font-size:13px;">Développeur Full Stack · Mastère Expert DevOps (EPSI Arras)</p>
            <p style="margin:0;font-size:13px;line-height:1.8;">
              <a href="{$phoneHref}" style="color:#6366f1;text-decoration:none;">{$phone}</a>
              &nbsp;·&nbsp;<a href="mailto:contact@bsandoz.fr" style="color:#6366f1;text-decoration:none;">contact@bsandoz.fr</a>
              &nbsp;·&nbsp;<a href="https://portfolio.bsandoz.fr" style="color:#6366f1;text-decoration:none;">portfolio.bsandoz.fr</a><br>
              <a href="https://www.linkedin.com/in/baptiste-sandoz" style="color:#6366f1;text-decoration:none;">LinkedIn</a>
              &nbsp;·&nbsp;<a href="https://github.com/bsandoz79" style="color:#6366f1;text-decoration:none;">GitHub</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:14px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;line-height:1.5;">
        Réponse automatique suite à votre message du {$sentAt} via {$originHtml}. Si vous n'êtes pas à l'origine de ce message, vous pouvez ignorer cet e-mail.
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>
HTML;

    return send_mail($to, 'Votre message a bien été reçu — Baptiste Sandoz', $text, $html, [
        'From: Baptiste Sandoz <' . FROM_EMAIL . '>',
        'Reply-To: Baptiste Sandoz <' . FROM_EMAIL . '>',
        'Auto-Submitted: auto-replied',
    ]);
}
