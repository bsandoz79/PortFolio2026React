import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>© {year} <strong>Baptiste Sandoz</strong>. Tous droits réservés.</p>
        <p className={styles.built}>
          Construit avec React + Vite + Matter.js
        </p>
        <p>
          <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer"></a>
        </p>
      </div>
    </footer>
  );
}
