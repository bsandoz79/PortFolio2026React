import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Skills from './components/Skills/Skills';
import Experience from './components/Experience/Experience';
import Projects from './components/Projects/Projects';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import ProjectPage from './pages/ProjectPage';

function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Contact />
    </main>
  );
}

// À chaque changement de page : section ciblée par le hash (#contact…) ou haut de page
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 80);
    return () => clearTimeout(t);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const { dark, toggle } = useTheme();
  return (
    <>
      <ScrollManager />
      <Navbar isDark={dark} onThemeToggle={toggle} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projets/:slug" element={<ProjectPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}
