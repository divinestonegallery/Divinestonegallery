# Divine Stone Gallery Design System

## Brand character

Divine Stone Gallery should feel sacred, refined, handcrafted, trustworthy, and calm. The interface must use generous whitespace and restrained ornamentation. Product photography remains the visual focus.

## Colour palette

| Token | Hex | Use |
| --- | --- | --- |
| Ivory | `#F4F0E8` | Main page background |
| Porcelain | `#FFFDF9` | Cards, forms, and elevated surfaces |
| Charcoal | `#211F1B` | Primary text and dark sections |
| Muted ink | `#6E665B` | Supporting text |
| Antique gold | `#A17633` | Primary actions and selected states |
| Deep gold | `#78521F` | Hover states and high-contrast accents |
| Soft gold | `#D8BD8A` | Decorative rules and selections |
| Temple brown | `#6A4A32` | Heritage accents |
| Sand border | `#D9CDBD` | Borders and separators |

Gold is an accent, not a background for large areas. Avoid bright yellow-gold gradients.

## Typography

- Display headings: Iowan Old Style, Baskerville, or Times New Roman fallback.
- Body and interface: Geist Sans.
- Product codes and technical measurements: Geist Mono when useful.
- Headings use comfortable line height and restrained letter spacing.
- Body copy should remain at least 16px on customer-facing pages.

## Logo system

- `logo-horizontal.jpg`: website header, footer, documents, and email.
- `logo-square.jpg`: social profiles and square brand placements.
- `lotus-mark.jpg`: favicon, compact mobile identity, and loading states.
- `logo-animation-horizontal-web.m4v`: optional desktop brand reveal.
- `logo-animation-vertical-web.m4v`: optional mobile brand reveal.
- Do not stretch, recolour, rotate, outline, or place the logo over busy imagery.
- Preserve clear space around the mark equal to at least half the lotus height.
- Never force visitors to watch the logo animation before shopping.

## Shape and depth

- Small controls: 6px radius.
- Cards and inputs: 12px radius.
- Editorial image frames and feature panels: 20px radius.
- Pill shapes are reserved for filters, badges, and compact actions.
- Shadows remain warm and subtle; borders provide most separation.

## Layout

- Maximum content width: 1280px.
- Responsive page gutter: 16px to 40px.
- Use an 8px spacing rhythm wherever practical.
- Product grids: two columns on small mobile, three on tablet, and four on desktop.
- Long-form heritage content should use narrower readable columns.

## Motion

- Standard UI transitions: 160–240ms.
- Prefer opacity and small vertical movement.
- Respect `prefers-reduced-motion`.
- The logo animation may play once per session and must be skippable.

## Accessibility

- Maintain WCAG AA text contrast.
- Never communicate status through colour alone.
- All interactive elements require visible keyboard focus.
- Product images require meaningful alt text.
- Touch targets should be at least 44px square.
