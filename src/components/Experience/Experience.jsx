import { motion } from 'framer-motion';
import { experiences, education, certifications } from '../../data/portfolio';
import styles from './Experience.module.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

function ExpItem({ item }) {
  return (
    <motion.div className={styles.item} variants={fadeUp}>
      <div className={styles.dot} />
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.date}>{item.period}</span>
        </div>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        {item.company && <p className={styles.company}>{item.company}</p>}
        <div className={styles.tags}>
          {(item.tags || []).map((t) => <span key={t} className={styles.tag}>{t}</span>)}
        </div>
        {item.bullets && (
          <ul className={styles.bullets}>
            {item.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

function EduItem({ item }) {
  return (
    <motion.div className={styles.item} variants={fadeUp}>
      <div className={`${styles.dot} ${item.highlight ? styles.dotAccent : ''}`} />
      <div className={`${styles.card} ${item.highlight ? styles.cardHighlight : ''}`}>
        <span className={styles.date}>{item.period}</span>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        {item.school && <p className={styles.company}>{item.school}</p>}
        <div className={styles.tags}>
          {(item.tags || []).map((t) => <span key={t} className={styles.tag}>{t}</span>)}
        </div>
      </div>
    </motion.div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className={`section ${styles.exp}`}>
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p className="section-label" variants={fadeUp}>Parcours</motion.p>
          <motion.h2 className="section-title" variants={fadeUp}>Expériences & Formation</motion.h2>
          <motion.p className="section-sub" variants={fadeUp} style={{ marginBottom: 48 }}>
            Mon parcours professionnel et académique, des premiers stages jusqu'au Mastère.
          </motion.p>

          <div className={styles.cols}>
            {/* Expériences */}
            <div className={styles.col}>
              <h3 className={styles.colTitle}><span>💼</span> Expériences professionnelles</h3>
              <div className={styles.timeline}>
                {experiences.map((e) => <ExpItem key={e.title} item={e} />)}
              </div>
            </div>

            {/* Formation + Certifs */}
            <div className={styles.col}>
              <h3 className={styles.colTitle}><span>🎓</span> Parcours scolaire</h3>
              <div className={styles.timeline}>
                {education.map((e) => <EduItem key={e.title} item={e} />)}
              </div>

              <h3 className={styles.colTitle} style={{ marginTop: 36 }}><span>🏅</span> Certifications</h3>
              <div className={styles.certGrid}>
                {certifications.map((c) => (
                  <div key={c.title} className={styles.certCard}>
                    <strong>{c.title}</strong>
                    <span>{c.date}</span>
                    <p>{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
