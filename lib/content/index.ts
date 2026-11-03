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
  name: "Yash",
  fullName: "MD. Mohi Minul Islam Yash",
  title: "Full Stack Software Engineer",
  greeting: "Hi, I'm",
  typingTitles: [
    "Full Stack Software Engineer",
    "React Developer",
    "Ruby on Rails Developer",
    "JavaScript & TypeScript Developer",
  ],
  tagline:
    "I'm a software engineer based in Bangladesh. I build and maintain web applications with JavaScript, TypeScript, React, Node.js, and Ruby on Rails. Open to remote and on-site software engineering roles.",
  aboutDescription:
    "I'm MD. Mohi Minul Islam Yash, a full-stack software engineer working in the industry since 2020. My experience includes SaaS maintenance, AI-based automation, MERN business applications, and Rails applications with React and PostgreSQL. I've worked with international teams in remote and hybrid roles. I use AI-assisted development alongside manual code review, testing, and security-focused reviews.",
  contactAvailability:
    "I'm looking for my next software engineering role, preferably remote, and I'm also open to on-site opportunities. Get in touch to discuss a role or my experience.",
  resumeUrl: "/resume.pdf",
  resumeFileName: "MD-Mohi-Minul-Islam-Yash-Resume.pdf",
};

// =============================================================================
// SOCIAL MEDIA & CONTACT LINKS
// =============================================================================
export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/yash244466666",
    icon: "Github",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/md-mohi-minul-islam-yash/",
    icon: "Linkedin",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/yash_solo000",
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
    value: "Bangladesh",
  },
];

// =============================================================================
// SKILLS & EXPERTISE
// =============================================================================
export const skills: Skill[] = [
  {
    title: "Frontend Development",
    description:
      "JavaScript, TypeScript, React, Redux, Next.js, HTML, CSS, and responsive web interfaces.",
    icon: "Code",
  },
  {
    title: "Backend Development",
    description:
      "Ruby on Rails, Node.js, Express, and API development, with additional skills in Python and Django.",
    icon: "Server",
  },
  {
    title: "Databases",
    description:
      "PostgreSQL, MongoDB, and MySQL for web application data and persistence.",
    icon: "Database",
  },
  {
    title: "Security & Code Review",
    description:
      "Security-focused code reviews, reverse engineering, OSINT, and ethical hacking.",
    icon: "Code",
  },
  {
    title: "Delivery & Collaboration",
    description:
      "Git, GitHub, GitLab, Jira, and Agile teamwork with international and remote teams.",
    icon: "Globe",
  },
  {
    title: "Testing & Performance",
    description:
      "Debugging, performance optimization, TDD, RSpec, and manual review of AI-assisted code.",
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
    title: "YashCodes Portfolio & Developer Tools",
    description:
      "My portfolio and a catalog of 88 browser-based utilities for development, text, media, security, and everyday calculations.",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/yash244466666/portfolio-v2",
    live: "/tools/",
    role: "Personal project",
    longDescription:
      "Built as a static Next.js application with a searchable tool catalog and dynamically loaded utilities. Most tools process data in the browser; tools that use external services disclose that in their interface.",
    highlights: [
      "Built a searchable catalog organized into six tool categories",
      "Implemented lazy-loaded tools with reset and browser-history navigation",
      "Added mobile layouts, reduced-motion support, and a contact form backed by a separate Cloudflare Worker",
    ],
  },
  {
    title: "AnyHelpNow Website",
    description:
      "Fixed bugs and implemented website features as a remote full-stack engineer at AnyHelpNow.",
    tech: ["Web Development", "Debugging"],
    github: "",
    live: "https://anyhelpnow.com/",
    showCode: false,
    role: "Full-stack Engineer at AnyHelpNow",
    year: "April–November 2026",
    longDescription:
      "Contributed to the existing anyhelpnow.com website as part of my full-time engineering role. My work focused on bug fixes and feature implementation.",
  },
  {
    title: "Sendout.ai at Prospect Engine",
    description:
      "Maintained Sendout.ai, fixed defects, and implemented features as part of Prospect Engine's SaaS product team.",
    tech: ["SaaS", "AI-based Automation", "Reverse Engineering"],
    github: "",
    live: "https://sendout.ai/",
    showCode: false,
    role: "Full-stack Engineer at Prospect Engine LLC",
    year: "October 2024–March 2026",
    longDescription:
      "Worked on Sendout.ai as a member of Prospect Engine's SaaS product team. My work included product maintenance and reverse engineering platform behavior to support AI-based automation.",
    highlights: [
      "Maintained the product and implemented new features",
      "Investigated platform behavior for automation workflows",
      "Resolved software defects as part of the product team",
    ],
  },
  {
    title: "Business Applications at Bengal7",
    description:
      "Developed ERP, CRM, and ticketing applications using the MERN stack during a remote contract with Bengal7 IT Solutions.",
    tech: ["MongoDB", "Express.js", "React", "Node.js"],
    github: "",
    live: "",
    showCode: false,
    showLiveDemo: false,
    role: "Full-stack Engineer, contractor",
    year: "April–August 2024",
    longDescription:
      "Worked on business applications covering ERP, CRM, and ticketing needs as a contractor at Bengal7 IT Solutions.",
  },
  {
    title: "Web & Unity Development at JUUBIX",
    description:
      "Contributed to a MERN web application and a Unity game using C# while working remotely at JUUBIX.",
    tech: ["MERN", "Unity", "C#"],
    github: "",
    live: "",
    showCode: false,
    showLiveDemo: false,
    role: "Full-stack Engineer at JUUBIX",
    year: "December 2023–March 2024",
    longDescription:
      "Worked with the team on web application development and a Unity game. The web application used the MERN stack, and the game used Unity and C#.",
  },
  {
    title: "Rails Application at 2i Global Network",
    description:
      "Implemented web application features using Ruby on Rails, React, and PostgreSQL during a remote contract at 2i Global Network.",
    tech: ["Ruby on Rails", "React", "PostgreSQL"],
    github: "",
    live: "",
    showCode: false,
    showLiveDemo: false,
    role: "Ruby on Rails Developer, contractor",
    year: "June–November 2023",
    longDescription:
      "Contributed new features to an existing web application. My work combined Ruby on Rails, React, and PostgreSQL, with testing as part of implementation.",
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
  viewMyWork: "View My Work",
  letsTalk: "Let's Talk",
  sendMessage: "Send Message",
  code: "Code",
  liveDemo: "Visit Website",
  downloadResume: "Download Resume",
};

// =============================================================================
// SECTION HEADINGS & DESCRIPTIONS
// =============================================================================
export const sectionContent: SectionContent = {
  about: {
    heading: "About Me",
    description: personalInfo.aboutDescription,
  },
  projects: {
    heading: "Selected Work",
    description:
      "A personal project and selected contributions from past engineering roles. Each entry explains my role and the technologies I used. Website links open the public products.",
  },
  contact: {
    heading: "Let's Work Together",
    description: personalInfo.contactAvailability,
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
    message: "Tell me about the role or opportunity...",
  },
  labels: {
    name: "Name",
    email: "Email",
    message: "Message",
  },
  attachment: {
    label: "Attachment",
    optional: "optional",
    choose: "Choose a file",
    hint: "Any format · up to 100 MB per file · max 5 files.",
    remove: "Remove",
    limitReached: "5 files selected — that is the maximum.",
    privacy:
      "Your file is stored privately, shared by an expiring link, and deleted after 30 days.",
  },
  status: {
    sending: "Sending…",
    success: "Message sent — check your inbox for a confirmation.",
    successNoConfirmation:
      "Message sent. The confirmation email could not be delivered, but your message reached me.",
    error: "Your message could not be sent. Please try again or email me directly.",
    verificationRequired: "Please complete the verification check before sending.",
    verificationUnavailable:
      "Verification could not load. Refresh the page or email me directly.",
    notConfigured:
      "The contact form is not connected yet. Please email me directly.",
    fallback: "Email me directly instead",
    privacy:
      "Your email address is used only to reply to you and send a confirmation. It is not stored on this site.",
    protectedBy: "Protected by Cloudflare",
    fileTooLarge: "That file is larger than 100 MB. Please choose a smaller one.",
    fileTypeUnsupported: "That file has no extension, so its type cannot be detected.",
    fileNotSent:
      "The file was not delivered either — attach it manually if you email me directly.",
    attachmentRejected:
      "The mail provider refused that file. Try a PDF or an image, or email me directly.",
    attachmentAsLink:
      "Message sent — your file is attached to the email as a download link.",
    fileUploadFailed:
      "Your file could not be uploaded. Try again, or pick a smaller file.",
    tooManyFiles: "You can attach up to 5 files per message.",
    uploading: "Uploading…",
    verifying: "Checking verification…",
    tooManyUploads:
      "Too many upload attempts from this network. Try again in an hour, or attach one smaller file.",
  },
  honeypotLabel: "Website",
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
  title: "Yash | Full Stack Software Engineer in Bangladesh",
  description:
    "MD. Mohi Minul Islam Yash is a software engineer in Bangladesh working with React, Node.js, TypeScript, and Ruby on Rails. Open to remote and on-site roles.",
  keywords: [
    "Full Stack Developer",
    "React",
    "Ruby on Rails",
    "JavaScript",
    "Web Development",
    "Software Engineer",
  ],
  author: personalInfo.fullName,
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
