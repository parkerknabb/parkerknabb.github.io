# parkerknabb.com

## Editing the site

All content lives in `_data/`. You never need to touch HTML.

| File | What it controls |
|---|---|
| `_data/work.yml` | Experience cards |
| `_data/credits.yml` | Productions list |
| `_data/skills.yml` | Skills grid |
| `_data/timeline.yml` | Story/background entries |
| `_data/stats.yml` | The four stat cards in About |
| `_config.yml` | Your name, email, LinkedIn URL, headshot toggle |

### Adding a new job

Open `_data/work.yml` and paste a new block at the top (or wherever in the order you want it):

```yaml
- icon: 🎬
  org: Company Name
  org_url: https://example.com
  dates: Summer 2027
  title: Your Job Title
  desc: What you did there.
  tags: [Tag One, Tag Two]
```

`link`, `link_label`, and `upcoming`/`upcoming_label` are optional — only include them if needed.

### Adding a credit

Open `_data/credits.yml` and add a production under the right group:

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

Add `photos:` with a list of image URLs if you have a gallery. Add `docs_link:` and `docs_label:` for an external documentation link.

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
│   ├── work.yml         # Experience cards
│   ├── credits.yml      # Productions list
│   ├── skills.yml       # Skills grid
│   ├── timeline.yml     # Story entries
│   └── stats.yml        # About stat cards
├── _layouts/
│   └── default.html     # Page shell (nav, head, footer, JS)
├── assets/css/
│   └── style.css        # All styles
├── images/              # Local images (photo.jpg, etc.)
├── index.html           # Page structure (loops over _data files)
└── Gemfile
```
