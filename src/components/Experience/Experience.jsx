import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';
import { experiences, education, certifications } from '../../data/portfolio';
import styles from './Experience.module.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

function PdfThumb({ src }) {
  const canvasRef = useRef(null);
  const [ready, setReady]   = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdf      = await pdfjsLib.getDocument(src).promise;
        const page     = await pdf.getPage(1);
        if (cancelled) return;
        const scale    = 90 / page.getViewport({ scale: 1 }).width;
        const viewport = page.getViewport({ scale });
        const canvas   = canvasRef.current;
        if (!canvas) return;
        canvas.width  = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, [src]);

  if (failed) return null;
  return (
    <>
      {!ready && <div className={styles.pdfShimmer} />}
      <canvas ref={canvasRef} className={styles.pdfCanvas} style={{ opacity: ready ? 1 : 0 }} />
    </>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

/* ── Timeline items ── */
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

/* ── Lightbox PDF ── */
function CertLightbox({ cert, onClose }) {
  const [index, setIndex] = useState(0);
  const total  = cert.files.length;
  const label  = cert.labels ? cert.labels[index] : cert.title;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (total > 1 && e.key === 'ArrowRight') setIndex(p => (p + 1) % total);
      if (total > 1 && e.key === 'ArrowLeft')  setIndex(p => (p - 1 + total) % total);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, total]);

  return (
    <motion.div
      className={styles.lbOverlay}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.lbPanel}
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.lbHeader}>
          <div>
            <h3 className={styles.lbTitle}>{cert.title}</h3>
            <span className={styles.lbDate}>{cert.date}{cert.labels && ` — ${label}`}</span>
          </div>
          <div className={styles.lbHeaderRight}>
            <a
              href={cert.files[index]}
              download
              className={styles.lbDlBtn}
              onClick={e => e.stopPropagation()}
              title="Télécharger"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </a>
            <button className={styles.lbClose} onClick={onClose} aria-label="Fermer">✕</button>
          </div>
        </div>

        {/* PDF iframe */}
        <div className={styles.lbIframeWrap}>
          <AnimatePresence mode="wait">
            <motion.iframe
              key={index}
              src={cert.files[index] + '#toolbar=1&navpanes=0&scrollbar=1'}
              title={label}
              className={styles.lbIframe}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>
        </div>

        {/* Navigation (RGPD uniquement) */}
        {total > 1 && (
          <div className={styles.lbFooter}>
            <button
              className={styles.lbNavBtn}
              onClick={() => setIndex(p => (p - 1 + total) % total)}
              disabled={index === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              Précédent
            </button>

            <div className={styles.lbDots}>
              {cert.files.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.lbDot} ${i === index ? styles.lbDotActive : ''}`}
                  onClick={() => setIndex(i)}
                  title={cert.labels?.[i] ?? `${i + 1}`}
                >
                  {cert.labels ? cert.labels[i] : i + 1}
                </button>
              ))}
            </div>

            <button
              className={styles.lbNavBtn}
              onClick={() => setIndex(p => (p + 1) % total)}
              disabled={index === total - 1}
            >
              Suivant
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Certification card ── */
function CertCard({ cert, onOpen }) {
  const multi = cert.files.length > 1;
  return (
    <motion.div
      className={styles.certCard}
      variants={fadeUp}
      onClick={() => onOpen(cert)}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(99,102,241,.12)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <div className={styles.certThumb}>
        <PdfThumb src={cert.files[0]} />
        <div className={styles.certThumbOverlay}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Consulter</span>
          {multi && <span>{cert.files.length} docs</span>}
        </div>
      </div>

      <div className={styles.certInfo}>
        <strong>{cert.title}</strong>
        <span>{cert.date}</span>
        <p>{cert.desc}</p>
      </div>
    </motion.div>
  );
}

/* ── Section principale ── */
export default function Experience() {
  const [activeCert, setActiveCert] = useState(null);

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
            <div className={styles.col}>
              <h3 className={styles.colTitle}><span>💼</span> Expériences professionnelles</h3>
              <div className={styles.timeline}>
                {experiences.map((e) => <ExpItem key={e.title} item={e} />)}
              </div>
            </div>

            <div className={styles.col}>
              <h3 className={styles.colTitle}><span>🎓</span> Parcours scolaire</h3>
              <div className={styles.timeline}>
                {education.map((e) => <EduItem key={e.title} item={e} />)}
              </div>

              <h3 className={styles.colTitle} style={{ marginTop: 36 }}><span>🏅</span> Certifications</h3>
              <motion.div
                className={styles.certGrid}
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              >
                {certifications.map((c) => (
                  <CertCard key={c.title} cert={c} onOpen={setActiveCert} />
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {activeCert && (
          <CertLightbox cert={activeCert} onClose={() => setActiveCert(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
