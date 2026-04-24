// ── Profil ────────────────────────────────────────────────────────────────
export const profil = {
  name: 'Baptiste Sandoz',
  title: 'Développeur Fullstack Junior',
  subtitle: 'Alternance 24 mois — dès Septembre 2026',
  school: 'Mastère Informatique · école iT Amiens',
  bio: 'Développeur Fullstack passionné, fort d\'un BTS SIO et d\'un Bachelor Informatique, je poursuis mon cursus en Mastère pour approfondir mon expertise. Je maîtrise l\'intégralité de la chaîne de développement, du Back-end à l\'interface Front-end, avec une vigilance constante sur la cybersécurité.',
  phone: '07 69 28 78 37',
  email: 'baptiste.sandoz@proton.me',
  location: 'Amiens, France (80000)',
  linkedin: 'baptiste-sandoz',
  dob: '07/09/2005 — 20 ans',
  permis: 'Permis B — véhiculé',
  langs: [
    { lang: 'Français', level: 'Natif' },
    { lang: 'Anglais', level: 'B1' },
  ],
  interests: ['Informatique', 'Sport', 'Veille techno', 'Cybersécurité'],
  softSkills: ['Autonomie', 'Esprit d\'équipe', 'Résolution de problèmes'],
};

// ── Skills ────────────────────────────────────────────────────────────────
export const skills = [
  { name: 'PHP', img: '/assets/skills/php.png', desc: 'Développement back-end, architecture MVC, API RESTful, gestion de bases de données.' },
  { name: 'JavaScript', img: '/assets/skills/javascript.png', desc: 'Scripting front-end interactif, ES6+, manipulation DOM, fetch API.' },
  { name: 'React', img: '/assets/skills/react.png', desc: 'Bibliothèque JS pour créer des SPA modernes et des interfaces utilisateur réactives.' },
  { name: 'HTML', img: '/assets/skills/html.png', desc: 'Langage de balisage sémantique pour structurer les pages web.' },
  { name: 'CSS', img: '/assets/skills/css.png', desc: 'Mise en page avancée, Flexbox, Grid, animations et design responsive.' },
  { name: 'Python', img: '/assets/skills/python.jpg', desc: 'Scripts d\'automatisation, interfaces web (Flask/Jinja), interaction avec Proxmox.' },
  { name: 'C#', img: '/assets/skills/c.jpg', desc: 'Développement d\'applications Windows (WinForms), POO, .NET framework.' },
  { name: '.NET MAUI', img: '/assets/skills/maui.jpg', desc: 'Applications mobiles multiplateformes (Android / iOS / Windows) avec C#.' },
  { name: 'C++', img: '/assets/skills/c2.jpg', desc: 'Algorithmie, structures de données, apprentissage des bases systèmes.' },
  { name: 'Windows Forms', img: '/assets/skills/WinForm.jpg', desc: 'Interfaces graphiques desktop classiques sous Windows avec .NET.' },
];

export const techBadges = [
  'PHP', 'JS / React / Node.js', 'HTML5 / CSS3',
  'SQL · MySQL / PostgreSQL', 'Python',
  'Git / GitHub', 'Docker', 'Linux (CLI)',
  'API REST', 'WordPress',
];

export const competenceBadges = [
  'Dév Web Fullstack', 'MVC', 'POO', 'SGBD',
  'API RESTful', 'DevOps', 'UI/UX Design',
  'Agile / Scrum', 'Algorithmie', 'Sécurité Web',
];

export const tools = [
  { name: 'VSCode', img: '/assets/outils/vscode.jpg' },
  { name: 'Visual Studio', img: '/assets/outils/vst.jpg' },
  { name: 'GitHub', img: '/assets/outils/github.png' },
  { name: 'Unity', img: '/assets/outils/unity.jpg' },
  { name: 'Photoshop', img: '/assets/outils/photoshop.png' },
  { name: 'EduPython', img: '/assets/outils/edupython.jpg' },
  { name: 'Template Jinja', img: '/assets/outils/jinja.png' },
  { name: 'Blender', img: '/assets/outils/blender.png' },
];

// ── Projects ──────────────────────────────────────────────────────────────
export const projects = [
  {
    id: 1,
    title: 'Devisse Poster',
    date: 'Mai – Juin 2024',
    img: '/assets/project/DP/DP.png',
    tags: ['site'],
    techs: ['PHP', 'HTML', 'CSS', 'JavaScript', 'SEO'],
    description: 'Site e-commerce de vente de posters : du cahier des charges à la mise en ligne, avec panier, paiement sécurisé et optimisation SEO.',
  },
  {
    id: 2,
    title: 'Interface Proxmox',
    date: 'Nov – Déc 2024',
    img: '/assets/project/noimage.png',
    tags: ['site'],
    techs: ['Python', 'Flask', 'Proxmox', 'HTML', 'CSS'],
    description: 'Interface web en Python pour administrer des serveurs Proxmox, déployer des VHD Windows/Linux et gérer l\'infrastructure virtuelle de l\'UFR des Sciences.',
  },
  {
    id: 3,
    title: 'onTime',
    date: '2025',
    img: '/assets/project/onTime/onTime.png',
    tags: ['site', 'mobile', 'autre'],
    techs: ['HTML', 'CSS', 'JavaScript'],
    description: 'Application web de gestion du temps, avec suivi des tâches et rappels.',
  },
  {
    id: 4,
    title: 'France Mobilier',
    date: '2025',
    img: '/assets/project/FranceMobilier.png',
    tags: ['site', 'sio'],
    techs: ['PHP', 'HTML', 'CSS', 'JavaScript', 'MVC', 'MySQL'],
    description: 'Site e-commerce de vente de meubles développé en architecture MVC avec PHP et MySQL.',
  },
  {
    id: 5,
    title: 'Pendu Mobile',
    date: '2025',
    img: '/assets/project/Pendu.png',
    tags: ['mobile', 'sio'],
    techs: ['.NET MAUI', 'C#'],
    description: 'Application mobile cross-platform du jeu du Pendu, développée avec .NET MAUI en C#.',
  },
  {
    id: 6,
    title: 'Sio Shop',
    date: '2025',
    img: '/assets/project/Sioshop.png',
    tags: ['csharp', 'sio'],
    techs: ['C#', 'WinForms', 'SQL'],
    description: 'Application desktop de gestion de boutique en C# Windows Forms avec base de données SQL.',
  },
];

export const filters = [
  { key: 'all', label: 'Tous' },
  { key: 'site', label: 'Site Web' },
  { key: 'sio', label: 'BTS SIO' },
  { key: 'mobile', label: 'Application Mobile' },
  { key: 'csharp', label: 'Application C#' },
  { key: 'autre', label: 'Autre' },
];

// ── Experiences ───────────────────────────────────────────────────────────
export const experiences = [
  {
    period: 'Nov 2024 → Déc 2024',
    title: 'Stagiaire Développeur & Réseau',
    company: 'UFR des Sciences — Amiens',
    tags: ['Python', 'Proxmox', 'DevOps', 'Réseau'],
    bullets: [
      'Conception d\'une interface web en Python pour interagir avec Proxmox et administrer les serveurs',
      'Configuration de Proxmox et déploiement de VHD (Windows/Linux) pour optimiser l\'infrastructure virtuelle',
      'Maintenance du parc informatique et continuité de service',
    ],
  },
  {
    period: 'Mai 2024 → Juin 2024',
    title: 'Stagiaire Développeur Web',
    company: 'Devisse Informatique — Abbeville',
    tags: ['PHP', 'HTML/CSS', 'JS', 'SEO', 'E-commerce'],
    bullets: [
      'Conception d\'un site e-commerce de vente de posters, du cahier des charges à la mise en ligne',
      'Intégration de fonctionnalités de panier, paiement sécurisé et gestion de catalogue',
      'Optimisation du référencement naturel (SEO) pour augmenter la visibilité en ligne',
    ],
  },
  {
    period: 'Juin 2024 → Août 2024',
    title: 'Barman / Responsable Snack',
    company: 'Camping Château des Tilleuls — (job d\'été)',
    tags: ['Management', 'Service client', 'Logistique'],
    bullets: [
      'Gestion complète du snack et du bar, garantissant un service rapide et de qualité',
      'Pilotage de l\'approvisionnement et des stocks, développement des compétences relationnelles',
    ],
  },
];

// ── Education ─────────────────────────────────────────────────────────────
export const education = [
  {
    period: '2025 → 2026',
    title: 'Bachelor Informatique',
    school: 'école iT — Amiens',
    tags: ['En cours'],
    highlight: true,
  },
  {
    period: '2023 → 2025',
    title: 'BTS SIO — Option SLAM',
    school: 'Lycée Edouard Gand — Amiens',
    tags: ['Diplôme obtenu', 'Développement'],
  },
  {
    period: '2020 → 2023',
    title: 'Bac Général — Spécialité Informatique',
    school: 'Lycée Boucher de Perthes — Abbeville',
    tags: ['Diplôme obtenu'],
  },
  {
    period: '2016 → 2020',
    title: 'Brevet des collèges',
    school: 'Collège Ponthieu — Abbeville',
    tags: ['Mention Bien'],
  },
];

// ── Certifications ────────────────────────────────────────────────────────
export const certifications = [
  {
    title: 'PIX — 433 points',
    date: '25 mars 2025',
    desc: 'Certification nationale des compétences numériques.',
  },
  {
    title: 'CNIL RGPD — 5 / 5 modules validés',
    date: '2025',
    desc: 'Formation certifiée sur la protection des données personnelles.',
  },
];

// ── Veille ────────────────────────────────────────────────────────────────
export const veilleArticles = [
  {
    theme: 'Introduction aux concepts CI/CD',
    items: [
      {
        title: 'Qu\'est-ce que CI/CD ?',
        url: 'https://aws.amazon.com/fr/devops/what-is-ci-cd/',
        date: '10 janvier 2024',
        source: 'AWS',
        summary: 'CI/CD est un ensemble de pratiques DevOps automatisant les tests, la validation et le déploiement du code en production.',
      },
      {
        title: 'Pourquoi CI/CD est essentiel au DevOps',
        url: 'https://www.redhat.com/fr/topics/devops/what-is-ci-cd',
        date: '15 janvier 2024',
        source: 'Red Hat',
        summary: 'Le CI/CD est la colonne vertébrale des pratiques DevOps modernes, permettant des livraisons fréquentes et fiables.',
      },
    ],
  },
  {
    theme: 'Outils et pipelines CI/CD',
    items: [
      {
        title: 'Introduction à GitHub Actions',
        url: 'https://docs.github.com/fr/actions',
        date: '5 février 2024',
        source: 'GitHub Docs',
        summary: 'GitHub Actions permet d\'automatiser des workflows CI/CD directement depuis un dépôt GitHub.',
      },
      {
        title: 'Jenkins vs GitHub Actions',
        url: 'https://dev.to/',
        date: '20 février 2024',
        source: 'Dev.to',
        summary: 'Comparatif des deux outils CI/CD les plus populaires : cas d\'usage, courbe d\'apprentissage, intégration.',
      },
    ],
  },
  {
    theme: 'Applications pratiques et bonnes pratiques',
    items: [
      {
        title: 'CI/CD pour les débutants',
        url: 'https://stackoverflow.blog/',
        date: '10 mars 2024',
        source: 'Stack Overflow Blog',
        summary: 'Guide pratique pour mettre en place son premier pipeline CI/CD, des tests automatiques au déploiement.',
      },
    ],
  },
];

// ── Marble logos ──────────────────────────────────────────────────────────
export const marbleLogos = [
  { name: 'React',      src: '/assets/skills/react.png' },
  { name: 'HTML',       src: '/assets/skills/html.png' },
  { name: 'CSS',        src: '/assets/skills/css.png' },
  { name: 'JavaScript', src: '/assets/skills/javascript.png' },
  { name: 'PHP',        src: '/assets/skills/php.png' },
  { name: 'C#',         src: '/assets/skills/c.jpg' },
  { name: 'Python',     src: '/assets/skills/python.jpg' },
  { name: 'C++',        src: '/assets/skills/c2.jpg' },
];
