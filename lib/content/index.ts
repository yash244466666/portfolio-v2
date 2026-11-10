// =============================================================================
// PORTFOLIO WEBSITE CONTENT MANAGEMENT MODULE
// =============================================================================
// This module centralizes all website content for easy editing and maintenance.
// Update content here instead of editing individual components.

import type {
  AdditionalWorkItem,
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
  AdditionalWorkItem,
  SocialLink,
  ContactInfo,
  Project,
  ProjectLink,
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

// =============================================================================
// PERSONAL INFORMATION
// =============================================================================
export const personalInfo: PersonalInfo = {
  // Compact navigation label and site brand.
  name: "YashCodes",
  // Primary public identity.
  fullName: "MD. Mohi Minul Islam Yash",
  nameFirstLine: "MD. Mohi Minul Islam",
  nameEmphasis: "Yash",
  title: "Full-Stack Software Engineer",
  greeting: "Hi, I'm",

  // Hero Section — the full-stack role is in the visible paragraph; these
  // rotating labels are decorative.
  typingTitles: [
    "Full-Stack Software Engineer",
    "Web Application Developer",
    "Automation and Integrations",
  ],

  tagline:
    "I'm a full-stack software engineer who builds web applications and custom AI agents. I built a marketplace booking system with connected calendars and added scheduled notifications for admins on another project. I've reverse-engineered parts of social platforms to build AI-assisted automation. I've also built tools that automate cybersecurity and open-source intelligence (OSINT) tasks for clients.",

  // About Section
  aboutDescription:
    "I'm MD. Mohi Minul Islam Yash, a full-stack software engineer. I like working with teammates to take a feature from the first conversation through release. I've worked with people across countries and cultures and led a team in one previous role. I've built web and mobile apps, download managers, and Unity games, and worked with languages from TypeScript to C++. I use AI agents in my own work and have built automations for teams and clients. I've also built cybersecurity and open-source intelligence (OSINT) automation tools for both clients and employers.",

  // Navigation resume download.
  // Deliberately unset until Yash approves the exact public PDF. Set this to a
  // same-origin path (and keep resumeFileName in sync) to re-enable the action.
  // resumeUrl: "/resume.pdf",
  resumeFileName: "MD-Mohi-Minul-Islam-Yash-Resume.pdf",
};

// =============================================================================
// SOCIAL MEDIA & CONTACT LINKS
// =============================================================================
// GitHub is verified. LinkedIn and X come from the résumé and the public
// GitHub profile. The Facebook account is the YashCodes brand page, so it is
// labelled as a brand presence and stays out of Person `sameAs`.
export const socialLinks: SocialLink[] = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/md-mohi-minul-islam-yash/",
    icon: "Linkedin",
    label: "Yash on LinkedIn",
    sameAs: true,
  },
  {
    name: "GitHub",
    url: "https://github.com/yash244466666",
    icon: "Github",
    label: "Yash on GitHub",
    sameAs: true,
  },
  {
    name: "X",
    url: "https://twitter.com/yash_solo000",
    icon: "Twitter",
    label: "Yash on X",
    sameAs: true,
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/yashcodes.for.you",
    icon: "Facebook",
    label: "YashCodes on Facebook",
    sameAs: false,
  },
  {
    name: "Email",
    url: "mailto:info@yashcodes.com",
    icon: "Mail",
    label: "Email Yash",
    sameAs: false,
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
      "I've built CRM and admin screens, provider booking and calendar interfaces, and a frontend for social media automation. I work with React, Next.js, TypeScript, and Rails ERB. I also build search-friendly landing pages and content sites with HTML, CSS, and vanilla JavaScript.",
    icon: "Code",
  },
  {
    title: "Backend Development",
    description:
      "I've built APIs and backend services with NestJS, plain Node.js, Python, Rust, and Ruby on Rails. I model application data and write queries with PostgreSQL, MySQL, Oracle Database, and MongoDB.",
    icon: "Server",
  },
  {
    title: "AI Agents & Automation",
    description:
      "I build custom AI agents and automate recurring tasks. One example is a desktop prototype that uses screenshots to plan mouse and keyboard actions from plain-language instructions.",
    icon: "Bot",
  },
  {
    title: "Social Media Automation",
    description:
      "I worked across the frontend and backend of a social media automation product. I reverse-engineered how parts of several platforms behaved, then used what I learned to build integrations and automate workflows with AI.",
    icon: "Globe",
  },
  {
    title: "Mobile Apps, Games, and Utilities",
    description:
      "I've built apps for Android and iOS, written download managers, and developed games in Unity with C#.",
    icon: "Smartphone",
  },
  {
    title: "Testing and Delivery",
    description:
      "I run automated checks and browser-based end-to-end tests, and I check the staging build by hand before release. I've used GitHub Actions, GitLab, and Bitbucket for CI/CD.",
    icon: "Zap",
  },
];

// =============================================================================
// PROJECTS PORTFOLIO
// =============================================================================
// Projects render on the home page as cards and open a detail modal on click.
// `description` is the card summary; `longDescription` adds modal-only context.
// Blank lines in `longDescription` become separate paragraphs.
//
// `links` are public destinations. `showOnCard` adds a separate live link to
// the card; otherwise the link appears only in the modal.
export const projects: Project[] = [
  {
    title: "Provider Scheduling and AI Marketplace",
    description:
      "I built the provider booking interface and backend, including connections to multiple calendars. For the newer AI marketplace, I built the payment system and a tool to find potential providers online.",
    longDescription:
      "On the original marketplace, I built the screens providers used to manage appointments and the backend that let them connect multiple external calendars.\n\nFor the newer AI marketplace, I built the payment system and worked on an AI voice feature that called providers to arrange bookings. I also built a system from scratch to find potential providers online who could join the marketplace.",
    image: "/project-cards/provider-scheduling-marketplace.webp",
    imageAlt:
      "Connected appointment calendars above symbols for payments, voice calls, and provider discovery.",
    artworkLabel: "Illustration",
    tech: [
      "Appointment Scheduling",
      "Calendar Integrations",
      "Payments",
      "AI Voice Calling",
    ],
    role: "Software Engineer",
  },
  {
    title: "AI Social Media Automation",
    description:
      "I built frontend and backend features for a SaaS product that used AI to automate tasks across social media platforms.",
    longDescription:
      "The product needed to work across several social and professional networks. Where documentation was limited, I reverse-engineered how parts of those platforms behaved. I used what I learned to build integrations, then used AI to automate workflows that depended on them.",
    image: "/project-cards/ai-social-media-automation.webp",
    imageAlt:
      "Social post and message tiles connected to an AI workflow and integration hub.",
    artworkLabel: "Illustration",
    tech: ["SaaS", "AI Automation", "Platform Integrations"],
    role: "Full-Stack Developer",
  },
  {
    title: "ERP, CRM, and POS Systems",
    description:
      "I built custom ERP, CRM, and point-of-sale systems, including interfaces and backend features for business records and internal workflows.",
    longDescription:
      "I worked on React interfaces and Node.js, Express, and MongoDB backends for ERP, CRM, and ticketing applications. I also built several point-of-sale systems for clients. I made a separate Next.js POS demo so people could see an example of the kind of work I do.",
    image: "/project-cards/erp-crm-pos-systems.webp",
    imageAlt:
      "Point-of-sale terminal connected to customer, inventory, and support ticket modules.",
    artworkLabel: "Illustration",
    tech: ["ERP", "CRM", "Point of Sale", "Ticketing"],
    role: "Full-Stack Developer",
    links: [
      {
        label: "View POS Demo Code",
        href: "https://github.com/yash244466666/ospos-nextjs",
        external: true,
      },
    ],
  },
  {
    title: "Lost and Found App",
    description:
      "I built a feature that sent administrators scheduled updates about activity on a lost-and-found website.",
    longDescription:
      "I added the notification feature to an existing Ruby on Rails app. It sent site activity updates to administrators at scheduled times so they could keep track of what was happening on the site.",
    image: "/project-cards/lost-and-found-notifications.webp",
    imageAlt:
      "A tagged set of keys and a backpack linked to a notification bell and clock.",
    artworkLabel: "Illustration",
    tech: ["Ruby on Rails", "Scheduled Notifications"],
    role: "Software Developer",
  },
  {
    title: "Open-World Puzzle Game",
    description:
      "I built the open world, menus, and character interactions for a multi-level puzzle game in Unity and C#.",
    longDescription:
      "Players explored a city, collected puzzle pieces, and brought them back to the city center to solve the puzzle and finish each level. I built the open world they explored, the game menus, and the way the character interacted with the environment.",
    image: "/project-cards/open-world-puzzle-game.webp",
    imageAlt:
      "Glowing puzzle pieces along city streets leading to a partly assembled puzzle in the central plaza.",
    artworkLabel: "Illustration",
    tech: ["Unity", "C#", "Open-World Game"],
    role: "Game Development",
  },
  {
    title: "Vision Desktop Agent",
    description:
      "I built a prototype that uses a vision model to interpret desktop screenshots and plan mouse and keyboard actions from plain-language instructions.",
    longDescription:
      "I built a desktop agent for an employer and created this separate public prototype to illustrate the approach. A custom GNOME Shell extension exposes screen capture over D-Bus on Wayland. The Python loop sends each screenshot and task to a cloud vision model, reads the structured action it returns, then captures a fresh view for the next step.\n\nThe public repository documents the architecture and contains prototype code. The current checkout is incomplete and does not run end to end.",
    image: "/project-cards/vision-desktop-agent.webp",
    imageAlt:
      "Desktop monitor with a cursor selecting a highlighted control and an arrow looping back to a vision lens.",
    artworkLabel: "Illustration",
    tech: ["Python", "Vision Models", "GNOME / Wayland"],
    role: "AI Agent Development",
    links: [
      {
        label: "View Repository",
        href: "https://github.com/yash244466666/vision-desktop-agent",
        external: true,
        showOnCard: true,
      },
    ],
  },
];

// =============================================================================
// MORE ENGINEERING WORK
// =============================================================================
export const additionalWork: AdditionalWorkItem[] = [
  {
    title: "Mobile Applications",
    description:
      "I've built apps for Android and iOS alongside my work on web applications.",
  },
  {
    title: "Download Managers",
    description: "I've built download managers for handling file downloads.",
  },
  {
    title: "AI Agent Workflows",
    description:
      "I use AI agents in my own work and have built automations for teams and clients.",
  },
  {
    title: "Cybersecurity and OSINT Tools",
    description:
      "I've built tools that automate cybersecurity and open-source intelligence tasks for both clients and employers.",
  },
];

// =============================================================================
// PROJECT DETAIL MODAL COPY
// =============================================================================
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
  // Heading above the optional public links list.
  linksHeading: "Links",
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
  downloadResume: "Download Resume",
  viewDetails: "View Project Details",
};

// =============================================================================
// SECTION HEADINGS & DESCRIPTIONS
// =============================================================================
export const sectionContent: SectionContent = {
  about: {
    heading: "About Me",
    description:
      "I'm MD. Mohi Minul Islam Yash, a full-stack software engineer. I like working with teammates to take a feature from the first conversation through release. I've worked with people across countries and cultures and led a team in one previous role. I've built web and mobile apps, download managers, and Unity games, and worked with languages from TypeScript to C++. I use AI agents in my own work and have built automations for teams and clients. I've also built cybersecurity and open-source intelligence (OSINT) automation tools for both clients and employers.",
  },
  projects: {
    heading: "Featured Projects",
    description:
      "Here are some of the systems I've built, from provider booking and business applications to AI automation and games. Open a project to see what I worked on and how it fit into the product.",
    moreWorkHeading: "More Engineering Work",
  },
  contact: {
    heading: "Let's Talk About Your Team",
    description:
      "I'm open to full-stack software engineering roles. If you're hiring, I'd like to hear what your team is building and where I could help.",
    formTitle: "Send Me a Message",
    formDescription:
      "A short note is enough to get started. If you have a job description or project brief, you can attach it.",
    infoTitle: "Reach Me Directly",
    infoDescription: "Prefer email or a quick call? Here's how to reach me.",
  },
};

// =============================================================================
// FORM PLACEHOLDERS & LABELS
// =============================================================================
export const formContent: FormContent = {
  placeholders: {
    name: "Your Name",
    email: "Your Email",
    message: "Tell me about the role or what you'd like to discuss.",
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
    privacy: "Your file is stored privately and deleted after 30 days.",
  },
  status: {
    sending: "Sending your message…",
    success: "Message sent. Check your inbox for a confirmation.",
    successNoConfirmation:
      "Your message reached me. The confirmation email could not be sent.",
    error:
      "Your message could not be sent. Try again or email me directly.",
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
    fileTypeUnsupported:
      "That file has no extension, so its type cannot be detected.",
    fileNotSent:
      "The file was not delivered either — attach it manually if you email me directly.",
    attachmentRejected:
      "The mail provider refused that file. Try a PDF or an image, or email me directly.",
    attachmentAsLink:
      "Message sent. Your file was shared as a download link.",
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
  copyrightText: `© ${new Date().getFullYear()} MD. Mohi Minul Islam Yash. All rights reserved.`,
};

// =============================================================================
// WEBSITE METADATA
// =============================================================================
export const siteMetadata: SiteMetadata = {
  title: "MD. Mohi Minul Islam Yash – Full-Stack Software Engineer",
  description:
    "MD. Mohi Minul Islam Yash is a full-stack software engineer who builds web applications, integrations, and custom AI agents.",
  keywords: [
    "MD. Mohi Minul Islam Yash",
    "Mohi Minul Islam Yash",
    "Yash Sikdar",
    "YashCodes",
    "Full-Stack Software Engineer",
    "Web Application Developer",
    "Automation and Integrations",
    "React",
    "Next.js",
    "Node.js",
    "Ruby on Rails",
    "AI automation",
    "OSINT",
  ],
  author: "MD. Mohi Minul Islam Yash",
  siteUrl: "https://yashcodes.com",
  ogImage: "/og-image.png",
  jobTitle: "Full-Stack Software Engineer",
  twitterHandle: "@yash_solo000",
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
  if (!personalInfo.name) errors.push("Personal brand name is required");
  if (!personalInfo.fullName) errors.push("Personal full name is required");
  if (!personalInfo.tagline) errors.push("Personal tagline is required");

  // Check social links
  if (socialLinks.length === 0)
    errors.push("At least one social link is required");

  // Check projects
  if (projects.length === 0) errors.push("At least one project is required");
  projects.forEach((project) => {
    if (!project.imageAlt) {
      errors.push(`Project "${project.title}" needs image alt text`);
    }
  });

  // Check skills
  if (skills.length === 0) errors.push("At least one skill is required");

  return {
    isValid: errors.length === 0,
    errors,
  };
};
