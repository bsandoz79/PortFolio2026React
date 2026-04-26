import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MarbleRun from '../MarbleRun/MarbleRun';
import styles from './Hero.module.css';

const TYPED_WORDS = [
  'Étudiant en Mastère Informatique',
  'Passionné de cybersécurité',
  'En recherche d\'alternance 12–24 mois',
  'React · PHP · Python · SQL',
];

const WALL_LOGOS = [
  { src: '/assets/skills/react.png',      name: 'React',      top: '7%',  left: '62%' },
  { src: '/assets/skills/html.png',       name: 'HTML',       top: '22%', left: '6%'  },
  { src: '/assets/skills/css.png',        name: 'CSS',        top: '56%', left: '8%'  },
  { src: '/assets/skills/javascript.png', name: 'JavaScript', top: '40%', left: '80%' },
  { src: '/assets/skills/php.png',        name: 'PHP',        top: '73%', left: '72%' },
  { src: '/assets/skills/python.jpg',     name: 'Python',     top: '88%', left: '18%' },
];

function TypingText() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const timeout = useRef(null);

  useEffect(() => {
    const word = TYPED_WORDS[wordIndex];
    if (!deleting && displayed.length < word.length) {
      timeout.current = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 62);
    } else if (!deleting && displayed.length === word.length) {
      timeout.current = setTimeout(() => setDeleting(true), 1900);
    } else if (deleting && displayed.length > 0) {
      timeout.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 36);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % TYPED_WORDS.length);
    }
    return () => clearTimeout(timeout.current);
  }, [displayed, deleting, wordIndex]);

  return (
    <span className={styles.typed}>
      {displayed}
      <span className={styles.cursor}>|</span>
    </span>
  );
}

export default function Hero() {
  const scroll = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const [photoOpen, setPhotoOpen] = useState(false);

  return (
    <section id="hero" className={styles.hero}>
      {/* Decorative gradient orbs behind left content */}
      <div className={styles.orbA} />
      <div className={styles.orbB} />

      {/* ── LEFT ── */}
      <div className={styles.left}>

        {/* Disponibilité badge */}
        <motion.div
          className={styles.availBadge}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <span className={styles.availDot} />
          Disponible — Alternance Mastère · Sept. 2026
        </motion.div>

        <motion.p
          className={styles.greeting}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Bonjour, je suis
        </motion.p>

        <motion.h1
          className={styles.name}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.55 }}
        >
          Baptiste<br />
          <span className={styles.nameAccent}>Sandoz</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={styles.typedWrap}
        >
          <TypingText />
        </motion.div>

        <motion.p
          className={styles.bio}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
        >
          Étudiant en Mastère Informatique à l'école iT d'Amiens, passionné
          par le développement web et la cybersécurité. Je recherche une
          alternance de 12 à 24 mois dès Septembre 2026.
        </motion.p>

        <motion.div
          className={styles.ctas}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <button className={styles.btnPrimary} onClick={() => scroll('projects')}>
            Voir mes projets
          </button>
          <button className={styles.btnSecondary} onClick={() => scroll('contact')}>
            Me contacter
          </button>
          <a
            href="https://www.linkedin.com/in/baptiste-sandoz"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnLinkedin}
            aria-label="LinkedIn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
          <a
            href="https://github.com/bsandoz79"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnGithub}
            aria-label="GitHub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
        </motion.div>

        <motion.div
          className={styles.stats}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.92 }}
        >
          <div className={styles.stat}>
            <strong>10+</strong>
            <span>Technologies</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <strong>6</strong>
            <span>Projets</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <strong>3</strong>
            <span>Expériences</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <strong>2</strong>
            <span>Certifications</span>
          </div>
        </motion.div>

        {/* Photo + info rapide */}
        <motion.div
          className={styles.photoRow}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05 }}
        >
          <div
            className={styles.avatarWrap}
            onClick={() => setPhotoOpen(true)}
            title="Agrandir la photo"
          >
            <img src="/assets/pdp1.jpg" alt="Baptiste Sandoz" />
          </div>
          <div className={styles.photoInfo}>
            <strong>Baptiste Sandoz</strong>
            <span>20 ans · Amiens, France · Permis B</span>
            <span>baptiste.sandoz@proton.me</span>
          </div>
        </motion.div>

        <motion.button
          className={styles.scrollDown}
          onClick={() => scroll('about')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          aria-label="Défiler vers le bas"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          Découvrir
        </motion.button>
      </div>

      {/* ── RIGHT — marble run ── */}
      <motion.div
        className={styles.right}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, duration: 0.7 }}
      >
        {WALL_LOGOS.map((logo) => (
          <motion.div
            key={logo.name}
            className={styles.wallLogo}
            style={{ top: logo.top, left: logo.left }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + Math.random() * 0.5, type: 'spring', stiffness: 200 }}
          >
            <img src={logo.src} alt={logo.name} />
            <span>{logo.name}</span>
          </motion.div>
        ))}
        <MarbleRun />
      </motion.div>

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
