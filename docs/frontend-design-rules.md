# Frontend Design Rules

This app must look like a serious, premium, black-and-white internal sales cockpit.

## Visual direction

- Monochrome dark mode only.
- Primary background: near-black.
- Surfaces: neutral/zinc dark grays.
- Borders: subtle one-pixel hairlines.
- Typography: clean sans, tight hierarchy, no decorative font.
- Design inspiration: Linear, Notion, Vercel dashboard, modern CRM tools.
- Avoid generic AI SaaS visuals.

## Layout

- Use a persistent left sidebar on desktop.
- Use a compact top bar for page title/search/status.
- Use cards only when they organize information clearly.
- Do not create huge empty hero sections.
- This is not a marketing site.
- This is a fast operational cockpit.

## Call cockpit

The `/call` screen is the most important screen.

- email search at the top
- contact/company context immediately visible
- signal cards compact and scannable
- call script section large enough to read during a call
- notes and outcome form always easy to access
- follow-up email generation one click away

## Tables

- sticky header if easy
- compact rows
- strong filtering
- clear badges
- pagination
- search
- no oversized row padding
- no cartoon styling

## Components

Prefer Button, Card, Badge, Input, Textarea, Select, Table, Separator, and toast patterns.

## Motion

- hover transitions
- loading skeletons
- subtle fade/slide
- no dramatic animation

## Copy style

Use crisp labels such as "Say this first", "Why this company", "Best gnani angle", "Ask this", "If they push back", "Send email line", "Save call notes", and "Generate follow-up".

Avoid vague AI copy.
