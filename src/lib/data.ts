import { Experience, Profile, Project } from './types'

// Profile information
export const profile: Profile = {
  name: 'Mohamed Hachemi',
  title: 'Senior Frontend Developer',
  bio: 'Senior frontend developer with 6+ years of expertise in building scalable web applications, optimizing performance, and leading cross-functional projects. Proficient in React, Next.js, and modern UI/UX practices, with a focus on design systems and agile workflows.',
  email: 'mohamedelfadhel.elhachemi@gmail.com',
  calendlyLink: 'https://calendar.app.google/ZMZSMhdhjCCmn5Ls6',
}

// Sample projects data
export const projects: Project[] = [
  {
    id: 'humane-type',
    title: 'humaneType',
    description:
      'A React component library for adding natural, humanized variations to text. Inspired by the InDesign "Humane Type" plugin, it creates text with subtle imperfections that appears more hand-crafted and less mechanical.',
    link: 'https://github.com/MedElfadhelELHACHEMI/humane-type',
    tags: [
      'React',
      'Typography',
      'Component Library',
      'Accessibility',
      'TypeScript',
    ],
    type: 'open source',
  },
  {
    id: 'personal-website',
    title: 'Personal Website',
    description:
      'A personal portfolio website built using Next.js 14 and Tailwind CSS, using a neobrutalism design approach. Features a clean, modern UI with tailored styling and proper code linting.',
    link: 'https://github.com/MedElfadhelELHACHEMI/PersonalSite',
    tags: ['Next.js', 'Tailwind CSS', 'Portfolio', 'Neobrutalism', 'Frontend'],
    type: 'personal',
  },
  {
    id: 'cap-collectif-ui',
    title: 'Cap-collectif Design System',
    description:
      'The official design system for Cap Collectif, a comprehensive UI component library that ensures consistent user experiences across products. Includes tested and documented React components with Storybook integration.',
    link: 'https://github.com/cap-collectif/ui',
    tags: [
      'Design System',
      'React',
      'Storybook',
      'Components',
      'Accessibility',
    ],
    type: 'work',
  },
  {
    id: 'opentok-react-whiteboard',
    title: 'opentok-react-whiteboard',
    description:
      'A React shared whiteboard component that integrates with OpenTok (now Vonage Video API) for real-time collaborative drawing during video sessions. Enables multi-user drawing and annotations.',
    link: 'https://github.com/MedElfadhelELHACHEMI/opentok-react-whiteboard',
    tags: [
      'React',
      'OpenTok',
      'WebRTC',
      'Collaboration',
      'Interactive Whiteboard',
    ],
    type: 'open source',
  },
]

// Experience data based on resume
export const experiences: Experience[] = [
  {
    id: '1',
    company: 'KOLECTO',
    title: 'Senior Front-End Engineer',
    period: 'Jan 2024 - Jun 2024',
    description:
      'Established front-end development guidelines and code review best practices, improving team collaboration and code quality. Developed a future-proof design system using Tailwind CSS. Conducted comprehensive testing and debugging with Playwright.',
    tags: [
      'React.js',
      'Next.js',
      'Tailwind CSS',
      'React Query',
      'Playwright',
      'TypeScript',
    ],
    link: 'https://www.kolecto.fr',
  },
  {
    id: '2',
    company: 'CAP COLLECTIF',
    title: 'Senior Front-End Engineer',
    period: 'Mar 2021 - Dec 2023',
    description:
      'Reduced page load time by 50% through image optimization and code splitting. Decreased bundle size and CI build time by 66% via Webpack configuration and tree-shaking strategies. Built a comprehensive design system from scratch with accessibility-focused variants.',
    tags: [
      'React JS 17',
      'Next.js',
      'TypeScript',
      'Relay JS',
      'Framer Motion',
      'CypressJS',
    ],
    link: 'https://www.cap-collectif.com',
  },
  {
    id: '3',
    company: "YES'N'YOU",
    title: 'Front-End Engineer',
    period: 'Apr 2018 - Mar 2021',
    description:
      'Developed an AI-driven language learning platform with 30+ interactive animations and gamification features. Engineered a desktop videoconferencing application with integrated whiteboard functionality using Next.js and WebRTC. Published a custom whiteboard library.',
    tags: ['React.js', 'Next.js', 'Three.js', 'Redux', 'NLP', 'TypeScript'],
    link: 'https://www.yesnyou.com/fr/',
  },
]
