#!/usr/bin/env node
/**
 * Content Management System Test & Validation Script
 *function showContentStructure() {
  console.log('\n📋 Content Management Structure:');
  console.log('lib/content/');
  console.log('├── index.ts          # 🎯 MAIN CONTENT FILE - Edit this!');
  console.log('├── types.ts          # TypeScript definitions');
  console.log('├── utils.ts          # Helper functions');
  console.log('├── validate.js       # Content validation script');
  console.log('└── README.md         # Documentation');
} script to validate your portfolio content structure
 */

const path = require ('path');

// Mock content for testing (in real environment, this would import from the actual content module)
const mockContent = {
  personalInfo: {
    name: 'Yash',
    fullName: 'MD. Mohi Minul Islam Yash',
    title: 'Full Stack Software Engineer',
  },
  projects: [
    {title: 'Project 1', github: '#', live: 'https://example.com'},
    {title: 'Project 2', github: '#', live: '#'},
  ],
  socialLinks: [
    {name: 'GitHub', url: 'https://github.com/yashcodes'},
    {name: 'LinkedIn', url: 'https://linkedin.com/in/yashcodes'},
  ],
};

function validateContent () {
  console.log ('🚀 Portfolio Content Validation Started...\n');

  const issues = [];
  const stats = {
    totalProjects: mockContent.projects.length,
    projectsWithPlaceholders: 0,
    socialLinksValid: 0,
  };

  // Check projects
  console.log ('📁 Validating Projects...');
  mockContent.projects.forEach ((project, index) => {
    console.log (`  ✓ ${project.title}`);
    if (project.github === '#' || project.live === '#') {
      stats.projectsWithPlaceholders++;
      issues.push (`Project "${project.title}" has placeholder links`);
    }
  });

  // Check social links
  console.log ('\n🔗 Validating Social Links...');
  mockContent.socialLinks.forEach (link => {
    console.log (`  ✓ ${link.name}: ${link.url}`);
    if (!link.url.startsWith ('#')) {
      stats.socialLinksValid++;
    }
  });

  // Display results
  console.log ('\n📊 Content Statistics:');
  console.log (`  • Total Projects: ${stats.totalProjects}`);
  console.log (
    `  • Projects needing real links: ${stats.projectsWithPlaceholders}`
  );
  console.log (
    `  • Valid social links: ${stats.socialLinksValid}/${mockContent.socialLinks.length}`
  );

  if (issues.length > 0) {
    console.log ('\n⚠️  Issues to resolve:');
    issues.forEach ((issue, index) => {
      console.log (`  ${index + 1}. ${issue}`);
    });
  }

  console.log ('\n🎉 Content validation complete!');
  console.log ('\n💡 To update content:');
  console.log ('   1. Edit /lib/content/index.ts');
  console.log ('   2. Replace placeholder links (#) with real URLs');
  console.log ('   3. Run your build process');

  return issues.length === 0;
}

function showContentStructure () {
  console.log ('\n📋 Content Management Structure:');
  console.log ('lib/content/');
  console.log ('├── index.ts          # 🎯 MAIN CONTENT FILE - Edit this!');
  console.log ('├── types.ts          # TypeScript definitions');
  console.log ('├── utils.ts          # Helper functions');
  console.log ('├── examples.tsx      # Usage examples');
  console.log ('└── README.md         # Documentation');
}

function main () {
  console.log ('🌟 Portfolio Content Management System');
  console.log ('=====================================\n');

  showContentStructure ();
  validateContent ();

  console.log ('\n✨ Ready to customize your portfolio content!');
}

if (require.main === module) {
  main ();
}

module.exports = {validateContent, showContentStructure};
