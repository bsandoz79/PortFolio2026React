import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { orderedProjects } from '../data/portfolio';
import { ProjectCarousel, GameModal } from '../components/Projects/Projects';
import { TYPE_COLORS } from '../components/Projects/typeColors';
import projStyles from '../components/Projects/Projects.module.css';
import styles from './ProjectPage.module.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

const SITE_TITLE = 'Baptiste Sandoz — Développeur Full Stack';

function usePageMeta(project) {
  useEffect(() => {
    if (!project) return;
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content');
    const prevTitle = document.title;
    document.title = `${project.title} — Projet | ${SITE_TITLE}`;
    meta?.setAttribute('content', project.description);
    return () => {
      document.title = prevTitle;
      if (prevDesc) meta?.setAttribute('content', prevDesc);
    };
  }, [project]);
}

function Section({ icon, label, children }) {
  return (
    <motion.section className={styles.block} variants={fadeUp}>
      <h2 className={projStyles.showcaseSectionLabel}>{icon} {label}</h2>
      {children}
    </motion.section>
  );
}

export default function ProjectPage() {
  const { slug } = useParams();
  const index = orderedProjects.findIndex((p) => p.slug === slug);
  const project = orderedProjects[index];
  const [playing, setPlaying] = useState(false);

  usePageMeta(project);

  if (!project) return <Navigate to="/#projects" replace />;

  const { showcase = {} } = project;
  const colors = TYPE_COLORS[showcase.typeColor] ?? TYPE_COLORS.accent;
  const prev = orderedProjects[(index - 1 + orderedProjects.length) % orderedProjects.length];
  const next = orderedProjects[(index + 1) % orderedProjects.length];

  return (
    <main className={`section ${styles.page}`}>
      <motion.div
        key={project.slug}
        className="container"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.div variants={fadeUp}>
          <Link to="/#projects" className={styles.back}>← Tous les projets</Link>
        </motion.div>

        {/* ── En-tête ── */}
        <motion.header className={styles.header} variants={fadeUp}>
          <div className={styles.meta}>
            {showcase.type && (
              <span className={projStyles.showcaseTypeBadge} style={{ background: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }}>
                {showcase.type}
              </span>
            )}
            {project.featured && <span className={styles.featured}>⭐ Projet phare</span>}
            <span className={styles.date}>{project.date}</span>
          </div>
          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.lead}>{project.description}</p>

          <div className={styles.actions}>
            {project.liveUrl && (
              <a className={projStyles.tryBtn} href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                🚀 Voir la démo
              </a>
            )}
            {project.gameUrl && (
              <button className={projStyles.tryBtn} onClick={() => setPlaying(true)}>
                🎮 Essayer le jeu
              </button>
            )}
            {project.githubUrl && (
              <a className={styles.ghostBtn} href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                💻 Code sur GitHub
              </a>
            )}
          </div>
        </motion.header>

        {/* ── Captures ── */}
        <motion.div className={styles.gallery} variants={fadeUp}>
          <ProjectCarousel key={project.slug} project={project} />
        </motion.div>

        {/* ── Contenu ── */}
        <div className={styles.grid}>
          <div className={styles.main}>
            <Section icon="❓" label={showcase.problem ? 'Le problème' : 'Contexte'}>
              <p className={projStyles.showcaseText}>{showcase.problem ?? showcase.context}</p>
            </Section>
            <Section icon="💡" label={showcase.solution ? 'La solution' : 'Objectif'}>
              <p className={projStyles.showcaseText}>{showcase.solution ?? showcase.goal}</p>
            </Section>
            {showcase.features?.length > 0 && (
              <Section icon="✨" label="Fonctionnalités">
                <ul className={projStyles.showcaseFeatures}>
                  {showcase.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </Section>
            )}
            {showcase.learned && (
              <Section icon="📚" label="Ce que ça m'a appris">
                <p className={projStyles.showcaseText}>{showcase.learned}</p>
              </Section>
            )}
          </div>

          <motion.aside className={styles.aside} variants={fadeUp}>
            <div className={styles.card}>
              <h2 className={projStyles.showcaseSectionLabel}>🧰 Stack technique</h2>
              <div className={projStyles.showcaseTechs}>
                {project.techs.map((t) => <span key={t} className={projStyles.showcaseTech}>{t}</span>)}
              </div>
            </div>
            {showcase.problem && showcase.context && (
              <div className={styles.card}>
                <h2 className={projStyles.showcaseSectionLabel}>📋 Contexte</h2>
                <p className={projStyles.showcaseText}>{showcase.context}</p>
              </div>
            )}
            <Link to="/#contact" className={styles.cta}>
              <strong>Un projet similaire ?</strong>
              <span>Discutons-en →</span>
            </Link>
          </motion.aside>
        </div>

        {/* ── Navigation entre projets ── */}
        <motion.nav className={styles.pager} variants={fadeUp} aria-label="Autres projets">
          <Link to={`/projets/${prev.slug}`} className={styles.pagerLink}>
            <span>← Précédent</span>
            <strong>{prev.title}</strong>
          </Link>
          <Link to={`/projets/${next.slug}`} className={`${styles.pagerLink} ${styles.pagerNext}`}>
            <span>Suivant →</span>
            <strong>{next.title}</strong>
          </Link>
        </motion.nav>
      </motion.div>

      <AnimatePresence>
        {playing && <GameModal project={project} onClose={() => setPlaying(false)} />}
      </AnimatePresence>
    </main>
  );
}
