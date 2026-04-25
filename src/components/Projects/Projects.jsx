import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects, filters } from '../../data/portfolio';
import styles from './Projects.module.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

const TYPE_COLORS = {
  orange: { bg: 'rgba(245,158,11,.12)', color: '#d97706', border: 'rgba(245,158,11,.3)' },
  green:  { bg: 'rgba(16,185,129,.10)', color: '#059669', border: 'rgba(16,185,129,.25)' },
  accent: { bg: 'rgba(99,102,241,.10)', color: '#6366f1', border: 'rgba(99,102,241,.25)' },
};

/* ── Showcase modal ── */
function ShowcaseModal({ project, onClose }) {
  const { showcase } = project;
  const [imgIdx, setImgIdx]   = useState(0);
  const [dir, setDir]         = useState(1);
  const shots = showcase.screenshots ?? [];
  const labels = showcase.screenshotLabels ?? [];
  const colors = TYPE_COLORS[showcase.typeColor] ?? TYPE_COLORS.accent;

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onClose();
      if (shots.length > 1 && e.key === 'ArrowRight') goImg(1);
      if (shots.length > 1 && e.key === 'ArrowLeft')  goImg(-1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, shots.length, imgIdx]);

  const goImg = (d) => {
    setDir(d);
    setImgIdx(p => (p + d + shots.length) % shots.length);
  };

  const imgVariants = {
    enter: (d) => ({ x: d > 0 ? '40%' : '-40%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d) => ({ x: d > 0 ? '-40%' : '40%', opacity: 0 }),
  };

  return (
    <motion.div
      className={styles.showcaseOverlay}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.showcasePanel}
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className={styles.showcaseHeader}>
          <div className={styles.showcaseMeta}>
            <span className={styles.showcaseTypeBadge} style={{ background: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }}>
              {showcase.type}
            </span>
            <h2 className={styles.showcaseTitle}>{project.title}</h2>
            <span className={styles.showcaseDate}>{project.date}</span>
          </div>
          <button className={styles.showcaseClose} onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {/* ── Body ── */}
        <div className={styles.showcaseBody}>

          {/* Colonne gauche : screenshots + techs */}
          <div className={styles.showcaseLeft}>
            {shots.length > 0 ? (
              <div className={styles.showcaseCarousel}>
                <div className={styles.showcaseImgClip}>
                  {shots.length > 1 && (
                    <button className={`${styles.scArrow} ${styles.scArrowL}`} onClick={() => goImg(-1)}>
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
                      onError={e => { e.target.src = '/assets/project/noimage.png'; }}
                    />
                  </AnimatePresence>
                  {shots.length > 1 && (
                    <button className={`${styles.scArrow} ${styles.scArrowR}`} onClick={() => goImg(1)}>
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
            ) : (
              <div className={styles.showcaseNoImg}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9l6 6M15 9l-6 6"/></svg>
                <span>Pas de captures disponibles</span>
              </div>
            )}

            {/* Tech stack */}
            <div className={styles.showcaseTechBlock}>
              <p className={styles.showcaseSectionLabel}>Stack technique</p>
              <div className={styles.showcaseTechs}>
                {project.techs.map(t => <span key={t} className={styles.showcaseTech}>{t}</span>)}
              </div>
            </div>
          </div>

          {/* Colonne droite : détails */}
          <div className={styles.showcaseRight}>
            <div className={styles.showcaseSection}>
              <p className={styles.showcaseSectionLabel}>📋 Contexte</p>
              <p className={styles.showcaseText}>{showcase.context}</p>
            </div>
            <div className={styles.showcaseSection}>
              <p className={styles.showcaseSectionLabel}>🎯 Objectif</p>
              <p className={styles.showcaseText}>{showcase.goal}</p>
            </div>
            <div className={styles.showcaseSection}>
              <p className={styles.showcaseSectionLabel}>✨ Fonctionnalités</p>
              <ul className={styles.showcaseFeatures}>
                {showcase.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
            <div className={styles.showcaseSection}>
              <p className={styles.showcaseSectionLabel}>📚 Ce que ça m'a appris</p>
              <p className={styles.showcaseText}>{showcase.learned}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Project card ── */
function ProjectCard({ project, onOpen }) {
  const colors = TYPE_COLORS[project.showcase?.typeColor] ?? TYPE_COLORS.accent;
  return (
    <motion.div
      className={styles.card}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.22 }}
      onClick={() => onOpen(project)}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.imgWrap}>
        <img
          src={project.img}
          alt={project.title}
          onError={e => { e.target.src = '/assets/project/noimage.png'; }}
        />
        <span className={styles.dateTag}>{project.date}</span>
        {project.showcase?.type && (
          <span className={styles.typeTag} style={{ background: colors.bg, color: colors.color }}>
            {project.showcase.type}
          </span>
        )}
        <div className={styles.cardOverlay}>
          <span>Voir la vitrine →</span>
        </div>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.desc}>{project.description}</p>
        <div className={styles.techs}>
          {project.techs.map(t => <span key={t} className={styles.tech}>{t}</span>)}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Section principale ── */
export default function Projects() {
  const [active, setActive]       = useState('all');
  const [showcase, setShowcase]   = useState(null);

  const filtered = (active === 'all' ? projects : projects.filter(p => p.tags.includes(active)))
    .slice()
    .reverse();

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
              <ProjectCard key={p.id} project={p} onOpen={setShowcase} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {showcase && <ShowcaseModal project={showcase} onClose={() => setShowcase(null)} />}
      </AnimatePresence>
    </section>
  );
}
