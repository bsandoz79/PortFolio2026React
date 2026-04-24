import { motion } from 'framer-motion';
import { veilleArticles } from '../../data/portfolio';
import styles from './Veille.module.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

export default function Veille() {
  return (
    <section id="veille" className={`section ${styles.veille}`}>
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p className="section-label" variants={fadeUp}>Veille</motion.p>
          <motion.h2 className="section-title" variants={fadeUp}>Veille Technologique</motion.h2>
          <motion.p className="section-sub" variants={fadeUp}>
            Ma veille est centrée sur <strong>l'intégration et le déploiement continus (CI/CD)</strong>, pilier des pratiques DevOps modernes. J'utilise Feedly, Dev.to, Stack Overflow Blog et les newsletters OpenAI.
          </motion.p>

          <motion.div className={styles.tools} variants={fadeUp}>
            {['Feedly', 'Dev.to', 'Stack Overflow', 'GitHub Discussions', 'OpenAI Newsletter'].map((t) => (
              <span key={t} className={styles.toolTag}>{t}</span>
            ))}
          </motion.div>

          <div className={styles.themes}>
            {veilleArticles.map((theme, i) => (
              <motion.div
                key={theme.theme}
                className={styles.theme}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className={styles.themeTitle}>
                  <span className={styles.themeNum}>{String(i + 1).padStart(2, '0')}</span>
                  {theme.theme}
                </h3>
                <div className={styles.articles}>
                  {theme.items.map((art) => (
                    <a
                      key={art.title}
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.article}
                    >
                      <div className={styles.articleTop}>
                        <h4 className={styles.articleTitle}>{art.title}</h4>
                        <span className={styles.source}>{art.source}</span>
                      </div>
                      <p className={styles.summary}>{art.summary}</p>
                      <span className={styles.date}>{art.date}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
