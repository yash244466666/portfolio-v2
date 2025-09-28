// =============================================================================
// TYPE DEFINITIONS FOR PORTFOLIO CONTENT
// =============================================================================

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface ContactInfo {
  type: "email" | "phone" | "location";
  label: string;
  value: string;
  link?: string;
}

export interface Project {
  title: string;
  description: string;
  image: string;
  tech: string[];
  github: string;
  live: string;
}

export interface Skill {
  title: string;
  description: string;
  icon: string;
}

export interface NavigationItem {
  label: string;
  target: string;
}

export interface PersonalInfo {
  name: string;
  fullName: string;
  title: string;
  greeting: string;
  typingTitles: string[];
  tagline: string;
  aboutDescription: string;
  contactAvailability: string;
}

export interface SectionContent {
  about: {
    heading: string;
    description: string;
  };
  projects: {
    heading: string;
    description: string;
  };
  contact: {
    heading: string;
    description: string;
    formTitle: string;
    infoTitle: string;
  };
}

export interface FormContent {
  placeholders: {
    name: string;
    email: string;
    message: string;
  };
  labels: {
    name: string;
    email: string;
    message: string;
  };
}

export interface ButtonTexts {
  getInTouch: string;
  viewMyWork: string;
  letsTalk: string;
  sendMessage: string;
  code: string;
  liveDemo: string;
}

export interface FooterContent {
  copyrightYear: string;
  copyrightText: string;
}

export interface SiteMetadata {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  siteUrl: string;
}

export interface ContentValidation {
  isValid: boolean;
  errors: string[];
}
