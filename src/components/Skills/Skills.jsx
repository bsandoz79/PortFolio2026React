import { useEffect, useMemo, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { skills, tools } from '../../data/portfolio';
import styles from './Skills.module.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const cardVariant = {
  hidden: { opacity: 0, scale: 0.78, y: 18 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
};
const gridVariant = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ── Syntax tokens ── */
const T = {
  cm: '#6a9955', kw: '#569cd6', fn: '#dcdcaa', vr: '#9cdcfe',
  st: '#ce9178', nm: '#b5cea8', tg: '#4ec9b0', at: '#92c2f0',
  tx: '#d4d4d4', tp: '#4ec9b0',
};
function Tok({ t, c }) { return <span style={{ color: T[c] ?? T.tx }}>{t}</span>; }
function CodeLine({ tokens, num, cursor }) {
  return (
    <div className={styles.codeLine}>
      <span className={styles.lineNum}>{num}</span>
      <span>
        {tokens.map((tk, i) => <Tok key={i} {...tk} />)}
        {cursor && <span className={styles.cursor} />}
      </span>
    </div>
  );
}
const LEFT_LINES = [
  [{ t: '// Skills.jsx', c: 'cm' }],
  [{ t: 'import ', c: 'kw' }, { t: '{ motion }', c: 'tx' }, { t: ' from', c: 'kw' }],
  [{ t: "  'framer-motion'", c: 'st' }],
  [],
  [{ t: 'const ', c: 'kw' }, { t: 'fadeUp', c: 'vr' }, { t: ' = {', c: 'tx' }],
  [{ t: '  hidden', c: 'at' }, { t: ': { ', c: 'tx' }, { t: 'y', c: 'vr' }, { t: ': ', c: 'tx' }, { t: '20', c: 'nm' }, { t: ', opacity: ', c: 'tx' }, { t: '0', c: 'nm' }, { t: ' },', c: 'tx' }],
  [{ t: '  visible', c: 'at' }, { t: ': { ', c: 'tx' }, { t: 'y', c: 'vr' }, { t: ': ', c: 'tx' }, { t: '0', c: 'nm' }, { t: ', opacity: ', c: 'tx' }, { t: '1', c: 'nm' }, { t: ' }', c: 'tx' }],
  [{ t: '}', c: 'tx' }],
  [],
  [{ t: 'export default ', c: 'kw' }],
  [{ t: 'function ', c: 'kw' }, { t: 'Skills', c: 'fn' }, { t: '() {', c: 'tx' }],
  [{ t: '  return ', c: 'kw' }, { t: '(', c: 'tx' }],
  [{ t: '    <', c: 'tg' }, { t: 'section', c: 'tg' }],
  [{ t: '      id', c: 'at' }, { t: '=', c: 'tx' }, { t: '"skills"', c: 'st' }],
  [{ t: '    >', c: 'tg' }],
  [{ t: '      ...', c: 'cm' }],
  [{ t: '    </', c: 'tg' }, { t: 'section', c: 'tg' }, { t: '>', c: 'tg' }],
  [{ t: '  )', c: 'tx' }],
  [{ t: '}', c: 'tx' }],
];
const RIGHT_LINES = [
  [{ t: '<?php', c: 'kw' }],
  [{ t: '// SkillController', c: 'cm' }],
  [],
  [{ t: 'class ', c: 'kw' }, { t: 'SkillController', c: 'tp' }],
  [{ t: '  extends ', c: 'kw' }, { t: 'Controller', c: 'tp' }, { t: ' {', c: 'tx' }],
  [],
  [{ t: '  public ', c: 'kw' }, { t: 'function ', c: 'kw' }],
  [{ t: '  index', c: 'fn' }, { t: '() {', c: 'tx' }],
  [{ t: '    $skills', c: 'vr' }, { t: ' =', c: 'tx' }],
  [{ t: '      Skill', c: 'tp' }, { t: '::', c: 'tx' }, { t: 'all', c: 'fn' }, { t: '();', c: 'tx' }],
  [{ t: '    return ', c: 'kw' }, { t: 'response', c: 'fn' }, { t: '()', c: 'tx' }],
  [{ t: '      ->', c: 'tx' }, { t: 'json', c: 'fn' }, { t: '(', c: 'tx' }],
  [{ t: '        $skills', c: 'vr' }, { t: ', ', c: 'tx' }, { t: '200', c: 'nm' }],
  [{ t: '      );', c: 'tx' }],
  [{ t: '  }', c: 'tx' }],
  [],
  [{ t: '  // store(), update()', c: 'cm' }],
  [{ t: '  // destroy()...', c: 'cm' }],
  [{ t: '}', c: 'tx' }],
];

function CodeWindow({ title, lines, side }) {
  const isLeft = side === 'left';
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -48 : 48 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={styles.codeOuter}
    >
      <motion.div
        className={styles.codeWindow}
        style={{ rotate: isLeft ? -3 : 3 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: isLeft ? 0 : 1.4 }}
      >
        <div className={styles.codeBar}>
          <span className={styles.dotR} /><span className={styles.dotY} /><span className={styles.dotG} />
          <span className={styles.codeTitle}>{title}</span>
        </div>
        <div className={styles.codeBody}>
          {lines.map((tokens, i) =>
            tokens.length === 0
              ? <div key={i} className={styles.codeLine}><span className={styles.lineNum}>{i + 1}</span></div>
              : <CodeLine key={i} tokens={tokens} num={i + 1} cursor={i === lines.length - 1} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Floating logos ── */
const ZONE   = 400;
const LOGO   = 68;
const MARGIN = 10;
const BOUND  = ZONE - LOGO - MARGIN * 2;

function randPts(n = 7) {
  const pts = Array.from({ length: n }, () => [
    MARGIN + Math.random() * BOUND,
    MARGIN + Math.random() * BOUND,
  ]);
  pts.push(pts[0]);
  return pts;
}

function FloatingLogo({ tool }) {
  const controls = useAnimation();
  const pts      = useMemo(() => randPts(7), []);
  const duration = useMemo(() => 14 + Math.random() * 10, []);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    controls.start({
      x: pts.map(p => p[0]),
      y: pts.map(p => p[1]),
      transition: { duration, repeat: Infinity, ease: 'easeInOut' },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnter = () => {
    controls.stop();
    setHovered(true);
  };
  const handleLeave = () => {
    setHovered(false);
    controls.start({
      x: pts.map(p => p[0]),
      y: pts.map(p => p[1]),
      transition: { duration, repeat: Infinity, ease: 'easeInOut' },
    });
  };

  return (
    <motion.div
      className={styles.floatLogo}
      initial={{ x: pts[0][0], y: pts[0][1] }}
      animate={controls}
      style={{ zIndex: hovered ? 20 : 1 }}
      whileHover={{ scale: 1.2, transition: { duration: 0.18 } }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <img src={tool.img} alt={tool.name} />
      <p className={styles.floatName}>{tool.name}</p>
      {hovered && (
        <motion.div
          className={styles.floatTooltip}
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          {tool.desc}
        </motion.div>
      )}
    </motion.div>
  );
}

function ToolsFloat() {
  return (
    <div className={styles.floatZone}>
      {tools.map(t => <FloatingLogo key={t.name} tool={t} />)}
    </div>
  );
}

/* ── Skill card ── */
function SkillCard({ skill, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className={styles.card}
      variants={cardVariant}
      whileHover={{ y: -7, transition: { type: 'spring', stiffness: 420, damping: 18 } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className={styles.imgWrap}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4 + (index % 5) * 0.25, repeat: Infinity, ease: 'easeInOut', delay: index * 0.13 }}
        whileHover={{ scale: 1.18, transition: { type: 'spring', stiffness: 380, damping: 16 } }}
      >
        <img src={skill.img} alt={skill.name} />
      </motion.div>
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
    </motion.div>
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
          <motion.div className={styles.grid} variants={gridVariant}>
            {skills.map((s, i) => <SkillCard key={s.name} skill={s} index={i} />)}
          </motion.div>

          <motion.h3 className={styles.subTitle} variants={fadeUp} style={{ marginTop: 48 }}>Outils & Logiciels</motion.h3>
          <motion.div variants={fadeUp} className={styles.orbitSection}>
            <CodeWindow title="Skills.jsx" lines={LEFT_LINES} side="left" />
            <ToolsFloat />
            <CodeWindow title="SkillController.php" lines={RIGHT_LINES} side="right" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
