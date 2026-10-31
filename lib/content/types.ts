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
  /**
   * Whether to render the "Code" action for this project.
   * Defaults to `true` when omitted.
   */
  showCode?: boolean;
  /**
   * Whether to render the "Live Demo" action for this project.
   * Defaults to `true` when omitted.
   */
  showLiveDemo?: boolean;
  /**
   * Optional long-form copy shown in the project detail modal.
   * The modal falls back to `description` when this is omitted.
   */
  longDescription?: string;
  /**
   * Optional bullet points listed under the modal's highlights heading.
   * The highlights section is hidden when this is missing or empty.
   */
  highlights?: string[];
  /** Optional role label shown in the modal meta row; hidden when omitted. */
  role?: string;
  /** Optional year label shown in the modal meta row; hidden when omitted. */
  year?: string;
}

/**
 * User-facing labels for the project detail modal.
 * Kept here so all modal copy can be edited in one place.
 */
export interface ProjectModalContent {
  /**
   * Accessible label for the full-card button that opens the modal.
   * `{title}` is replaced with the project title.
   */
  openLabelTemplate: string;
  /** Accessible label for the modal close button. */
  closeLabel: string;
  /** Heading above the optional highlights list. */
  highlightsHeading: string;
  /** Label preceding the optional project role. */
  roleLabel: string;
  /** Label preceding the optional project year. */
  yearLabel: string;
  /** Hint appended to actions whose link is still a `#` placeholder. */
  unavailableLabel: string;
}

export interface Skill {
  title: string;
  description: string;
  icon: string;
}

export interface NavigationItem {
  label: string;
  target: string;
  href?: string;
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
  /**
   * Resume link used by the navigation download button.
   * Omit it (or set it to an empty string or "#") to hide the button.
   * Root-relative and relative URLs download; cross-origin URLs open in a new tab.
   */
  resumeUrl?: string;
  /** Optional file name suggested when the resume is downloaded. */
  resumeFileName?: string;
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
  viewMyWork: string;
  letsTalk: string;
  sendMessage: string;
  code: string;
  liveDemo: string;
  /** Optional resume button label; falls back to "Download Resume". */
  downloadResume?: string;
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
