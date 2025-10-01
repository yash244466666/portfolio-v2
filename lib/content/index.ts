// =============================================================================
// PORTFOLIO WEBSITE CONTENT MANAGEMENT MODULE
// =============================================================================
// This module centralizes all website content for easy editing and maintenance.
// Update content here instead of editing individual components.

import type {
  SocialLink,
  ContactInfo,
  Project,
  Skill,
  PersonalInfo,
  SectionContent,
  FormContent,
  ButtonTexts,
  FooterContent,
  SiteMetadata,
  ContentValidation,
} from "./types";

// Re-export types for convenience
export type {
  SocialLink,
  ContactInfo,
  Project,
  Skill,
  PersonalInfo,
  SectionContent,
  FormContent,
  ButtonTexts,
  FooterContent,
  SiteMetadata,
  ContentValidation,
};

// =============================================================================
// PERSONAL INFORMATION
// =============================================================================
export const personalInfo: PersonalInfo = {
  name: "Yash Sikdar",
  fullName: "MD. Mohi Minul Islam Yash",
  title: "Full Stack Software Engineer",
  greeting: "Hi, I'm",

  // Hero Section
  typingTitles: [
    "Full Stack Software Engineer",
    "Web Developer",
    "Frontend Specialist",
    "Backend Expert",
    "React Developer",
    "Ruby on Rails Developer",
    "testing testing testing testing testing ",
  ],

  tagline:
    "I'm a software builder who loves coding and making things work faster and efficiently. I create scalable web applications using JavaScript, React, Ruby on Rails, and modern tech stacks.",

  // About Section
  aboutDescription:
    "I'm a software builder who loves coding and making things work faster and efficiently. With 1800+ hours mastering algorithms, data structures, and full-stack development, I've helped improve applications reducing bugs by 30% and improving performance by 25%.",

  // Contact Section
  contactAvailability:
    "I'm currently available for freelance work and new opportunities. Whether you have a project in mind or just want to chat about technology, I'd love to hear from you.",
};

// =============================================================================
// SOCIAL MEDIA & CONTACT LINKS
// =============================================================================
export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/yashcodes",
    icon: "Github",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/yashcodes",
    icon: "Linkedin",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/yashcodes",
    icon: "Twitter",
  },
  {
    name: "Email",
    url: "mailto:info@yashcodes.com",
    icon: "Mail",
  },
  {
    name: "testing",
    url: "mailto:info@testing.com",
    icon: "Mail",
  },
];

// =============================================================================
// CONTACT INFORMATION
// =============================================================================
export const contactInfo: ContactInfo[] = [
  {
    type: "email",
    label: "Email",
    value: "info@yashcodes.com",
    link: "mailto:info@yashcodes.com",
  },
  {
    type: "phone",
    label: "Phone",
    value: "+8801710008502",
    link: "tel:+8801710008502",
  },
  {
    type: "location",
    label: "Location",
    value: "Barisal, Bangladesh",
  },
];

// =============================================================================
// SKILLS & EXPERTISE
// =============================================================================
export const skills: Skill[] = [
  {
    title: "Frontend Development",
    description:
      "Expert in JavaScript, React, Vue.js, Next.js, and modern CSS frameworks like Tailwind CSS.",
    icon: "Code",
  },
  {
    title: "Backend Development",
    description:
      "Proficient in Ruby on Rails, Node.js, Express.js, NestJS, Django, and RESTful API development.",
    icon: "Server",
  },
  {
    title: "Database Management",
    description:
      "Experience with MySQL, PostgreSQL, MongoDB for scalable data solutions.",
    icon: "Database",
  },
  {
    title: "Mobile Development",
    description:
      "Building responsive web apps and native applications with modern frameworks.",
    icon: "Smartphone",
  },
  {
    title: "DevOps & Deployment",
    description:
      "Skilled in Git, GitHub, Heroku, Netlify, and cloud deployment strategies.",
    icon: "Globe",
  },
  {
    title: "Performance & Testing",
    description:
      "TDD approach with RSpec, bug reduction by 30%, and performance optimization by 25%.",
    icon: "Zap",
  },
  {
    title:
      "Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing ",
    description:
      "Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing .",
    icon: "Zap",
  },
  {
    title:
      "Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing ",
    description:
      "Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing .",
    icon: "Zap",
  },
  {
    title:
      "Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing ",
    description:
      "Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing .",
    icon: "Zap",
  },
];

// =============================================================================
// PROJECTS PORTFOLIO
// =============================================================================
export const projects: Project[] = [
  {
    title: "Sendout.ai - SaaS Platform",
    description:
      "Currently maintaining and developing features for this AI-powered automation platform. Implementing reverse engineering solutions and bug fixes.",
    image: "/modern-saas-dashboard.png",
    tech: ["React", "Node.js", "AI Integration", "SaaS"],
    github: "#", // TODO: Add actual GitHub link
    live: "https://sendout.ai",
  },
  {
    title: "ERP & CRM Systems",
    description:
      "Developed comprehensive business management applications using MERN stack with ticket systems and workflow automation.",
    image: "/business-management-dashboard.png",
    tech: ["MongoDB", "Express.js", "React", "Node.js"],
    github: "#", // TODO: Add actual GitHub link
    live: "#", // TODO: Add actual live demo link
  },
  {
    title: "Unity Game Development",
    description:
      "Built interactive games using Unity and C# with advanced gameplay mechanics and user engagement features.",
    image: "/unity-game-interface.png",
    tech: ["Unity", "C#", "Game Development", "UI/UX"],
    github: "#", // TODO: Add actual GitHub link
    live: "#", // TODO: Add actual live demo link
  },
  {
    title: "Ruby on Rails Web App",
    description:
      "Developed scalable web applications with Ruby on Rails, React, and PostgreSQL achieving 100% client satisfaction through rigorous testing.",
    image: "/ruby-on-rails-web-application.png",
    tech: ["Ruby on Rails", "React", "PostgreSQL", "RSpec"],
    github: "#", // TODO: Add actual GitHub link
    live: "#", // TODO: Add actual live demo link
  },
  {
    title: "Lost & Found Mobile App",
    description:
      "Improved existing application reducing bugs by 30% and enhancing performance by 25% through optimization and testing.",
    image: "/mobile-app-interface-lost-and-found.png",
    tech: ["Mobile Development", "Performance Optimization", "Testing"],
    github: "#", // TODO: Add actual GitHub link
    live: "#", // TODO: Add actual live demo link
  },
  {
    title: "Government R&H System",
    description:
      "Built robust applications for government department achieving 99% satisfaction rate through comprehensive testing and modern techniques.",
    image: "/government-system-dashboard.png",
    tech: ["Full Stack", "Government Systems", "Quality Assurance"],
    github: "#", // TODO: Add actual GitHub link
    live: "#", // TODO: Add actual live demo link
  },
  {
    title:
      "Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing ",
    description:
      "Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing .",
    image: "/government-system-dashboard.png",
    tech: [
      "Testing Testing Testing",
      "Testing Testing",
      "Testing Testing Testing Testing",
    ],
    github: "#", // TODO: Add actual GitHub link
    live: "#", // TODO: Add actual live demo link
  },
];

// =============================================================================
// NAVIGATION & UI TEXT
// =============================================================================
export type NavigationItem = {
  label: string;
  target: string;
};

export const navigationItems: NavigationItem[] = [
  { label: "About", target: "about" },
  { label: "Projects", target: "projects" },
  { label: "Contact", target: "contact" },
  { label: "Testing", target: "contact" },
];

export const buttonTexts: ButtonTexts = {
  getInTouch: "Get In Touch",
  viewMyWork: "View My Work",
  letsTalk: "Let's Talk",
  sendMessage: "Send Message",
  code: "Code",
  liveDemo: "Live Demo",
};

// =============================================================================
// SECTION HEADINGS & DESCRIPTIONS
// =============================================================================
export const sectionContent: SectionContent = {
  about: {
    heading: "About Me",
    description:
      "I'm a software builder who loves coding and making things work faster and efficiently. With 1800+ hours mastering algorithms, data structures, and full-stack development, I've helped improve applications reducing bugs by 30% and improving performance by 25%.",
  },
  projects: {
    heading: "Featured Projects",
    description:
      "Here are some of my professional projects spanning SaaS platforms, enterprise applications, and mobile solutions that demonstrate my expertise in full-stack development.",
  },
  contact: {
    heading: "Let's Work Together",
    description:
      "Ready to bring your ideas to life? I'm always excited to work on new projects and collaborate with amazing people. Let's create something extraordinary together.",
    formTitle: "Send Me a Message",
    infoTitle: "Get In Touch",
  },
};

// =============================================================================
// FORM PLACEHOLDERS & LABELS
// =============================================================================
export const formContent: FormContent = {
  placeholders: {
    name: "Your Name",
    email: "Your Email",
    message: "Tell me about your project...",
  },
  labels: {
    name: "Name",
    email: "Email",
    message: "Message",
  },
};

// =============================================================================
// FOOTER CONTENT
// =============================================================================
export const footerContent: FooterContent = {
  copyrightYear: "2024",
  copyrightText:
    "© 2024 Yash. All rights reserved. Built with modern web technologies.",
};

// =============================================================================
// WEBSITE METADATA
// =============================================================================
export const siteMetadata: SiteMetadata = {
  title: "Yash - Full Stack Software Engineer",
  description:
    "Software builder specializing in JavaScript, React, Ruby on Rails, and modern web applications. Creating scalable solutions with efficient code.",
  keywords: [
    "Full Stack Developer",
    "React",
    "Ruby on Rails",
    "JavaScript",
    "Web Development",
    "Software Engineer",
  ],
  author: "Yash",
  siteUrl: "https://yashcodes.com",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get social link by name
 */
export const getSocialLink = (name: string): SocialLink | undefined => {
  return socialLinks.find(
    (link) => link.name.toLowerCase() === name.toLowerCase()
  );
};

/**
 * Get contact info by type
 */
export const getContactInfo = (type: string): ContactInfo | undefined => {
  return contactInfo.find((info) => info.type === type);
};

/**
 * Get project by title
 */
export const getProject = (title: string): Project | undefined => {
  return projects.find((project) =>
    project.title.toLowerCase().includes(title.toLowerCase())
  );
};

/**
 * Get skill by title
 */
export const getSkill = (title: string): Skill | undefined => {
  return skills.find((skill) =>
    skill.title.toLowerCase().includes(title.toLowerCase())
  );
};

// =============================================================================
// CONTENT VALIDATION
// =============================================================================

/**
 * Validate that all required content is present
 */
export const validateContent = (): ContentValidation => {
  const errors: string[] = [];

  // Check personal info
  if (!personalInfo.name) errors.push("Personal name is required");
  if (!personalInfo.tagline) errors.push("Personal tagline is required");

  // Check social links
  if (socialLinks.length === 0)
    errors.push("At least one social link is required");

  // Check projects
  if (projects.length === 0) errors.push("At least one project is required");

  // Check skills
  if (skills.length === 0) errors.push("At least one skill is required");

  return {
    isValid: errors.length === 0,
    errors,
  };
};
