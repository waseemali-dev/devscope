# DevScope — Final Dark Build

A dark-only, mobile-first GitHub Profile Viewer built with HTML, CSS, and vanilla JavaScript.

## Included
- Refined dark hero section with responsive decorative artwork
- GitHub public profile and latest repositories
- Loading, empty, not-found, rate-limit, timeout, and network-error states
- AbortController timeout so loading cannot remain stuck
- Clear input, example search, retry, Enter-key search
- Safe DOM rendering for repository data
- Accessibility labels, alt text, focus states, and reduced-motion support
- Feature cards in one row on screens 700px and wider

## Run
Open `index.html` directly or use any static server. No build step or API key is required.

## Deployment note
This is ready for a small static deployment. For high traffic, use a server-side proxy and caching layer for GitHub API requests.
