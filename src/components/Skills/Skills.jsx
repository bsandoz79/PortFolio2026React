import { useState } from 'react';
import { motion } from 'framer-motion';
import { skills, tools } from '../../data/portfolio';
import styles from './Skills.module.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

function SkillCard({ skill }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.imgWrap}>
        <img src={skill.img} alt={skill.name} />
      </div>
      <p className={styles.name}>{skill.name}</p>
      {hovered && (
        <motion.div
          className={styles.tooltip}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {skill.desc}
        </motion.div>
      )}
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className={`section ${styles.skills}`}>
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p className="section-label" variants={fadeUp}>Compétences</motion.p>
          <motion.h2 className="section-title" variants={fadeUp}>Technologies & Outils</motion.h2>
          <motion.p className="section-sub" variants={fadeUp} style={{ marginBottom: 48 }}>
            Acquises durant mes études en BTS SIO et par auto-formation, en relevant des défis et en construisant des projets.
          </motion.p>

          <motion.h3 className={styles.subTitle} variants={fadeUp}>Langages & Frameworks</motion.h3>
          <motion.div className={styles.grid} variants={fadeUp}>
            {skills.map((s) => <SkillCard key={s.name} skill={s} />)}
          </motion.div>

          <motion.h3 className={styles.subTitle} variants={fadeUp} style={{ marginTop: 48 }}>Outils & Logiciels</motion.h3>
          <motion.div className={`${styles.grid} ${styles.toolsGrid}`} variants={fadeUp}>
            {tools.map((t) => (
              <div key={t.name} className={styles.card}>
                <div className={styles.imgWrap}>
                  <img src={t.img} alt={t.name} />
                </div>
                <p className={styles.name}>{t.name}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
