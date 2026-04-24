import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { profil, competenceBadges, techBadges } from '../../data/portfolio';
import styles from './About.module.css';

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };

export default function About() {
  const [photoOpen, setPhotoOpen] = useState(false);

  return (
    <section id="about" className={`section ${styles.about}`}>
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.p className="section-label" variants={fadeUp}>À propos</motion.p>
          <motion.h2 className="section-title" variants={fadeUp}>Qui suis-je ?</motion.h2>
          <motion.p className="section-sub" variants={fadeUp} style={{ marginBottom: 48 }}>
            Développeur Fullstack Junior, je recherche une alternance de 24 mois dès Septembre 2026.
          </motion.p>

          <div className={styles.topRow}>
            {/* Photo + infos rapides */}
            <motion.div className={styles.photoCol} variants={fadeUp}>
              <div
                className={styles.photoFrame}
                onClick={() => setPhotoOpen(true)}
                title="Agrandir la photo"
              >
                <img src="/assets/pdp1.jpg" alt="Baptiste Sandoz" />
              </div>
              <div className={styles.quickInfo}>
                <span>📍 Amiens, France</span>
                <span>🎂 20 ans — 07/09/2005</span>
                <span>🚗 Permis B — véhiculé</span>
                <span>🌐 Anglais B1 · Français natif</span>
              </div>
            </motion.div>

            {/* Bio + badges */}
            <motion.div className={styles.bioCol} variants={fadeUp}>
              <div className={styles.profileLabel}>
                <span className={styles.badge2}>Développeur Fullstack Junior</span>
                <span className={styles.badgeSchool}>Mastère · école iT Amiens</span>
              </div>
              <p className={styles.bio}>{profil.bio}</p>

              <h4 className={styles.badgeTitle}>Compétences clés</h4>
              <div className={styles.badges}>
                {competenceBadges.map((b) => (
                  <span key={b} className={styles.badge}>{b}</span>
                ))}
              </div>

              <h4 className={styles.badgeTitle} style={{ marginTop: 16 }}>Technologies</h4>
              <div className={styles.badges}>
                {techBadges.map((b) => (
                  <span key={b} className={`${styles.badge} ${styles.badgeTech}`}>{b}</span>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div className={styles.cvBlock} variants={fadeUp}>
            <div className={styles.cvInfo}>
              <h3>Mon CV</h3>
              <p>Alternance 24 mois — dès Septembre 2026 · Mastère Informatique</p>
            </div>
            <div className={styles.cvBtns}>
              <a
                href="/assets/CV/CV Alternancce M1 Sandoz Baptiste_PDF_.pdf"
                target="_blank"
                rel="noopener"
                className={styles.btnView}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Visualiser
              </a>
              <a
                href="/assets/CV/CV Alternancce M1 Sandoz Baptiste_PDF_.pdf"
                download
                className={styles.btnDl}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Télécharger
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Modal photo ── */}
      <AnimatePresence>
        {photoOpen && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setPhotoOpen(false)}
          >
            <motion.img
              src="/assets/pdp1.jpg"
              alt="Baptiste Sandoz"
              className={styles.modalImg}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className={styles.modalClose}
              onClick={() => setPhotoOpen(false)}
              aria-label="Fermer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
