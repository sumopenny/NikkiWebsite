# NikkiWebsite

The independent website for Infinity Nikki Album Manager. It is built with Vue 3, TypeScript, and Vite and can be developed, built, and deployed to Cloudflare Pages separately. It does not connect to the album app API or its D1 database.

## Local preview

Requirements: Windows and Node.js LTS. Double-click `Start-Website.bat` in the project root. On first run it installs dependencies and opens the local site, using `http://localhost:5180` by default or an available port from 5181 to 5190 when needed. You can also run:

```powershell
npm install
npm run dev
```

Build and preview the production output with:

```powershell
npm run build
npm run preview
```

## Cloudflare Pages

Create a separate Cloudflare Pages project connected to this website repository and use:

- Framework preset: Vue
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`
- Environment: Node.js 20 or newer LTS

The included `wrangler.toml` declares the Pages output directory. This is a static single-page site and does not need D1, secrets, or an API proxy. Bind a domain in the Cloudflare Pages project after deployment.

## Assets

- All site imagery is served as `.webp` from `public/images/` — hero and gallery photos at the root, app screenshots under `screenshots/`. To retarget the format, change the single `IMAGE_EXT` constant at the top of `src/App.vue`.
- The original JPEG/JPEG files are archived in `public/images/originals/` (same subfolder layout). They ship inside `dist/` but are never requested by the page, so they do not affect runtime performance. Regenerate the WebP set with `scripts/convert_webp.py`.
- The outfit code parser, photo parameter parser, and lucky pull times previews are screenshot slots; replace them with real app screenshots when available. A 16:10 source ratio is recommended.
- Areas labeled `ASSET SLOT` are placeholders. No game artwork is included. Confirm that supplied artwork can be displayed publicly before adding it.
- Suggested original image ratios: hero artwork 16:9 and five gallery images 16:10. Keep the matching container ratio and add descriptive alternative text when replacing a placeholder.

## Page content

The site covers the photo timeline, search and favorites, batch import and export, Recently Deleted and restore, outfit plans and codes, camera parameter parsing, Special Cleanup, lucky pull times, help, and issue feedback. It also explains folder access, local processing, and permanent deletion boundaries. Read the full [Chinese README](https://github.com/sumopenny/Infinity-Nikki-Album-Manager/blob/main/README.md) or [English README](https://github.com/sumopenny/Infinity-Nikki-Album-Manager/blob/main/README_EN.md) for detailed instructions.

## Motion and accessibility

- motion-v drives scroll reveals, the staggered hero, screenshot parallax and subtle tilt, and the gallery stack. Navigation, buttons, and screenshot crossfades use CSS.
- The gallery can be controlled manually or paused. Autoplay pauses on pointer hover, keyboard focus, hidden pages, and the system reduced-motion preference. Reduced motion also disables parallax and pointer tilt.
- Motion references include [Motion for Vue](https://motion.dev/docs/vue), [Vue Bits](https://vue-bits.dev/), and [AutoAnimate's Vue usage](https://auto-animate.formkit.com/). The site depends only on motion-v; it does not copy Vue Bits source or add a second animation library.
- The page includes a skip link, visible keyboard focus, screenshot-preview focus return, and support for prefers-reduced-motion.

## Links

- App: [Cloudflare Pages](https://infinity-nikki-album-manager.pages.dev/), [alternate site](https://infinity-nikki-album-manager.vercel.app/)
- Source and releases: [GitHub](https://github.com/sumopenny/Infinity-Nikki-Album-Manager), [Gitee](https://gitee.com/sumopenny/Infinity-Nikki-Album-Manager)

This is an independent community tool. It is not affiliated with, authorized, or endorsed by the Infinity Nikki team or publisher.
