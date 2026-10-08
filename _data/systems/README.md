# Systems data

One file per case study. The Systems section shows them in the order listed in
`_data/sections.yml` under `systems.order`; a file that isn't listed doesn't render.
Jekyll ignores this README (only .yml/.json/.csv files are data).

Fields:

```
id:       anchor for the system (#ibhs); Story entries link here with `system: <id>`.
label:    the system's role in the pair (Blank slate), shown at the top of the
          left column beside the title.
facts:    optional figures shown under the dates: num + label.
diagram:  optional key: the name of a file in _data/diagrams/ (esports → esports.yml). Renders only once it has an svg/src.
summary:  one or two sentences on what the system is.
notes:    design decisions, each a short title and the reasoning.
gear:     what's in the chain, as a plain list.
next:     optional line on work in progress.
link/link_label: optional.
pending:  optional. Shows the header only, with this text in place of the
          diagram and design notes. For a case study still awaiting approval.
```
