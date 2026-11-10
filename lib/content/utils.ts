// =============================================================================
// CONTENT MANAGEMENT UTILITIES
// =============================================================================
// Helper functions and utilities for managing portfolio content

import {
  personalInfo,
  socialLinks,
  contactInfo,
  skills,
  projects,
  additionalWork,
  projectModalContent,
  sectionContent,
  buttonTexts,
  formContent,
  footerContent,
  siteMetadata,
  type Project,
  type SectionContent,
} from "./index";

// =============================================================================
// CONTENT GETTERS - USE THESE IN COMPONENTS
// =============================================================================

/**
 * Get all personal information
 */
export const getPersonalInfo = () => personalInfo;

/**
 * Get all social links
 */
export const getSocialLinks = () => socialLinks;

/**
 * Get all contact information
 */
export const getContactInfo = () => contactInfo;

/**
 * Get all skills
 */
export const getSkills = () => skills;

/**
 * Get all projects
 */
export const getProjects = () => projects;

/**
 * Get the text-only "More Engineering Work" entries.
 */
export const getAdditionalWork = () => additionalWork;

/**
 * Get project detail modal copy (labels and accessible names)
 */
export const getProjectModalContent = () => projectModalContent;

/**
 * Get section content by section name. Overloads keep each section's fields
 * typed instead of returning a union of every section shape.
 */
export function getSectionContent(section: "about"): SectionContent["about"];
export function getSectionContent(section: "projects"): SectionContent["projects"];
export function getSectionContent(section: "contact"): SectionContent["contact"];
export function getSectionContent(section: "about" | "projects" | "contact") {
  return sectionContent[section];
}

/**
 * Get button texts
 */
export const getButtonTexts = () => buttonTexts;

/**
 * Get form content
 */
export const getFormContent = () => formContent;

/**
 * Get footer content
 */
export const getFooterContent = () => footerContent;

/**
 * Get site metadata
 */
export const getSiteMetadata = () => siteMetadata;

/**
 * Personal profile URLs eligible for Person `sameAs` structured data.
 * Brand pages and the mailto link are deliberately excluded.
 */
export const getPersonSameAsLinks = () => {
  return socialLinks
    .filter((link) => link.sameAs && /^https?:\/\//i.test(link.url))
    .map((link) => link.url);
};

// =============================================================================
// SPECIFIC CONTENT SELECTORS
// =============================================================================

/**
 * Get typing animation titles for hero section
 */
export const getTypingTitles = () => personalInfo.typingTitles;

/**
 * Get main tagline
 */
export const getTagline = () => personalInfo.tagline;

/**
 * Get about description
 */
export const getAboutDescription = () => personalInfo.aboutDescription;

/**
 * Get featured projects (limit optional)
 */
export const getFeaturedProjects = (limit?: number) => {
  return limit ? projects.slice(0, limit) : projects;
};

/**
 * Get skills by category (if you want to group them later)
 */
export const getSkillsByCategory = () => {
  // For now return all skills, but this can be extended to categorize
  return skills;
};

/**
 * Get social links for header/footer
 */
export const getSocialLinksForDisplay = () => {
  return socialLinks.map((link) => ({
    ...link,
    href: link.url,
  }));
};

/**
 * Get contact information formatted for display
 */
export const getContactInfoForDisplay = () => {
  return contactInfo.map((info) => ({
    ...info,
    href: info.link || "#",
  }));
};

// =============================================================================
// CONTENT SEARCH & FILTER UTILITIES
// =============================================================================

/**
 * Search projects by technology
 */
export const getProjectsByTech = (tech: string) => {
  return projects.filter((project) =>
    project.tech.some((t) => t.toLowerCase().includes(tech.toLowerCase()))
  );
};

/**
 * Whether a project link is still a "#" placeholder (or missing).
 * Placeholder links must never be rendered as working links.
 */
export const isPlaceholderLink = (url?: string | null): boolean =>
  !url || url.trim() === "#";

/**
 * Search skills by keyword
 */
export const getSkillsByKeyword = (keyword: string) => {
  return skills.filter(
    (skill) =>
      skill.title.toLowerCase().includes(keyword.toLowerCase()) ||
      skill.description.toLowerCase().includes(keyword.toLowerCase())
  );
};

// =============================================================================
// CONTENT VALIDATION UTILITIES
// =============================================================================

/**
 * Check if project has complete information
 */
export const isProjectComplete = (project: Project): boolean => {
  return !!(
    project.title &&
    project.description &&
    project.image &&
    project.imageAlt &&
    project.tech.length > 0
  );
};

/**
 * Validate social links
 */
export const validateSocialLinks = () => {
  const issues: string[] = [];

  socialLinks.forEach((link) => {
    if (!link.url || link.url.startsWith("#")) {
      issues.push(`${link.name} needs a valid URL`);
    }
    if (!link.label) {
      issues.push(`${link.name} needs an accessible label`);
    }
  });

  return issues;
};

// =============================================================================
// CONTENT STATISTICS
// =============================================================================

/**
 * Get content statistics
 */
export const getContentStats = () => {
  return {
    totalProjects: projects.length,
    projectsWithLinks: projects.filter((project) => (project.links?.length ?? 0) > 0)
      .length,
    incompleteProjects: projects.filter((project) => !isProjectComplete(project))
      .length,
    totalSkills: skills.length,
    totalSocialLinks: socialLinks.length,
    totalAdditionalWork: additionalWork.length,
    contentCompleteness: {
      projects:
        (projects.filter((project) => isProjectComplete(project)).length /
          projects.length) *
        100,
      socialLinks:
        (socialLinks.filter((link) => !link.url.startsWith("#")).length /
          socialLinks.length) *
        100,
    },
  };
};

// =============================================================================
// EXPORT ALL UTILITIES
// =============================================================================

export const contentUtils = {
  // Getters
  getPersonalInfo,
  getSocialLinks,
  getContactInfo,
  getSkills,
  getProjects,
  getAdditionalWork,
  getProjectModalContent,
  getSectionContent,
  getButtonTexts,
  getFormContent,
  getFooterContent,
  getSiteMetadata,
  getPersonSameAsLinks,

  // Specific selectors
  getTypingTitles,
  getTagline,
  getAboutDescription,
  getFeaturedProjects,
  getSkillsByCategory,
  getSocialLinksForDisplay,
  getContactInfoForDisplay,

  // Search & filter
  getProjectsByTech,
  isPlaceholderLink,
  getSkillsByKeyword,

  // Validation
  isProjectComplete,
  validateSocialLinks,

  // Statistics
  getContentStats,
};

export default contentUtils;
