import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Contact.module.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

const CONTACT_INFO = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    ),
    label: 'Téléphone',
    value: '+33 7 69 28 78 37',
    href: 'tel:+33769287837',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    ),
    label: 'Email',
    value: 'baptiste.sandoz@proton.me',
    href: 'mailto:baptiste.sandoz@proton.me',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    ),
    label: 'Localisation',
    value: 'Amiens, France',
    href: null,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
    label: 'Disponibilité',
    value: 'Lun – Ven, 9h – 18h',
    href: null,
  },
];

export default function Contact() {
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const form = e.target;
    const data = new FormData(form);
    try {
      const res = await fetch('https://formspree.io/f/mbloljne', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setStatus('sent');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className={`section ${styles.contact}`}>
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p className="section-label" variants={fadeUp}>Contact</motion.p>
          <motion.h2 className="section-title" variants={fadeUp}>Restons en contact</motion.h2>
          <motion.p className="section-sub" variants={fadeUp} style={{ marginBottom: 48 }}>
            Une question, une opportunité ou un projet ? N'hésitez pas à me contacter.
          </motion.p>

          <div className={styles.grid}>
            <motion.div className={styles.info} variants={fadeUp}>
              <div className={styles.infoCards}>
                {CONTACT_INFO.map((c) => (
                  <div key={c.label} className={styles.infoCard}>
                    <div className={styles.infoIcon}>{c.icon}</div>
                    <div>
                      <p className={styles.infoLabel}>{c.label}</p>
                      {c.href ? (
                        <a href={c.href} className={styles.infoValue}>{c.value}</a>
                      ) : (
                        <p className={styles.infoValue}>{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.mapWrap}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d82240.15837856011!2d2.28468135!3d49.8987104!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e78413d78b760b%3A0x40af13e816220e0!2sAmiens!5e0!3m2!1sfr!2sfr!4v1745582517399!5m2!1sfr!2sfr"
                  title="Amiens, France"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0 }}
                />
              </div>
            </motion.div>

            <motion.form
              className={styles.form}
              variants={fadeUp}
              onSubmit={handleSubmit}
            >
              <input type="text" name="_gotcha" style={{ display: 'none' }} />

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="nom">Nom</label>
                  <input id="nom" name="nom" type="text" placeholder="Votre nom" required />
                </div>
                <div className={styles.field}>
                  <label htmlFor="prenom">Prénom</label>
                  <input id="prenom" name="prenom" type="text" placeholder="Votre prénom" required />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="votre.email@exemple.com" required />
              </div>

              <div className={styles.field}>
                <label htmlFor="sujet">Sujet</label>
                <select id="sujet" name="sujet" required defaultValue="">
                  <option value="" disabled>Sélectionnez un sujet</option>
                  <option value="projet">Projet</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="question">Question</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={5} placeholder="Votre message..." required />
              </div>

              <button
                type="submit"
                className={styles.submit}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Envoi...' : 'Envoyer le message'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>

              {status === 'sent' && (
                <p className={styles.successMsg}>Message envoyé avec succès !</p>
              )}
              {status === 'error' && (
                <p className={styles.errorMsg}>Une erreur s'est produite. Veuillez réessayer.</p>
              )}
            </motion.form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
