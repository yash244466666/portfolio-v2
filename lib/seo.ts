import type { Metadata } from "next";
import { personalInfo, siteMetadata } from "@/lib/content";
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
  "Use free browser-based developer tools from YashCodes: format JSON, convert Unix timestamps, compress images, generate meta tags, and more. The directory loads each utility on demand.";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
  imageAlt?: string;
}

/**
 * Build a complete, unique metadata block for an indexable page: absolute
 * title, description, canonical, Open Graph, and a Twitter card.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  type = "website",
  imageAlt,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const image = absoluteUrl(siteMetadata.ogImage);
  const alt = imageAlt ?? `${personalInfo.fullName} — ${siteMetadata.jobTitle}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
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
          height: 630,
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

/**
 * WebSite + ProfilePage + Person graph for the homepage. The Person @id is
 * stable so other pages and profiles can reference the same entity.
 */
export function buildHomeStructuredData() {
  const personId = `${SITE_URL}/#person`;
  const websiteId = `${SITE_URL}/#website`;
  const profileId = `${SITE_URL}/#profile`;

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
        inLanguage: "en",
      },
      {
        "@type": "Person",
        "@id": personId,
        name: personalInfo.fullName,
        alternateName: personalInfo.nameEmphasis,
        jobTitle: siteMetadata.jobTitle,
        description: personalInfo.aboutDescription,
        url: `${SITE_URL}/`,
        image: absoluteUrl(siteMetadata.ogImage),
        email: "mailto:info@yashcodes.com",
        sameAs: getPersonSameAsLinks(),
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
          "Ruby on Rails",
          "Custom AI agents",
          "AI automation",
          "Open-source intelligence",
        ],
      },
    ],
  };
}

/** Escape `<` so a JSON-LD payload can never close its own script element. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
