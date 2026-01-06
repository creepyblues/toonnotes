---
name: marketing-assets
description: Generates marketing assets (OG images, social graphics, app screenshots) for ToonNotes campaigns. This skill should be used when creating campaign visuals, updating app store screenshots, or generating social content graphics.
---

# Marketing Assets Generator

This skill generates marketing visual assets for ToonNotes using **Strategy v2: AI Organization + AI Design** positioning. All assets target the "Prolific Procrastinator" ICP with visual demonstrations of the dual-pillar value prop.

## Strategy v2 Core Positioning

**One-liner:** "Capture everything. Organize nothing. See it beautifully."

**Visual Focus (v2):**
- Before/after transformations (chaos → organized board)
- Dual-pillar demonstrations (AI Organization + AI Design)
- Use case visuals (Knowledge Maps, Trip Planners, Idea Constellations)

## When to Use This Skill

- Creating OG images for shared notes or pages
- Generating social media graphics
- Creating app store screenshots
- Designing campaign visuals
- Auditing missing assets
- Documenting asset requirements

## Commands

```
/marketing-assets og --note-id=abc123              # OG image for shared note
/marketing-assets og --page=pro                    # OG image for landing page
/marketing-assets social --platform=instagram --template=feature
/marketing-assets social --platform=twitter --template=announcement
/marketing-assets screenshot --platform=ios --feature=pro
/marketing-assets screenshot --platform=android --feature=design
/marketing-assets banner --campaign=pro-launch     # Campaign banner
/marketing-assets audit                            # List missing assets
/marketing-assets audit --campaign=pro-launch      # Audit specific campaign
/marketing-assets specs --campaign=pro-launch      # Document asset specs
```

## Output Locations

| Type | Output Path |
|------|-------------|
| OG Images | `marketing/assets/og-images/` |
| Social Graphics | `marketing/assets/social/{platform}/` |
| Screenshots | `marketing/assets/screenshots/{platform}/` |
| Campaign Assets | `marketing/campaigns/active/{slug}/assets/` |
| Brand Assets | `marketing/assets/brand/` |

## Asset Dimensions

### OG Images

| Type | Dimensions | Format |
|------|------------|--------|
| General | 1200 × 630 | PNG |
| Twitter | 1200 × 628 | PNG |
| LinkedIn | 1200 × 627 | PNG |

### Social Media

| Platform | Format | Dimensions |
|----------|--------|------------|
| Instagram Post | Square | 1080 × 1080 |
| Instagram Portrait | 4:5 | 1080 × 1350 |
| Instagram Story | 9:16 | 1080 × 1920 |
| Instagram Reel Cover | 9:16 | 1080 × 1920 |
| TikTok | 9:16 | 1080 × 1920 |
| Twitter Post | 16:9 | 1200 × 675 |
| Twitter Header | 3:1 | 1500 × 500 |
| Reddit | Varies | 1200 × 628 (default) |

### App Store Screenshots

| Platform | Device | Dimensions |
|----------|--------|------------|
| iOS 6.7" | iPhone 15 Pro Max | 1320 × 2868 |
| iOS 6.5" | iPhone 14 Plus | 1284 × 2778 |
| iOS 5.5" | iPhone 8 Plus | 1242 × 2208 |
| iOS 12.9" | iPad Pro | 2048 × 2732 |
| Android | Phone | 1080 × 1920 (min) |
| Android | Tablet | 1920 × 1200 (min) |

## Brand Guidelines

### Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Teal (Primary) | #4C9C9B | Brand color, buttons, accents |
| Coral (Highlight) | #FF6B6B | CTAs, highlights |
| Warm Gray | #78716C | Text, backgrounds |
| White | #FFFFFF | Backgrounds, text on dark |

### Typography

| Style | Font | Usage |
|-------|------|-------|
| Display | Outfit | Headlines, titles |
| Body | Inter | Body text, descriptions |
| Hand | Caveat | Decorative, playful |
| Serif | Playfair Display | Elegant accents |

### Logo Usage

- Minimum clear space: Height of "T" on all sides
- Minimum size: 24px height
- Dark backgrounds: White logo
- Light backgrounds: Teal logo

## OG Image Generation

### For Shared Notes

The existing OG generation at `ToonNotes_Web/app/api/og/route.tsx` handles shared note OG images:

```
URL: /api/og?token={shareToken}
Output: Dynamic 1200×630 image with note preview
```

### For Landing Pages (v2)

Create OG images for static pages:

| Page | Content |
|------|---------|
| Homepage | "Capture everything. Organize nothing. See it beautifully." |
| Pro | "ToonNotes Pro - AI Organization + AI Design, unlimited" |
| Features | Dual-pillar feature imagery |
| Use Cases | Use case-specific boards (Knowledge Map, Trip Planner) |

### OG Template Structure

```
┌─────────────────────────────────────────────────────────┐
│  [Background gradient or image]                         │
│                                                         │
│     ┌─────────────────────────────────────────────┐    │
│     │                                             │    │
│     │  [Headline - 2-3 lines max]                 │    │
│     │                                             │    │
│     │  [Subheadline or description]               │    │
│     │                                             │    │
│     └─────────────────────────────────────────────┘    │
│                                                         │
│     [ToonNotes logo - bottom left]                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Social Graphics Templates

### Feature Announcement

```
┌─────────────────────────────────────────────────────────┐
│  [Teal gradient background]                             │
│                                                         │
│     ✨ NEW                                              │
│                                                         │
│     [Feature Name]                                      │
│     is here!                                            │
│                                                         │
│     [App screenshot or mockup]                          │
│                                                         │
│     [ToonNotes logo]                                    │
└─────────────────────────────────────────────────────────┘
```

### Tip/Tutorial

```
┌─────────────────────────────────────────────────────────┐
│  [Soft pastel background]                               │
│                                                         │
│     💡 TIP                                              │
│                                                         │
│     [Tip headline]                                      │
│                                                         │
│     [Visual demonstration]                              │
│                                                         │
│     @toonnotes                                          │
└─────────────────────────────────────────────────────────┘
```

### User Showcase

```
┌─────────────────────────────────────────────────────────┐
│  [User's design as background]                          │
│                                                         │
│     Created with ToonNotes                              │
│                                                         │
│     [Credit: @username]                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## App Store Screenshots

### Screenshot Sequence (v2)

| Position | Content | Text Overlay |
|----------|---------|--------------|
| 1 | Hero - Dual pillar overview | "Capture everything. Organize nothing. See it beautifully." |
| 2 | AI Organization in action | "AI auto-labels and groups your notes" |
| 3 | AI Design - Visual layouts | "Beautiful boards: Knowledge Maps, Trip Planners" |
| 4 | Use Case transformation | "100 scattered notes → 1 organized board" |
| 5 | Sharing feature | "Share-ready outputs without cleanup" |

### Screenshot Template

```
┌─────────────────────────┐
│                         │
│  [Text headline]        │
│                         │
│  ┌─────────────────┐   │
│  │                 │   │
│  │  [App screen]   │   │
│  │                 │   │
│  │                 │   │
│  └─────────────────┘   │
│                         │
└─────────────────────────┘
```

## Campaign Asset Specs

When `/marketing-assets specs --campaign={name}` is run:

### Output Format

```markdown
# Asset Specifications: {Campaign Name}

## Required Assets

### Hero Image
- **Dimensions:** 1200 × 630
- **Format:** PNG
- **Content:** [Description]
- **Text:** [Headline text]
- **Status:** ⬜ Not started

### Instagram Carousel
- **Slides:** 5
- **Dimensions:** 1080 × 1350
- **Format:** PNG
- **Content per slide:**
  1. [Description]
  2. [Description]
  ...
- **Status:** ⬜ Not started

[Continue for all required assets...]

## Asset Checklist

- [ ] Hero image
- [ ] Instagram carousel (5 slides)
- [ ] Twitter announcement graphic
- [ ] Story template
- [ ] App Store screenshots (if needed)
```

## Asset Audit

When `/marketing-assets audit` is run:

### Check for Missing Assets

| Asset Type | Required | Existing | Missing |
|------------|----------|----------|---------|
| Brand logo (light) | ✓ | ✓ | - |
| Brand logo (dark) | ✓ | ✓ | - |
| OG default | ✓ | ⬜ | ✓ |
| iOS screenshots | ✓ | ⬜ | ✓ |
| Android screenshots | ✓ | ⬜ | ✓ |

## Integration with frontend-design Skill

For landing page components, delegate to the `frontend-design` skill:

```
/frontend-design --type=landing-section --section=hero
/frontend-design --type=landing-section --section=features
```

The frontend-design skill handles HTML/React component generation while this skill handles image assets.

## Asset Storage Guidelines

### File Naming

```
{type}-{description}-{dimensions}.{format}

Examples:
og-homepage-1200x630.png
ig-feature-launch-1080x1350.png
screenshot-ios-design-1284x2778.png
```

### Directory Structure

```
marketing/assets/
├── brand/
│   ├── logo-light.svg
│   ├── logo-dark.svg
│   ├── colors.json
│   └── fonts/
├── og-images/
│   ├── default.png
│   └── pages/
├── social/
│   ├── instagram/
│   ├── twitter/
│   └── tiktok/
└── screenshots/
    ├── ios/
    └── android/
```

## Related Skills

- `/marketing-copy` - Generate text for assets
- `/marketing-campaign` - Campaign asset coordination
- `/social-scheduler` - Content requiring assets
- `/frontend-design` - Landing page components
