# parkerknabb.com

## Editing the site

All content lives in `_data/`. You never need to touch HTML.

| File | What it controls |
|---|---|
| `_data/systems/` | One file per Systems case study (summary, figures, design notes, gear); fields in its README |
| `_data/diagrams/` | One file per signal-flow diagram |
| `_data/timeline.yml` | Story/background entries |
| `_data/credits.yml` | Short show-credits list at the end of the Story |
| `_data/sections.yml` | Section headings and intros (Systems, Story, Contact) |
| `_config.yml` | Your name, email, LinkedIn URL, headshot toggle |

The site doesn't list jobs or skills; the résumé PDF and LinkedIn cover those.

### Adding a system

Add a file to `_data/systems/` (copy `esports.yml`) and list its name under `systems.order` in `_data/sections.yml`. `_data/systems/README.md` lists the fields. To give it a diagram, add a file with an `svg` (or an image `src`) to `_data/diagrams/` and set `diagram:` to its file name. A case study awaiting approval can set `pending:` to show only its header and a short placeholder. How to draw and edit one is in [docs/diagrams.md](docs/diagrams.md). Nothing renders for a diagram until it has one.

### Adding a credit

Open `_data/credits.yml` and add a production, newest first:

```yaml
- show: Show Name
  url: https://example.com
  role: Your Role
  date: Apr 2027
  location: City, ST
```

### Adding a timeline entry

Open `_data/timeline.yml` and paste a new block in the right chronological position:

```yaml
- year: "2027"
  org: Org Name
  org_url: https://example.com
  title: Role Title
  desc: The story behind it.
```

Add `photos:` with a list of image URLs if you have a gallery. Add `docs_link:` and `docs_label:` for an external documentation link, or `system:` with a system's id to link to that case study.

Gallery photos get automatic alt text ("IBHS: Broadcast Systems Engineer, photo 2 of 4"). To describe what's actually in a photo, use the long form for that entry:

```yaml
  photos:
    - src: /images/timeline/ibhs/01.webp
      alt: Rebuilt control room rack with the new ATEM switcher
    - /images/timeline/ibhs/02.webp
```

Keep gallery images around 1200px wide or smaller; they display at 580px at most.

### Enabling the headshot

1. Drop `photo.jpg` into the `images/` folder
2. Open `_config.yml` and add `headshot: true`

---

## Local preview

```bash
bundle exec jekyll serve
```

Open `http://localhost:4000`. Jekyll rebuilds automatically on file save.

## Deploying to GitHub Pages

Push to GitHub. Pages builds Jekyll automatically — no extra config needed.

Point your domain DNS to GitHub Pages per their [custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Before going live checklist

- [ ] Drop `photo.jpg` into `images/`, set `headshot: true` in `_config.yml`
- [ ] Drop `Parker_Knabb_Resume.pdf` into the project root
- [ ] Replace Squarespace CDN URLs in `_data/timeline.yml` with local `images/` paths
- [ ] Confirm `author.email` in `_config.yml` is your real address

## Project structure

```
.
├── _config.yml          # Site config and author info
├── _data/
│   ├── systems/         # One file per case study
│   ├── diagrams/        # One file per signal-flow diagram
│   ├── credits.yml      # Show credits
│   ├── timeline.yml     # Story entries
│   └── sections.yml     # Section headings and intros
├── _includes/
│   └── diagram.html     # Signal-flow diagram figure
├── _layouts/
│   └── default.html     # Page shell (nav, head, footer, JS)
├── assets/css/
│   └── style.css        # All styles
├── images/              # Local images (photo.jpg, etc.)
├── index.html           # Page structure (loops over _data files)
└── Gemfile
```
