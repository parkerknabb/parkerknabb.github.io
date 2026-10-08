# Signal-flow diagrams: how to make and edit them

Each diagram is hand-written inline SVG stored in `_data/diagrams/<key>.yml` (one file per diagram), styled by `.sf-*` classes in `assets/css/style.css`. There is no build step and no `<style>` inside the SVG, so the diagram follows the site's light and dark themes automatically. `_includes/diagram.html` wraps it in the figure, the layer tabs and the panels.

A system in `_data/systems/<id>.yml` shows a diagram with `diagram: <key>`, where the key is the diagram's file name. Nothing renders until the entry has an `svg` or `src`.

## Files

| File | Role |
| --- | --- |
| `_data/diagrams/<key>.yml` | One file per diagram: text fields and the `svg: |` markup |
| `_data/systems/<id>.yml` | The `notes:` list, shown as numbered design notes under the diagram |
| `_includes/diagram.html` | Renders the figure, tabs and panels. Layer ids are fixed here |
| `assets/css/style.css` | The `SIGNAL-FLOW DIAGRAM` section: `.sf-*` classes and layer rules |
| `DESIGN.md` | The visual rules (colors, encoding, tab styling) |

## Fields in a diagram file

```yaml
mykey:
  alt: Required. The signal path in words, in order. Read by screen readers.
  caption: Optional line under the figure.
  layers:                      # optional. Omit for a plain, untabbed diagram
    - id: overview             # ids are fixed: overview, video, outputs, audio, control
      label: Overview
      summary: One bold sentence shown under the diagram.
      points:                  # optional bullet list
        - A fact a technical reader would want.
  svg: |
    <svg viewBox="-12 -12 840 476" ...> ... </svg>
```

Use `src` (and optional `src_dark`) pointing to an image in `images/diagrams/` instead of `svg` if you draw it elsewhere. Inline SVG is preferred because it themes itself.

Layers appear as tabs in the order you list them. The first one is selected on load, so make it `overview`.

## Drawing on the grid

- **Canvas:** draw on a 816 x 452 grid (x 0 to 816, y 0 to 452). Set `viewBox="-12 -12 840 476"`, with `xmlns` and `focusable="false"`. The extra 12px on every side keeps strokes and rounded corners on the edge from being clipped. Keep the same viewBox across diagrams so they look consistent.
- **Columns:** nodes are 150 wide (104 for small terminal nodes like "Internet"). Column x positions used so far: 0, 262, 492 and 712. Leave about 100px between columns for edge labels.
- **Node heights:** 56 to 100. Keep titles to about 18 characters and subtitles to about 22 so they fit.
- **Edges:** straight horizontal and vertical runs with `H`, `V` and `M` path commands only, no curves. Route around nodes instead of crossing them. If two paths must cross, rethink the layout.
- **Nothing is drawn automatically.** Every label background rect and text is positioned by hand.

## Building blocks

Copy these from an existing diagram and edit them.

```html
<!-- node -->
<g data-l="video audio">
  <rect class="sf-node" x="262" y="120" width="150" height="100" rx="10"/>
  <text class="sf-title" x="337" y="147" text-anchor="middle">vMix</text>
  <text class="sf-sub" x="337" y="167" text-anchor="middle">Switching, graphics</text>
</g>

<!-- key node (the one the design notes are about): add sf-node-key -->
<rect class="sf-node sf-node-key" .../>

<!-- edge: kind is video, audio, stream or ctl -->
<path class="sf-edge sf-video" data-l="video" d="M150 196 H262" marker-end="url(#KEY-arr-video)"/>

<!-- edge label: a background rect, then the text -->
<rect class="sf-label-bg" data-l="video" x="190.7" y="180" width="30.7" height="17" rx="3"/>
<text class="sf-label" data-l="video" x="206" y="192" text-anchor="middle">OMT</text>

<!-- numbered marker, matches note N in the system's file -->
<g class="sf-mark"><circle cx="398" cy="130" r="9.5"/><text x="398" y="134" text-anchor="middle">1</text></g>
```

- **Label width:** about `characters * 6.9 + 10` in the mono label font. Centre the rect on the label's x, with the rect's y 12 above the text baseline.
- **Arrowheads:** declare one `<marker>` per edge kind in `<defs>` and give the ids a unique prefix per diagram (`esp-arr-video`, `ibhs-arr-audio`). Two diagrams on one page must not share marker ids. Copy the `<defs>` block from an existing diagram and change the prefix.
- **Encoding:** video is a solid gold line, audio is dashed, the stream is heavy, control is dotted. This keeps the diagram readable without color. Do not add colors or inline styles.
- **Legend:** copy the legend lines (short sample edge plus `sf-legend` text) at the lower right.

## Layers

Every part of the drawing that should react to the tabs carries `data-l="..."`, a space-separated list of the layers it belongs to. Selecting a layer dims every `[data-l]` part that does not include it to 12% opacity.

- A node or edge used by several layers lists all of them: `data-l="video audio outputs"`.
- Parts with no `data-l` never dim (legend, markers).
- Size every `sf-label-bg` rect to its text: about `characters * 6.9 + 10` wide, centred on the label. If you reword a label, resize its rect.
- **Detail parts (`sf-x`):** everything is always drawn, so a reader scrolling past sees the full complexity. Parts that are secondary or event-specific (a special-event variant, extra outputs, the Companion node) go in a group with `class="sf-x"` and a `data-l` for the layer they belong to. On Overview they show at 50% opacity so the core path leads. On their own layer they are full strength, and on other layers they dim to 12%.
  - Put `data-l` on the group, not on its children. A child with its own `data-l` is dimmed twice and nearly vanishes.
  - Everything without `sf-x` is the core path and stays at full strength on Overview.
  - Detail parts must sit in free space. They are visible on every layer, so they must not overlap core nodes, edges or labels.
- **Control boundary:** the dashed `sf-ctrl` rect drawn behind everything marks what Companion controls. Give it `sf-x` too. It becomes solid on the Control tab.
- **Adding a new layer id** needs changes in `style.css` (the `:checked` rules for tabs, dimming and panels), so avoid it unless needed. The four existing ids cover most systems.

## Design notes and markers

Notes live in the system's file in `_data/systems/` under `notes:` and render as a numbered list. A gold marker on the drawing ties a note to the part it is about. Marker numbers must match note order. A note about the whole system needs no marker. Keep the marker off labels and edges, ideally on a node's top-right corner.

## Rules for what goes in

- **Nothing sensitive:** no IP addresses, VLAN ids, hostnames, stream keys, credentials or guest names. Segmentation is shown as a labeled boundary only.
- **Draw what exists today.** Planned changes go in the system's `next:` line, not the drawing.
- **Source each fact.** Companion exports, OBS or vMix configs and the owner's own statements are fine. Do not guess counts or routes.
- **Client permission:** a diagram of someone else's facility needs their sign-off before it is published.
- **Keep it simplified.** The detail belongs in the layer panels and notes, not as more boxes.

## Checklist before merging

1. `ruby -ryaml -e 'Dir["_data/diagrams/*.yml"].each { |f| YAML.load_file(f) }'` loads without errors. A stray `: ` in an unquoted string breaks it.
2. Run `bundle exec jekyll serve --destination /tmp/site-preview`. `_site/` is tracked in git, so a default build puts the HTML in the repo. Hard-reload (add `?v=2`) if the page looks stale.
3. Click every tab. Each layer's dimming looks right, the panel matches, and nothing is clipped.
4. Check light and dark themes.
5. Check at phone width (about 375px). The SVG keeps a 680px minimum and scrolls sideways inside its box. The page itself must not scroll sideways.
6. Tab through with the keyboard. Arrow keys move between layers, and focus rings show.
7. Labels do not touch node edges, and text fits inside its box.
8. The marker numbers match the notes.
9. The `alt` text still describes the drawing.
