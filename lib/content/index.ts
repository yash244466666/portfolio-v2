// =============================================================================
// PORTFOLIO WEBSITE CONTENT MANAGEMENT MODULE
// =============================================================================
// This module centralizes all website content for easy editing and maintenance.
// Update content here instead of editing individual components.

import type {
  SocialLink,
  ContactInfo,
  Project,
  ProjectModalContent,
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
  ProjectModalContent,
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
  ],

  tagline:
    "I'm a software builder who loves coding and making things work faster and efficiently. I create scalable web applications using JavaScript, React, Ruby on Rails, and modern tech stacks.",

  // About Section
  aboutDescription:
    "I'm a software builder who loves coding and making things work faster and efficiently. With 1800+ hours mastering algorithms, data structures, and full-stack development, I've helped improve applications reducing bugs by 30% and improving performance by 25%.",

  // Contact Section
  contactAvailability:
    "I'm currently available for freelance work and new opportunities. Whether you have a project in mind or just want to chat about technology, I'd love to hear from you.",

  // Navigation resume download
  // Replace public/resume.pdf with the real document; no component changes needed.
  // Omit resumeUrl (or set it to "" or "#") to hide the button.
  // Root-relative/relative URLs download; absolute cross-origin URLs open in a new tab.
  resumeUrl: "/resume.pdf",
  resumeFileName: "MD-Mohi-Minul-Islam-Yash-Resume.pdf",
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
];

// =============================================================================
// PROJECTS PORTFOLIO
// =============================================================================
// Per-project action visibility (both flags are optional and default to true):
//   showCode: false      hides the "Code" button for that project.
//   showLiveDemo: false  hides the "Live Demo" button for that project.
// Hiding one keeps the other; hiding both removes the action row entirely.
// Example: { ..., showCode: false } renders only the Live Demo button.
//
// Projects render on the home page as cards and open a detail modal on click.
// Besides the card fields, each project may carry these optional fields, which
// are only used by the modal (see components/projects-section/project-modal.tsx):
//
//   longDescription — longer copy shown under the summary paragraph.
//                     Falls back to `description` when omitted.
//   highlights      — short bullet points listed under the highlights heading.
//                     The whole section is hidden when this is missing/empty.
//   role            — the part played on the project; hidden when omitted.
//   year            — display year, e.g. "2024"; hidden when omitted. Omit it
//                     rather than guessing if the date is not confirmed.
//
// Every link that is still "#" is rendered as a visibly disabled action.
export const projects: Project[] = [
  {
    title: "Sendout.ai - SaaS Platform",
    description:
      "Currently maintaining and developing features for this AI-powered automation platform. Implementing reverse engineering solutions and bug fixes.",
    image: "/modern-saas-dashboard.png",
    tech: ["React", "Node.js", "AI Integration", "SaaS"],
    github: "#", // TODO: Add actual GitHub link
    live: "https://sendout.ai",
    role: "Full Stack Developer",
    longDescription:
      "An AI-powered automation SaaS platform where I maintain the existing product and ship new features. The work spans the React frontend, the Node.js backend, and the AI integrations behind the platform's automation flows — including reverse-engineering existing behaviour to trace and fix defects.",
    highlights: [
      "Maintain and extend an AI-powered automation SaaS platform",
      "Ship new features across a React and Node.js stack",
      "Reverse-engineer existing behaviour to track down and fix defects",
    ],
  },
  {
    title: "ERP & CRM Systems",
    description:
      "Developed comprehensive business management applications using MERN stack with ticket systems and workflow automation.",
    image: "/business-management-dashboard.png",
    tech: ["MongoDB", "Express.js", "React", "Node.js"],
    github: "#", // TODO: Add actual GitHub link
    live: "#", // TODO: Add actual live demo link
    role: "Full Stack Developer",
    longDescription:
      "Business management applications built on the MERN stack. The systems cover day-to-day operations, with ticket tracking and workflow automation tying the modules together.",
    highlights: [
      "Built ERP and CRM applications on MongoDB, Express.js, React, and Node.js",
      "Implemented a ticket system for support and internal workflows",
      "Automated recurring business workflows",
    ],
  },
  {
    title: "Unity Game Development",
    description:
      "Built interactive games using Unity and C# with advanced gameplay mechanics and user engagement features.",
    image: "/unity-game-interface.png",
    tech: ["Unity", "C#", "Game Development", "UI/UX"],
    github: "#", // TODO: Add actual GitHub link
    live: "#", // TODO: Add actual live demo link
    role: "Game Developer",
    longDescription:
      "Interactive games built with Unity and C#. The work covered gameplay mechanics, player-facing UI/UX, and the engagement features that keep players coming back.",
    highlights: [
      "Built interactive games in Unity with C#",
      "Implemented gameplay mechanics and player-facing UI/UX",
      "Added user engagement features",
    ],
  },
  {
    title: "Ruby on Rails Web App",
    description:
      "Developed scalable web applications with Ruby on Rails, React, and PostgreSQL achieving 100% client satisfaction through rigorous testing.",
    image: "/ruby-on-rails-web-application.png",
    tech: ["Ruby on Rails", "React", "PostgreSQL", "RSpec"],
    github: "#", // TODO: Add actual GitHub link
    live: "#", // TODO: Add actual live demo link
    role: "Full Stack Developer",
    longDescription:
      "Scalable web applications built with Ruby on Rails, React, and PostgreSQL. RSpec testing ran alongside delivery, which is how the work reached 100% client satisfaction.",
    highlights: [
      "Built scalable web applications with Ruby on Rails and React",
      "Modelled data in PostgreSQL",
      "Covered behaviour with RSpec tests as part of delivery",
    ],
  },
  {
    title: "Lost & Found Mobile App",
    description:
      "Improved existing application reducing bugs by 30% and enhancing performance by 25% through optimization and testing.",
    image: "/mobile-app-interface-lost-and-found.png",
    tech: ["Mobile Development", "Performance Optimization", "Testing"],
    github: "#", // TODO: Add actual GitHub link
    live: "#", // TODO: Add actual live demo link
    role: "Mobile Developer",
    longDescription:
      "An existing lost-and-found application that I improved rather than rebuilt. Profiling and testing cut bugs by 30% and improved performance by 25%, while keeping the flows people use most intact.",
    highlights: [
      "Reduced bugs by 30% in an existing mobile application",
      "Improved performance by 25% through optimization and testing",
      "Strengthened test coverage across core flows",
    ],
  },
  {
    title: "Government R&H System",
    description:
      "Built robust applications for government department achieving 99% satisfaction rate through comprehensive testing and modern techniques.",
    image: "/government-system-dashboard.png",
    tech: ["Full Stack", "Government Systems", "Quality Assurance"],
    github: "#", // TODO: Add actual GitHub link
    live: "#", // TODO: Add actual live demo link
    role: "Full Stack Developer",
    longDescription:
      "Full-stack applications for a government R&H department, delivered with a heavy quality-assurance process. Comprehensive testing and modern techniques brought the project to a 99% satisfaction rate.",
    highlights: [
      "Built full-stack applications for a government R&H department",
      "Applied a comprehensive testing and quality-assurance process",
      "Reached a 99% satisfaction rate with the delivered system",
    ],
  },
];

// =============================================================================
// PROJECT DETAIL MODAL COPY
// =============================================================================
// Labels used by the project detail modal. Project-specific copy lives on the
// projects above; this covers the surrounding UI so it can be edited in one place.
export const projectModalContent: ProjectModalContent = {
  // Accessible label for the full-card button. "{title}" becomes the project title.
  openLabelTemplate: "View {title} details",
  // Accessible label for the modal close button.
  closeLabel: "Close project details",
  // Heading above the project's highlights list.
  highlightsHeading: "Highlights",
  // Labels for the optional meta row entries.
  roleLabel: "Role",
  yearLabel: "Year",
  // Shown on actions whose link is still a "#" placeholder.
  unavailableLabel: "Coming soon",
};

// =============================================================================
// NAVIGATION & UI TEXT
// =============================================================================
export type NavigationItem = {
  label: string;
  target: string;
  href?: string;
};

export const navigationItems: NavigationItem[] = [
  { label: "About", target: "about" },
  { label: "Projects", target: "projects" },
  { label: "Tools", target: "", href: "/tools/" },
  { label: "Contact", target: "contact" },
];

export const buttonTexts: ButtonTexts = {
  getInTouch: "Get In Touch",
  viewMyWork: "View My Work",
  letsTalk: "Let's Talk",
  sendMessage: "Send Message",
  code: "Code",
  liveDemo: "Live Demo",
  downloadResume: "Download Resume",
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
  copyrightYear: new Date().getFullYear().toString(),
  copyrightText:
    `© ${new Date().getFullYear()} Yash. All rights reserved. Built with modern web technologies.`,
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
