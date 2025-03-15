import { Experience, Profile, Project } from './types';

// Profile information
export const profile: Profile = {
  name: 'Mohamed Hachemi',
  title: 'Senior Frontend Developer',
  bio: 'Senior frontend developer with 6+ years of expertise in building scalable web applications, optimizing performance, and leading cross-functional projects. Proficient in React, Next.js, and modern UI/UX practices, with a focus on design systems and agile workflows.',
  email: 'mohamedelfadhel.elhachemi@gmail.com',
  calendlyLink: 'https://calendly.com/mohamed-hachemi/meeting'
};

// Sample projects data
export const projects: Project[] = [
  {
    id: '1',
    title: 'Design System Implementation',
    description: 'Developed a future-proof design system using Tailwind CSS, ensuring consistent UI/UX across web and mobile platforms with reusable form components and accessibility-focused variants.',
    link: 'https://github.com/medelfadhelhachemi/design-system',
    tags: ['React', 'Tailwind CSS', 'TypeScript', 'Accessibility'],
    type: 'work'
  },
  {
    id: '2',
    title: 'Performance Optimization',
    description: 'Reduced page load time by 50% (1s to 500ms) through image optimization and code splitting. Decreased bundle size and CI build time by 66% via Webpack configuration and tree-shaking strategies.',
    link: 'https://github.com/medelfadhelhachemi/performance-optimization',
    tags: ['Next.js', 'Webpack', 'JavaScript', 'Performance'],
    type: 'work'
  },
  {
    id: '3',
    title: 'AI-Driven Language Learning Platform',
    description: 'Developed an educational platform with 30+ interactive animations and gamification features to boost user engagement. Integrated NLP technologies for personalized learning experiences.',
    link: 'https://github.com/medelfadhelhachemi/language-learning',
    tags: ['React.js', 'Three.js', 'NLP', 'Redux'],
    type: 'work'
  },
  {
    id: '4',
    title: 'Videoconferencing Application',
    description: 'Engineered a desktop videoconferencing application with integrated whiteboard functionality using Next.js and WebRTC. Focused on real-time collaboration features.',
    link: 'https://github.com/medelfadhelhachemi/video-conferencing',
    tags: ['Next.js', 'WebRTC', 'JavaScript', 'Real-time'],
    type: 'work'
  },
  {
    id: '5',
    title: 'Whiteboard Library',
    description: 'Published a custom whiteboard library to enhance real-time collaboration for 10,000+ active users. Features include drawing tools, text annotations, and shared cursors.',
    link: 'https://www.npmjs.com/package/collaborative-whiteboard',
    tags: ['JavaScript', 'TypeScript', 'npm', 'Open Source'],
    type: 'open source'
  }
];

// Experience data based on resume
export const experiences: Experience[] = [
  {
    id: '1',
    company: 'KOLECTO',
    title: 'Senior Front-End Engineer',
    period: 'Jan 2024 - Present',
    description: 'Established front-end development guidelines and code review best practices, improving team collaboration and code quality. Developed a future-proof design system using Tailwind CSS. Conducted comprehensive testing and debugging with Playwright.',
    tags: ['React.js', 'Next.js', 'Tailwind CSS', 'React Query', 'Playwright', 'TypeScript'],
    link: 'https://kolecto.fr'
  },
  {
    id: '2',
    company: 'CAP COLLECTIF',
    title: 'Senior Front-End Engineer',
    period: 'Mar 2021 - Dec 2023',
    description: 'Reduced page load time by 50% through image optimization and code splitting. Decreased bundle size and CI build time by 66% via Webpack configuration and tree-shaking strategies. Built a comprehensive design system from scratch with accessibility-focused variants.',
    tags: ['React JS 17', 'Next.js', 'TypeScript', 'Relay JS', 'Framer Motion', 'CypressJS'],
    link: 'https://cap-collectif.com'
  },
  {
    id: '3',
    company: 'YES\'N\'YOU',
    title: 'Front-End Engineer',
    period: 'Apr 2018 - Mar 2021',
    description: 'Developed an AI-driven language learning platform with 30+ interactive animations and gamification features. Engineered a desktop videoconferencing application with integrated whiteboard functionality using Next.js and WebRTC. Published a custom whiteboard library.',
    tags: ['React.js', 'Next.js', 'Three.js', 'Redux', 'NLP', 'TypeScript'],
    link: 'https://yesnyou.com'
  }
];
