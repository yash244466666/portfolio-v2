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
  sectionContent,
  buttonTexts,
  formContent,
  footerContent,
  siteMetadata,
  type SocialLink,
  type ContactInfo,
  type Project,
  type Skill,
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
 * Get section content by section name
 */
export const getSectionContent = (
  section: "about" | "projects" | "contact"
) => {
  return sectionContent[section];
};

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
 * Get projects with live demos
 */
export const getProjectsWithDemos = () => {
  return projects.filter((project) => project.live && project.live !== "#");
};

/**
 * Get projects with GitHub links
 */
export const getProjectsWithGitHub = () => {
  return projects.filter((project) => project.github && project.github !== "#");
};

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
    project.tech.length > 0
  );
};

/**
 * Get incomplete projects (missing links, etc.)
 */
export const getIncompleteProjects = () => {
  return projects.filter(
    (project) =>
      project.github === "#" ||
      project.live === "#" ||
      !isProjectComplete(project)
  );
};

/**
 * Get projects that need attention (placeholder links)
 */
export const getProjectsNeedingLinks = () => {
  return projects.filter(
    (project) => project.github === "#" || project.live === "#"
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
    projectsWithDemos: getProjectsWithDemos().length,
    projectsWithGitHub: getProjectsWithGitHub().length,
    incompleteProjects: getIncompleteProjects().length,
    totalSkills: skills.length,
    totalSocialLinks: socialLinks.length,
    contentCompleteness: {
      projects:
        ((getProjectsWithDemos().length + getProjectsWithGitHub().length) /
          (projects.length * 2)) *
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
  getSectionContent,
  getButtonTexts,
  getFormContent,
  getFooterContent,
  getSiteMetadata,

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
  getProjectsWithDemos,
  getProjectsWithGitHub,
  getSkillsByKeyword,

  // Validation
  isProjectComplete,
  getIncompleteProjects,
  getProjectsNeedingLinks,
  validateSocialLinks,

  // Statistics
  getContentStats,
};

export default contentUtils;
