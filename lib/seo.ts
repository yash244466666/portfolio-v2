import type { Metadata } from "next";
import {
  additionalWork,
  contactInfo,
  personalInfo,
  projects,
  skills,
  siteMetadata,
  socialLinks,
} from "@/lib/content";
import { toolPages, type ToolPageContent } from "@/lib/content/tool-pages";
import { getPersonSameAsLinks } from "@/lib/content/utils";

export const SITE_URL = siteMetadata.siteUrl.replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export const HOME_TITLE = siteMetadata.title;
export const HOME_DESCRIPTION = siteMetadata.description;
export const TOOLS_TITLE = "Free Online Developer Tools – YashCodes";
export const TOOLS_DESCRIPTION =
  "Use 88 free browser-based developer tools from YashCodes: format JSON, convert timestamps, compress images, generate meta tags, and more.";

const FREE_OFFER = {
  "@type": "Offer",
  price: "0",
  priceCurrency: "USD",
} as const;

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
  imageAlt?: string;
  imagePath?: string;
  keywords?: string[];
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/**
 * Build a complete, unique metadata block for an indexable page: absolute
 * title, description, keywords, full-snippet robots rules, canonical, Open
 * Graph, and a Twitter card.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  type = "website",
  imageAlt,
  imagePath,
  keywords,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const image = absoluteUrl(imagePath ?? siteMetadata.ogImage);
  const alt = imageAlt ?? `${personalInfo.fullName} — ${siteMetadata.jobTitle}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description,
    keywords: keywords ?? siteMetadata.keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: url,
      types: {
        "text/plain": [
          { url: absoluteUrl("/llms.txt"), title: "LLMs Summary" },
          { url: absoluteUrl("/llms-full.txt"), title: "LLMs Full Context" },
        ],
      },
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: "YashCodes",
      locale: "en_US",
      images: [
        {
          url: image,
          width: 1200,
          height: imagePath ? 675 : 630,
          alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      ...(siteMetadata.twitterHandle
        ? {
            site: siteMetadata.twitterHandle,
            creator: siteMetadata.twitterHandle,
          }
        : {}),
    },
  };
}

export function buildHomeMetadata(): Metadata {
  return buildPageMetadata({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: "/",
    type: "profile",
  });
}

/** Build a schema.org BreadcrumbList entity for sub-pages. */
export function buildBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * WebSite + ProfilePage + Person + Projects ItemList graph for the
 * homepage. The Person @id is stable so sub-pages and profiles can reference the
 * same entity cleanly for both search engines and AI answer engines.
 */
export function buildHomeStructuredData() {
  const personId = `${SITE_URL}/#person`;
  const websiteId = `${SITE_URL}/#website`;
  const profileId = `${SITE_URL}/#profile`;
  const projectsListId = `${SITE_URL}/#projects`;

  const projectSummaries = projects.map((project, index) => {
    const primaryUrl = absoluteUrl(project.links?.[0]?.href ?? "/#projects");
    return {
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: project.title,
        description: project.description,
        url: primaryUrl,
        image: absoluteUrl(project.image),
        keywords: project.tech.join(", "),
        author: { "@id": personId },
      },
    };
  });

  const brandSameAs = socialLinks
    .filter((link) => !link.sameAs && /^https?:\/\//i.test(link.url))
    .map((link) => link.url);
  const phone = contactInfo.find((info) => info.type === "phone")?.value;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: `${SITE_URL}/`,
        name: "YashCodes",
        description: siteMetadata.description,
        inLanguage: "en",
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": profileId,
        url: `${SITE_URL}/`,
        name: siteMetadata.title,
        description: siteMetadata.description,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": personId },
        about: { "@id": projectsListId },
        dateModified: "2026-11-16",
        inLanguage: "en",
      },
      {
        "@type": "Person",
        "@id": personId,
        name: personalInfo.fullName,
        alternateName: [
          personalInfo.nameEmphasis,
          "Yash Sikdar",
          "Mohi Minul Islam Yash",
          personalInfo.name,
        ],
        jobTitle: siteMetadata.jobTitle,
        description: personalInfo.aboutDescription,
        url: `${SITE_URL}/`,
        mainEntityOfPage: `${SITE_URL}/`,
        image: absoluteUrl(siteMetadata.ogImage),
        email: "mailto:info@yashcodes.com",
        ...(phone ? { telephone: phone } : {}),
        sameAs: getPersonSameAsLinks(),
        brand: {
          "@type": "Brand",
          name: personalInfo.name,
          url: `${SITE_URL}/`,
          ...(brandSameAs.length ? { sameAs: brandSameAs } : {}),
        },
        hasOccupation: {
          "@type": "Occupation",
          name: siteMetadata.jobTitle,
          occupationLocation: {
            "@type": "Country",
            name: "Bangladesh",
          },
          skills: skills.map((skill) => skill.title),
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Barisal",
          addressCountry: "BD",
        },
        knowsAbout: [
          "Full-stack web development",
          "React",
          "Next.js",
          "TypeScript",
          "Node.js",
          "NestJS",
          "Ruby on Rails",
          "PostgreSQL",
          "MySQL",
          "MongoDB",
          "Python",
          "Rust",
          "Custom AI agents",
          "AI automation",
          "Social media automation",
          "Marketplace booking and scheduling systems",
          "Open-source intelligence",
          "Cybersecurity automation",
          "Unity",
          "C#",
          ...additionalWork.map((item) => item.title),
        ],
      },
      {
        "@type": "ItemList",
        "@id": projectsListId,
        name: "Featured Projects by MD. Mohi Minul Islam Yash",
        numberOfItems: projectSummaries.length,
        itemListElement: projectSummaries,
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/tools/#app`,
        name: "YashCodes Developer Tools",
        description: TOOLS_DESCRIPTION,
        url: absoluteUrl("/tools/"),
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements:
          "Requires JavaScript. Runs in a modern web browser; most tools run locally on your device.",
        isAccessibleForFree: true,
        offers: FREE_OFFER,
        author: { "@id": personId },
      },
    ],
  };
}

/** Structured data graph for the /tools/ directory page. */
export function buildToolsDirectoryStructuredData() {
  const personId = `${SITE_URL}/#person`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/tools/#page`,
        url: absoluteUrl("/tools/"),
        name: TOOLS_TITLE,
        description: TOOLS_DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        author: { "@id": personId },
        inLanguage: "en",
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/tools/#app`,
        name: "YashCodes Developer Tools",
        description: TOOLS_DESCRIPTION,
        url: absoluteUrl("/tools/"),
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements:
          "Requires JavaScript. Runs in a modern web browser; most tools run locally on your device.",
        isAccessibleForFree: true,
        offers: FREE_OFFER,
        author: { "@id": personId },
      },
      {
        "@type": "ItemList",
        name: "Featured Standalone Developer Tools",
        numberOfItems: toolPages.length,
        itemListElement: toolPages.map((page, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: page.heading,
          url: absoluteUrl(`/tools/${page.slug}/`),
        })),
      },
      buildBreadcrumbStructuredData([
        { name: "Home", path: "/" },
        { name: "Developer Tools", path: "/tools/" },
      ]),
    ],
  };
}

/**
 * Structured data graph for each standalone /tools/[slug]/ page:
 * WebApplication + FAQPage (using the page's worked answer) + BreadcrumbList.
 */
export function buildToolPageStructuredData(page: ToolPageContent) {
  const personId = `${SITE_URL}/#person`;
  const pageUrl = absoluteUrl(`/tools/${page.slug}/`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#app`,
        name: page.heading,
        description: page.intro,
        url: pageUrl,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript. Runs locally in a modern web browser.",
        isAccessibleForFree: true,
        offers: FREE_OFFER,
        mainEntityOfPage: pageUrl,
        isPartOf: { "@id": `${SITE_URL}/tools/#app` },
        author: {
          "@id": personId,
          "@type": "Person",
          name: personalInfo.fullName,
          url: `${SITE_URL}/`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `How does the YashCodes ${page.heading} work?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${page.intro} ${page.answer.join(" ")}`,
            },
          },
          ...(page.example.note
            ? [
                {
                  "@type": "Question",
                  name: `${page.example.title} — what should I expect?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: page.example.note,
                  },
                },
              ]
            : []),
        ],
      },
      buildBreadcrumbStructuredData([
        { name: "Home", path: "/" },
        { name: "Developer Tools", path: "/tools/" },
        { name: page.label, path: `/tools/${page.slug}/` },
      ]),
    ],
  };
}

/** Structured data graph for the /projects/yashcodes/ case study page. */
export function buildCaseStudyStructuredData() {
  const personId = `${SITE_URL}/#person`;
  const url = absoluteUrl("/projects/yashcodes/");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: "YashCodes Developer Tools Case Study",
        description:
          "How YashCodes combines 88 browser utilities in one static Next.js site.",
        datePublished: "2026-11-10",
        dateModified: "2026-11-16",
        inLanguage: "en",
        isAccessibleForFree: true,
        author: {
          "@id": personId,
          "@type": "Person",
          name: personalInfo.fullName,
          url: `${SITE_URL}/`,
        },
        publisher: {
          "@id": personId,
          "@type": "Person",
          name: personalInfo.fullName,
          url: `${SITE_URL}/`,
        },
        mainEntityOfPage: url,
        image: absoluteUrl("/project-cards/yashcodes-tools.webp"),
        about: ["Developer tools", "Next.js", "Static site", "Web performance"],
        keywords: ["YashCodes", "Developer tools", "Next.js", "Static site", "Web performance"],
      },
      buildBreadcrumbStructuredData([
        { name: "Home", path: "/" },
        { name: "Projects", path: "/#projects" },
        { name: "YashCodes", path: "/projects/yashcodes/" },
      ]),
    ],
  };
}

/** Escape `<` so a JSON-LD payload can never close its own script element. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
