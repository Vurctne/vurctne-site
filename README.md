# vurctne-site

Marketing site for [Vurctne Games](https://vurctne.com) — a Melbourne, Australia mini-game studio building arcade titles for the WeChat, Douyin, and TikTok mini-game platforms.

**Live:** https://vurctne.com

## Stack

- Static HTML + CSS, no build step
- Custom hand-coded design system (Sora display, Inter body, instrument-serif headlines)
- Single inline-SVG brand mark (the "corona" — sun-disc-with-rings)
- Hosted on **Cloudflare Pages** (config in `wrangler.jsonc`)
- Custom domain via Cloudflare DNS

## Repo layout

```
vurctne-site/
├── public/                  ← what Cloudflare Pages serves
│   ├── index.html           ← studio home (hero, games, studio, contact)
│   ├── styles.css           ← design system + page-level CSS
│   ├── privacy.html
│   ├── terms.html
│   ├── 404.html
│   └── hexfall/             ← Hexfall game (single HTML, deployed under /hexfall/)
├── wrangler.jsonc           ← Cloudflare Pages config
├── README.md
├── LICENSE
└── .gitignore
```

## Deploy

```
# Cloudflare Pages auto-deploys on push to main.
git push origin main
```

If deploying manually:

```
npx wrangler pages deploy public --project-name=vurctne-site
```

## License

See [LICENSE](LICENSE). Source published for transparency; site copy and brand assets are not for re-use.

## Contact

contact@vurctne.com
