import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects, filters } from '../../data/portfolio';
import styles from './Projects.module.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

function ProjectCard({ project }) {
  return (
    <motion.div
      className={styles.card}
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
          onError={(e) => { e.target.src = '/assets/project/noimage.png'; }}
        />
        <span className={styles.dateTag}>{project.date}</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.desc}>{project.description}</p>
        <div className={styles.techs}>
          {project.techs.map((t) => (
            <span key={t} className={styles.tech}>{t}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [active, setActive] = useState('all');

  const filtered = active === 'all'
    ? projects
    : projects.filter((p) => p.tags.includes(active));

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
            {filters.map((f) => (
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
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
