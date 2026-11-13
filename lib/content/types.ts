// =============================================================================
// TYPE DEFINITIONS FOR PORTFOLIO CONTENT
// =============================================================================

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  /** Accessible name for the icon-only profile link. */
  label: string;
  /**
   * Whether this is a personal profile that may appear in Person `sameAs`
   * structured data. Brand pages stay in the footer but stay out of `sameAs`.
   */
  sameAs?: boolean;
}

export interface ContactInfo {
  type: "email" | "phone" | "location";
  label: string;
  value: string;
  link?: string;
}

/** A destination attached to a project record. */
export interface ProjectLink {
  label: string;
  href: string;
  /** Open in a new tab with rel="noopener noreferrer". */
  external?: boolean;
  /** Render this link on the card as well as inside the detail modal. */
  showOnCard?: boolean;
}

export interface Project {
  title: string;
  /** Short summary shown on the card and at the top of the modal. */
  description: string;
  /**
   * Longer modal copy. Blank lines become separate paragraphs.
   * Falls back to `description` when omitted.
   */
  longDescription?: string;
  image: string;
  /** Alt text for the card and modal artwork. Required for the new records. */
  imageAlt: string;
  /**
   * Visible label over the artwork, for example "Illustration" on concept
   * images. Omit it for real screenshots.
   */
  artworkLabel?: string;
  /** Up to four short tags; the card renders all of them. */
  tech: string[];
  /** Role label shown on the card and in the modal meta row. */
  role?: string;
  /** Optional year label shown in the modal meta row. */
  year?: string;
  /** Optional bullet points listed under the modal's highlights heading. */
  highlights?: string[];
  /** Public destinations: demo code, the tools directory, a case study. */
  links?: ProjectLink[];
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
  /** Heading above the optional public links list. */
  linksHeading: string;
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
  /** Compact brand label used in the navigation. */
  name: string;
  /** Full name used in the hero, About, footer, titles, and structured data. */
  fullName: string;
  /** First line of the hero heading. */
  nameFirstLine: string;
  /** Emphasised second line of the hero heading. */
  nameEmphasis: string;
  title: string;
  greeting: string;
  typingTitles: string[];
  tagline: string;
  aboutDescription: string;
  /**
   * Resume link used by the navigation download button.
   * Omit it (or set it to an empty string or "#") to hide the button.
   * Root-relative and relative URLs download; cross-origin URLs open in a new tab.
   */
  resumeUrl?: string;
  /** Optional file name suggested when the resume is downloaded. */
  resumeFileName?: string;
}

export interface AdditionalWorkItem {
  title: string;
  description: string;
}

export interface SectionContent {
  about: {
    heading: string;
    description: string;
  };
  projects: {
    heading: string;
    description: string;
    moreWorkHeading: string;
  };
  contact: {
    heading: string;
    description: string;
    formTitle: string;
    formDescription: string;
    infoTitle: string;
    infoDescription: string;
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
  /** Optional file attachment field. */
  attachment: {
    /** Field label. */
    label: string;
    /** Suffix marking the field as optional. */
    optional: string;
    /** Button label that opens the file picker. */
    choose: string;
    /** Helper text listing accepted types and the size ceiling. */
    hint: string;
    /** Action that clears the selected file. */
    remove: string;
    /** Line explaining where the file goes. */
    privacy: string;
    /** Shown instead of the picker once the file limit is reached. */
    limitReached: string;
  };
  status: {
    /** Button/status copy shown while the request is in flight. */
    sending: string;
    /** Success copy when both emails were sent. */
    success: string;
    /** Success copy when the owner email was sent but the confirmation failed. */
    successNoConfirmation: string;
    /** Generic failure copy; the form also offers a mailto fallback. */
    error: string;
    /** Shown when the Turnstile token is missing. */
    verificationRequired: string;
    /** Shown when the Turnstile script cannot load. */
    verificationUnavailable: string;
    /** Shown when the public endpoint/site key are missing at build time. */
    notConfigured: string;
    /** Link text for the mailto fallback. */
    fallback: string;
    /** Privacy note shown near the form. */
    privacy: string;
    /** Shown when the selected file exceeds the size limit. */
    fileTooLarge: string;
    /** Shown when the selected file's extension is not accepted. */
    fileTypeUnsupported: string;
    /** Shown when the send failed while a file was selected. */
    fileNotSent: string;
    /** Shown when the mail provider refuses the attached file. */
    attachmentRejected: string;
    /** Success copy when the file was stored and shared as a download link. */
    attachmentAsLink: string;
    /** Shown when the direct upload to storage failed. */
    fileUploadFailed: string;
    /** Shown when the visitor picks more files than allowed. */
    tooManyFiles: string;
    /** Progress label while files upload. */
    uploading: string;
    /** Shown while waiting for the Turnstile token. */
    verifying: string;
    /** Shown when the upload rate limit is hit. */
    tooManyUploads: string;
    /**
     * Cloudflare attribution shown next to the submit button. The Turnstile
     * widget stays hidden unless a challenge is required, so the branding is
     * carried by this line instead.
     */
    protectedBy: string;
  };
  /** Label for the hidden honeypot input. */
  honeypotLabel: string;
}

export interface ButtonTexts {
  viewMyWork: string;
  letsTalk: string;
  sendMessage: string;
  /** Optional resume button label; falls back to "Download Resume". */
  downloadResume?: string;
  /** Visible project card action. */
  viewDetails: string;
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
  /** Social share image, root-relative or absolute. */
  ogImage: string;
  jobTitle: string;
  /** Optional X/Twitter handle, e.g. "@yash_solo000". */
  twitterHandle?: string;
}

export interface ContentValidation {
  isValid: boolean;
  errors: string[];
}
