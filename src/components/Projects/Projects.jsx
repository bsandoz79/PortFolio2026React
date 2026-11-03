import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { orderedProjects, filters } from '../../data/portfolio';
import { TYPE_COLORS } from './typeColors';
import styles from './Projects.module.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };


/* ── Carrousel de captures (page projet) ── */
export function ProjectCarousel({ project }) {
  const shots  = project.showcase?.screenshots ?? [];
  const labels = project.showcase?.screenshotLabels ?? [];
  const [imgIdx, setImgIdx] = useState(0);
  const [dir, setDir]       = useState(1);

  const goImg = (d) => {
    setDir(d);
    setImgIdx(p => (p + d + shots.length) % shots.length);
  };

  useEffect(() => {
    if (shots.length < 2) return;
    const h = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === 'ArrowRight') goImg(1);
      if (e.key === 'ArrowLeft')  goImg(-1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const imgVariants = {
    enter: (d) => ({ x: d > 0 ? '40%' : '-40%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d) => ({ x: d > 0 ? '-40%' : '40%', opacity: 0 }),
  };

  if (shots.length === 0) {
    return (
      <div className={styles.showcaseNoImg}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9l6 6M15 9l-6 6"/></svg>
        <span>Pas de captures disponibles</span>
      </div>
    );
  }

  return (
    <div className={styles.showcaseCarousel}>
      <div className={styles.showcaseImgClip}>
        {shots.length > 1 && (
          <button className={`${styles.scArrow} ${styles.scArrowL}`} onClick={() => goImg(-1)} aria-label="Capture précédente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}
        <AnimatePresence custom={dir} mode="wait">
          <motion.img
            key={imgIdx}
            src={shots[imgIdx]}
            alt={labels[imgIdx] ?? project.title}
            className={styles.showcaseImg}
            custom={dir}
            variants={imgVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            onError={e => { e.target.src = '/assets/project/noimage.webp'; }}
          />
        </AnimatePresence>
        {shots.length > 1 && (
          <button className={`${styles.scArrow} ${styles.scArrowR}`} onClick={() => goImg(1)} aria-label="Capture suivante">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        )}
      </div>
      {shots.length > 1 && (
        <div className={styles.scDots}>
          {shots.map((_, i) => (
            <button key={i} className={`${styles.scDot} ${i === imgIdx ? styles.scDotActive : ''}`} onClick={() => { setDir(i > imgIdx ? 1 : -1); setImgIdx(i); }} title={labels[i] ?? `${i+1}`}>
              {labels[i] ? <span>{labels[i]}</span> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Project card ── */
const MotionLink = motion.create(Link);

function ProjectCard({ project }) {
  const colors = TYPE_COLORS[project.showcase?.typeColor] ?? TYPE_COLORS.accent;
  return (
    <MotionLink
      to={`/projets/${project.slug}`}
      className={`${styles.card} ${project.featured ? styles.cardFeatured : ''}`}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.22 }}
    >
      <div className={styles.imgWrap}>
        <img
          src={project.img}
          alt={project.title}
          onError={e => { e.target.src = '/assets/project/noimage.webp'; }}
        />
        <span className={styles.dateTag}>{project.date}</span>
        {project.showcase?.type && (
          <span className={styles.typeTag} style={{ background: colors.bg, color: colors.color }}>
            {project.showcase.type}
          </span>
        )}
        {project.featured && <span className={styles.featuredTag}>⭐ Projet phare</span>}
        <div className={styles.cardOverlay}>
          <span>Voir le projet →</span>
        </div>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.desc}>{project.description}</p>
        <div className={styles.techs}>
          {project.techs.map(t => <span key={t} className={styles.tech}>{t}</span>)}
        </div>
      </div>
    </MotionLink>
  );
}

/* ── Game modal ── */
export function GameModal({ project, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <motion.div
      className={styles.gameOverlay}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.gamePanel}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.gameHeader}>
          <span className={styles.gameHeaderTitle}>🎮 {project.title}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={project.gameUrl} target="_blank" rel="noopener" className={styles.gameNewTab} title="Ouvrir dans un nouvel onglet">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Plein écran
            </a>
            <button className={styles.showcaseClose} onClick={onClose}>✕</button>
          </div>
        </div>
        <iframe
          src={project.gameUrl}
          title={project.title}
          className={styles.gameFrame}
          allowFullScreen
        />
      </motion.div>
    </motion.div>
  );
}

/* ── Section principale ── */
export default function Projects() {
  const [active, setActive] = useState('all');

  const filtered = active === 'all'
    ? orderedProjects.filter(p => !p.tags.includes('jeu'))
    : orderedProjects.filter(p => p.tags.includes(active));

  return (
    <section id="projects" className={`section ${styles.projects}`}>
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p className="section-label" variants={fadeUp}>Projets</motion.p>
          <motion.h2 className="section-title" variants={fadeUp}>Mes réalisations</motion.h2>
          <motion.p className="section-sub" variants={fadeUp} style={{ marginBottom: 32 }}>
            Des projets variés alliant web, mobile et applications desktop, développés durant mes études et en autonomie.
          </motion.p>

          <motion.div className={styles.filters} variants={fadeUp}>
            {filters.map(f => (
              <button
                key={f.key}
                className={`${styles.filterBtn} ${active === f.key ? styles.filterActive : ''}`}
                onClick={() => setActive(f.key)}
              >
                {f.label}
              </button>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className={styles.grid} layout>
          <AnimatePresence>
            {filtered.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
