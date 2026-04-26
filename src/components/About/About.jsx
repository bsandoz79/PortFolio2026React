import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { profil, competenceBadges, techBadges } from '../../data/portfolio';
import styles from './About.module.css';

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };

export default function About() {
  const [photoOpen, setPhotoOpen] = useState(false);
  const [showCV, setShowCV] = useState(false);

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
            Étudiant en Mastère Informatique, je recherche une alternance de 12 à 24 mois dès Septembre 2026.
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
                <span className={styles.badge2}>Étudiant en Mastère Informatique</span>
                <span className={styles.badgeSchool}>Mastère · école iT Amiens</span>
              </div>
              <p className={styles.bio}>{profil.bio}</p>

              <h4 className={styles.badgeTitle}>Compétences clés</h4>
              <div className={styles.marqueeWrapper}>
                <div className={`${styles.marqueeTrack} ${styles.marqueeReverse}`}>
                  {[...competenceBadges, ...competenceBadges].map((b, i) => (
                    <span key={i} className={styles.badge}>{b}</span>
                  ))}
                </div>
              </div>

              <h4 className={styles.badgeTitle} style={{ marginTop: 16 }}>Technologies</h4>
              <div className={styles.marqueeWrapper}>
                <div className={styles.marqueeTrack}>
                  {[...techBadges, ...techBadges].map((b, i) => (
                    <span key={i} className={`${styles.badge} ${styles.badgeTech}`}>{b}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Bloc alternance ── */}
          <motion.div className={styles.altBlock} variants={fadeUp}>
            <div className={styles.altHeader}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              <span>Informations Alternance</span>
              <a
                href="https://ecole-it.com/formations/mastere-architecture-et-developpement-logiciel-big-data-intelligence-artificielle/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.altLink}
              >
                Voir la formation
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
            <div className={styles.altGrid}>
              <div className={styles.altItem}>
                <span className={styles.altLabel}>Formation</span>
                <span className={styles.altValue}>Mastère Architecture & Dev Logiciel<br/><em>Big Data / Intelligence Artificielle</em></span>
              </div>
              <div className={styles.altItem}>
                <span className={styles.altLabel}>Niveau obtenu</span>
                <span className={styles.altValue}>Bac+5 — RNCP Niveau 7<br/><em>Titre 38822</em></span>
              </div>
              <div className={styles.altItem}>
                <span className={styles.altLabel}>Rythme</span>
                <span className={styles.altValue}>1 semaine école<br/><em>3 semaines en entreprise</em></span>
              </div>
              <div className={styles.altItem}>
                <span className={styles.altLabel}>Durée</span>
                <span className={styles.altValue}>2 ans<br/><em>Dès Septembre / Octobre 2026</em></span>
              </div>
              <div className={styles.altItem}>
                <span className={styles.altLabel}>École</span>
                <span className={styles.altValue}>École iT — Amiens<br/><em>784h · 90% présentiel</em></span>
              </div>
              <div className={styles.altItem}>
                <span className={styles.altLabel}>Contrat</span>
                <span className={styles.altValue}>Apprentissage ou<br/><em>professionnalisation</em></span>
              </div>
            </div>
            {/* ── Grille salariale ── */}
            <div className={styles.salaryBlock}>
              <p className={styles.salaryTitle}>
                💰 Grille salariale minimale
                <span className={styles.salaryRef}>Base SMIC 2026 · 1 823,03 €/mois brut · 12,02 €/h · en vigueur au 1ᵉʳ jan. 2026</span>
              </p>
              <div className={styles.salaryTable}>
                <div className={`${styles.salaryRow} ${styles.salaryHead}`}>
                  <span>Tranche d'âge</span>
                  <span>1ère année</span>
                  <span>2ème année</span>
                </div>
                <div className={styles.salaryRow}>
                  <span>18 – 20 ans</span>
                  <span>43% · <strong>784 €</strong></span>
                  <span>51% · <strong>930 €</strong></span>
                </div>
                <div className={`${styles.salaryRow} ${styles.salaryHighlight}`}>
                  <span>21 – 25 ans <em>Mon cas</em></span>
                  <span>53% · <strong>966 €</strong></span>
                  <span>61% · <strong>1 112 €</strong></span>
                </div>
                <div className={styles.salaryRow}>
                  <span>26 ans et +</span>
                  <span>100% · <strong>1 823 €</strong></span>
                  <span>100% · <strong>1 823 €</strong></span>
                </div>
              </div>
              <p className={styles.salaryNote}>Montants bruts mensuels minimums légaux au 1ᵉʳ janvier 2026. Les conventions collectives peuvent prévoir des salaires supérieurs.</p>
            </div>
          </motion.div>

          <motion.div className={styles.cvBlock} variants={fadeUp}>
            <div className={styles.cvInfo}>
              <h3>Mon CV</h3>
              <p>Alternance 12 à 24 mois — dès Septembre 2026 · Mastère Informatique</p>
            </div>
            <div className={styles.cvBtns}>
              <label className={styles.cvToggleLabel}>
                <span className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={showCV}
                    onChange={e => setShowCV(e.target.checked)}
                  />
                  <span className={styles.slider} />
                </span>
                Afficher le CV
              </label>
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

          {showCV && (
            <div style={{ margin: '32px auto', maxWidth: 900, boxShadow: '0 2px 16px rgba(0,0,0,0.10)', borderRadius: 12, overflow: 'hidden', background: 'white' }}>
              <iframe
                src="/assets/CV/CV Alternancce M1 Sandoz Baptiste_PDF_.pdf"
                title="CV Baptiste Sandoz"
                width="100%"
                height="700px"
                style={{ border: 'none', display: 'block', width: '100%' }}
                allow="autoplay"
              />
            </div>
          )}
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
