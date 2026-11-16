# YashCodes production audit — 16 November 2026

Audited the live production site, beta indexing behavior, and GitHub main at e232077. Used direct HTTP requests and Chrome at desktop and mobile widths, including reduced-motion and JavaScript-disabled checks. Automated accessibility checks used axe WCAG 2 A, AA and 2.1 AA rules.

## Confirmed findings

| Priority | Finding | Evidence and next change |
| --- | --- | --- |
| High | Tool surface contrast | All four standalone tools have failures. Meta Tag Generator labels measured 2.85:1 and Reset/Capture 3.01:1. JSON Editor had text as low as 2.44:1. The shared tool wrapper combines light tokens with a 35%-opaque fill over the dark site. Adjust the composite surface or token pairing and retest both layouts. |
| High | Meta Tag Generator field names | 14 controls lack associated labels, including Title, Description, Robots, Canonical URL, and the Open Graph and Twitter fields. Give controls stable IDs and associate their visible labels. |
| High | JSON Editor button names | axe found three unnamed buttons on desktop and six on mobile, including tree toggles and compact toolbar controls. Add accessible names and expose expanded state on tree buttons. |
| Medium | Directory search blocks category navigation | Open Search, enter Base64 and press Enter. The directory shows one match and disables five of six categories. Keep category buttons active, then clear search and jump to the chosen category as specified in the handoff. |
| Medium | Mobile homepage contrast | Small Cloudflare-related link text measured 4.11:1 against its panel. Increase to 4.5:1. The same issue reproduced on desktop with reduced motion. |
| Medium | Homepage still places work below the fold | In a 1440 × 900 desktop test, About preceded Featured Projects and the Featured Projects heading began around y=2312. The prior combined layout called for bringing work into the first screen. This is a portfolio usability and handoff gap. |
| Medium | Most tools have no dedicated search landing page | The directory exposes 84 fragment links and four standalone routes. Publish additional standalone pages where the tool warrants useful examples and unique copy. Base64 is a practical candidate because it currently has only a hash route. |
| Medium | Project details have limited standalone discovery | The YashCodes case study is the only standalone project route in the sitemap. Several marked-up projects share the generic homepage projects anchor. Publish a case study or stable project-specific destination for the strongest work, especially Vision Desktop Agent and Marketplace if the latter is cleared for publication. Include contribution, methods, and public evidence. |
| Medium | Homepage FAQ markup exceeds the visible presentation | The graph contains five FAQ questions and answers, but the homepage has no visitor-facing FAQ section. Render the matching content visibly or remove that FAQ node. Existing visible About, project and contact content can carry the facts. |
| Low | Shared social preview | All seven pages use the same Open Graph image. Supply route-specific images where shared links would benefit, starting with the case study and promoted tools. |
| Low | www hostname does not resolve | DNS returned ENOTFOUND for www.yashcodes.com. If the hostname appears in backlinks or shared material, point it to the site and redirect it permanently to the apex. |
| Low | Release-wide sitemap dates | All seven URLs use the same hard-coded date in app/sitemap.ts. Track meaningful updates per page as the site evolves. |

## Verified improvements

- The initial homepage HTML contains the full-name H1, portfolio body, links, canonical and structured data. Core content remains readable in Chrome with JavaScript disabled.
- All seven sitemap URLs returned HTTP 200 and had self-canonicals and distinct titles. The four dedicated tools and the case study are live. An unknown tool route returned 404.
- Duplicate index.html and slashless tool URLs tested resolve to their preferred paths. The JSON Editor aliases specifically returned single-hop 301s.
- Production robots.txt and sitemap.xml return HTTP 200. Production robots.txt allows OAI-SearchBot and GPTBot. Search inclusion and training preferences are independent.
- Beta homepage and directory both returned X-Robots-Tag noindex while production did not.
- The Tools skip-anchor no longer triggers Tool Not Found. All 84 catalog hash links opened a tool shell in a Chrome smoke pass. This verifies opening behavior, with calculation correctness outside that pass.
- The live resume endpoint served an application/pdf response. The checked-in resume is a two-page PDF with extractable résumé content and no placeholder marker.
- The site carries validly parsed JSON-LD on the seven routes, and the directory catalog and page explanations are present in static HTML.

## Verification limits

Search Console indexing and selected canonicals, Bing indexing, answer-engine citations, real-user Core Web Vitals, live contact delivery, full keyboard coverage, and exhaustive per-tool correctness require separate verification. Desktop and mobile runs used Chrome viewport emulation. Automated accessibility results cover the page states exercised.

## References

- [Production sitemap](https://yashcodes.com/sitemap.xml)
- [Production crawler policy](https://yashcodes.com/robots.txt)
- [Meta Tag Generator](https://yashcodes.com/tools/meta-tag-generator/)
- [GitHub main snapshot](https://github.com/yash244466666/portfolio-v2/tree/e2320772c51e7235c2e4113044212488d1d36a83)
- [Google AI search guidance](https://developers.google.com/search/docs/appearance/ai-features)
- [Google structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [OpenAI crawler roles](https://developers.openai.com/api/docs/bots)

## Changes in this release

- Reviewed the standalone and directory tool renderers separately. Both applied light foreground colors over a 35%-opaque backdrop. The release uses a solid light tool surface and matching header controls.
- Restored category jumps from active searches, linked all 14 meta inputs to labels, and added names and expanded state to JSON Editor controls.
- Reviewed the Base64 widget before publishing it. File mode encodes files, while text mode handles encoding and decoding. The new landing page documents those limits. The file picker is keyboard accessible.
- Moved Featured Projects before About and shortened the introduction. Added stable case-study routes for the Marketplace and Vision projects using already public project descriptions and artwork. The Vision page links to the public prototype and records its limitations.
- Removed the homepage FAQ graph, updated case-study previews, and removed global sitemap modification dates.
- The apex remains the canonical hostname. A www redirect requires DNS and hosting configuration outside the static export.

## Staging follow-up

The first staging pass exposed two release gaps. Both case-study pages returned HTTP 200 but were absent from the sitemap, and the Meta Tag Generator labels had no matching input IDs. The follow-up generates sitemap entries from the published case-study inventory and assigns matching IDs to the 14 inputs. The same pass found no contrast or unnamed-button failures in the tested homepage and standalone tool states at desktop and mobile widths.
