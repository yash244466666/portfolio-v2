# Portfolio Content Configuration

This directory contains all the centralized content for your portfolio website. Edit the content here instead of modifying individual components.

## Quick Edit Guide

### 🔧 Personal Information
- **File**: `index.ts` → `personalInfo`
- **What to edit**: Name, title, bio, typing animation titles

### 🔗 Links & Social Media
- **File**: `index.ts` → `socialLinks`
- **What to edit**: Social media URLs, contact links

### 📞 Contact Information  
- **File**: `index.ts` → `contactInfo`
- **What to edit**: Email, phone, location

### 🛠️ Skills & Expertise
- **File**: `index.ts` → `skills`
- **What to edit**: Skills titles, descriptions, icons

### 💼 Projects Portfolio
- **File**: `index.ts` → `projects`
- **What to edit**: Project titles, descriptions, tech stacks, images, links

### 📝 Text Content
- **File**: `index.ts` → `sectionContent`
- **What to edit**: Section headings, descriptions

### 🎨 UI Text & Buttons
- **File**: `index.ts` → `buttonTexts`, `formContent`
- **What to edit**: Button labels, form placeholders

## How to Update Content

1. **Edit the content** in `index.ts`
2. **Save the file** - changes will automatically reflect in your website
3. **Build and deploy** to see changes live

## Content Structure

```
lib/content/
├── index.ts      # Main content file - EDIT THIS
├── types.ts      # TypeScript definitions
└── README.md     # This guide
```

## Example: Adding a New Project

```typescript
// In index.ts → projects array, add:
{
  title: "My New Project",
  description: "Description of what this project does...",
  image: "/path-to-image.png",
  tech: ["React", "Node.js", "MongoDB"],
  github: "https://github.com/username/repo",
  live: "https://myproject.com"
}
```

## Example: Updating Social Links

```typescript
// In index.ts → socialLinks array, edit:
{
  name: "GitHub",
  url: "https://github.com/YOUR_USERNAME", // ← Update this
  icon: "Github"
}
```

## Example: Changing Contact Info

```typescript
// In index.ts → contactInfo array, edit:
{
  type: "email",
  label: "Email", 
  value: "your-new-email@domain.com", // ← Update this
  link: "mailto:your-new-email@domain.com" // ← Update this
}
```

## Tips for Content Management

- ✅ **DO**: Edit content in this `index.ts` file
- ❌ **DON'T**: Edit content directly in component files
- 💡 **TIP**: Use the validation function to check content integrity
- 📝 **NOTE**: All TODO comments indicate missing links that need to be filled

## Validation

Run content validation to ensure everything is properly configured:

```typescript
import { validateContent } from '@/lib/content'

const validation = validateContent()
if (!validation.isValid) {
  console.log('Content issues:', validation.errors)
}
```

---

**Need help?** All content is documented with comments in `index.ts`