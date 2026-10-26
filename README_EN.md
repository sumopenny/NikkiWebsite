# NikkiWebsite

The independent website for the NikkiCube (Nikki³) Infinity Nikki toolkit. It is built with Vue 3, TypeScript, and Vite and can be developed, built, and deployed to Cloudflare Pages separately. It does not connect to the album app API or its D1 database.

## Local preview

Requirements: Windows and Node.js 20.9 or a newer LTS release. Double-click `Start-Website.bat` in the project root. On first run it installs dependencies and opens the local site, using `http://localhost:5180` by default or an available port from 5181 to 5190 when needed. You can also run:

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
- Environment: Node.js 20.9 or newer LTS

The included `wrangler.toml` declares the Pages output directory. This is a static single-page site and does not need D1, secrets, or an API proxy. Bind a domain in the Cloudflare Pages project after deployment.

## Search indexing

The canonical website is `https://nikki3.pages.dev/`; the online toolkit remains at `https://infinity-nikki-album-manager.pages.dev/`. The title and copy use the brand 暖立方 (Nikki³) and the actual Infinity Nikki album management and resonance record features.

After type checking and client bundling, `npm run build` prerenders the Chinese homepage from the same Vue components. Deploy `dist` as before; no server or new dependency is required. The initial HTML includes the introduction, default feature preview, usage guide and FAQ. Hydration preserves language, theme, category selection and screenshot previews. Text is visible initially: entrance movement remains, but text no longer starts fully transparent. Carousels and other interactive animations remain. Saved language preferences are restored after hydration. Prerender failures stop the build; temporary modules stay in the ignored `.verify/prerender/` directory and are not deployed.

The homepage has a self-referencing canonical; `public/robots.txt` references `public/sitemap.xml`, which lists only the homepage. Update `index.html` and both files when changing the website domain. Crawling is allowed without manual submission, but indexing and rankings are not guaranteed; public links to the website help discovery. After deployment, check that page source contains the introduction, `/robots.txt` and `/sitemap.xml` serve the correct content, and the site is accessible in mainland China. This project does not change the toolkit's canonical.

## Assets

- Keep source WebP files in the project-root `images/` directory, outside the public deployment tree. Light hero photos use `1.webp`–`10.webp`, dark photos use `11.webp`–`20.webp`, and gallery photos use `gallery-1.webp`–`gallery-10.webp`.
- Feature previews cover Album, Outfit codes, Home schemes, Nikki Archive, and Parsers and tools. Their content and image paths are in `src/data/showcase.ts`; screenshots belong in `images/screenshots/`. Missing or failed screenshots fall back to feature illustrations.
- The tutorial source is `images/auto-update-outfit-code.webp`, displayed at its original portrait ratio with a link to the complete image.
- The brand image is `public/images/brand-mark.png`; browser icons are `public/favicon.ico` and `public/favicon.svg`.
- Optionally archive JPEG/JPG originals under `images/originals/`. With Python and Pillow installed, run `python scripts/convert_webp.py` to regenerate source WebP files. Archives are not published.
- See [image asset instructions](images/README.md) for filenames and replacement steps. Changing formats requires coordinated updates to paths, generation and preloading; changing `IMAGE_EXT` alone is insufficient.

## Page content

The website covers album management, outfit codes, home schemes, camera favorites, resonance records and wardrobe collections, with an automatic outfit-code walkthrough, backup and migration guidance, and FAQ. For detailed instructions, read the toolkit [Chinese README](https://github.com/sumopenny/Infinity-Nikki-Album-Manager/blob/main/README.md) or [English README](https://github.com/sumopenny/Infinity-Nikki-Album-Manager/blob/main/README_EN.md).

## Motion and accessibility

- motion-v drives text entrances, scroll reveals, screenshot tilt and gallery stacking. Hero photos use Vue Transition and CSS: the outgoing photo remains opaque underneath until the incoming photo finishes fading in. Only the current photo remains afterward.
- The hero starts its 2.6-second timer (`HERO_SLIDE_INTERVAL = 2600`) when the current photo has loaded for display. If the next photo is not ready at the deadline, the current photo remains until another is ready, then switches immediately without an additional interval. A single hero photo remains static. The gallery interval is 2 seconds (`GALLERY_SLIDE_INTERVAL = 2000`).
- Hero autoplay pauses outside the viewport, on hidden pages, or with reduced motion. Gallery autoplay pauses on hidden pages, with reduced motion, or through its pause button. Hover, keyboard focus and manual navigation do not pause autoplay.
- The page provides a skip link, visible focus and focus return after closing screenshot previews. Reduced motion disables parallax and pointer tilt.
- Motion references include [Motion for Vue](https://motion.dev/docs/vue), [Vue Bits](https://vue-bits.dev/) and [AutoAnimate](https://auto-animate.formkit.com/). The runtime uses motion-v only.

## Links

- App: [Cloudflare Pages](https://infinity-nikki-album-manager.pages.dev/), [alternate site](https://infinity-nikki-album-manager.vercel.app/)
- Source and releases: [GitHub](https://github.com/sumopenny/Infinity-Nikki-Album-Manager), [Gitee](https://gitee.com/sumopenny/Infinity-Nikki-Album-Manager)

This is an independent community tool. It is not affiliated with, authorized, or endorsed by the Infinity Nikki team or publisher.

## Image loading and updates

1. Replace source WebP files under `images/`, then run `npm run dev` or `npm run build`. Restart the dev server after replacing files to regenerate its manifest.
2. `scripts/prepare-images.mjs` writes full-size and up-to-960px variants to `public/images/optimized/`. Filenames hash the actual output bytes, so changes to images, compression or encoding produce new URLs. Images no wider than 960px reuse the full-size file.
3. Do not edit the generated `src/data/imageManifest.json` or `optimized/` directory manually; both are ignored by Git.
4. Hero probing uses two concurrent requests, prioritizing the first two photos. Screenshots preload with up to five concurrent requests after the hero is ready to display. Gallery loading starts within 600px of the viewport for the current and following four slots. The tutorial is lazy-loaded. Responsive images account for display width and pixel density; enlarged screenshots use the full-size variant.
5. `dist` contains generated images and public assets, excluding the `images/` source tree. All `/images/*` responses, including optimized variants, use a seven-day cache; hashed JS/CSS bundles retain long-term caching.
6. After building, run `node scripts/verify-image-loading.mjs` to check loading queues, output hashes, dimensions, deployment references, source exclusion and image cache rules.

Run `node scripts/verify-hero-timing.mjs` to check hero deadlines, early or late image readiness, single-photo waiting, pause/resume and stale image load events.
