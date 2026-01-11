#!/usr/bin/env python3
"""
Generate marketing-ready feature brief from analysis output.

Creates structured feature briefs with Strategy v2 messaging hooks,
ICP pain points, and platform-specific social content suggestions.

Usage:
    python3 generate_brief.py --analysis=analysis.json --feature-id=feat-001
    python3 generate_brief.py --analysis=analysis.json  # All high-potential features
"""

import argparse
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Optional


# Pain points from Strategy v2 (messaging.md)
ICP_PAIN_POINTS = {
    "retrieval": {
        "pain": "I know I saved it but can't find it",
        "solution": "AI auto-labeling + smart search",
        "pillar": "ai-organization",
    },
    "organization": {
        "pain": "I should organize but never do",
        "solution": "AI does it automatically",
        "pillar": "ai-organization",
    },
    "visual": {
        "pain": "My notes are an ugly mess—I don't want to look",
        "solution": "AI creates beautiful layouts",
        "pillar": "ai-design",
    },
    "fatigue": {
        "pain": "I've tried everything, nothing sticks",
        "solution": "Zero setup, zero maintenance",
        "pillar": "ai-organization",
    },
    "sharing": {
        "pain": "My notes are too messy and ugly to share",
        "solution": "Shareable-ready outputs",
        "pillar": "ai-design",
    },
}

# Pillar-to-benefit mappings
PILLAR_BENEFITS = {
    "ai-organization": [
        "Never lose a note again",
        "AI organizes so you don't have to",
        "Find anything instantly",
        "Structure without effort",
    ],
    "ai-design": [
        "Notes you're proud to share",
        "Beautiful without the work",
        "Visual organization that makes sense",
        "Aesthetics that match your style",
    ],
    "both": [
        "Organized AND beautiful—automatically",
        "AI handles structure and style",
        "The complete note-taking solution",
    ],
    "general": [
        "A better note-taking experience",
        "Built for how you actually work",
    ],
}

# Platform-specific hook templates
PLATFORM_HOOKS = {
    "instagram": {
        "template": "{benefit} {emoji}\n\n{detail}\n\nTry it: link in bio",
        "emojis": ["✨", "📚", "🎨", "⭐", "🔥"],
        "max_chars": 2200,
    },
    "twitter": {
        "template": "{hook}\n\n{detail}\n\n{cta}",
        "emojis": ["🚀", "💡", "✅"],
        "max_chars": 280,
    },
    "tiktok": {
        "template": "{hook} #ToonNotes",
        "emojis": ["😍", "🤯", "✨"],
        "max_chars": 2200,
    },
    "reddit": {
        "template": "{authentic_intro}\n\n{feature_description}\n\n{cta}",
        "emojis": [],
        "max_chars": 40000,
    },
    "linkedin": {
        "template": "{professional_hook}\n\n{value_description}\n\n{cta}",
        "emojis": [],
        "max_chars": 3000,
    },
    "producthunt": {
        "template": "{tagline}",
        "emojis": ["🎨", "📝", "✨"],
        "max_chars": 260,
    },
}


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def detect_pain_point(feature: dict) -> dict:
    """Detect which ICP pain point this feature addresses."""
    pillar = feature.get("suggested_pillar", "general")
    description = feature.get("description", "").lower()
    name = feature.get("name", "").lower()
    text = f"{name} {description}"

    # Check for keyword matches
    if any(kw in text for kw in ["sync", "find", "search", "retrieve", "organize", "label"]):
        return ICP_PAIN_POINTS["retrieval"]
    elif any(kw in text for kw in ["auto", "automatic", "smart", "ai"]):
        return ICP_PAIN_POINTS["organization"]
    elif any(kw in text for kw in ["design", "style", "visual", "theme", "beautiful", "aesthetic"]):
        return ICP_PAIN_POINTS["visual"]
    elif any(kw in text for kw in ["share", "export", "send"]):
        return ICP_PAIN_POINTS["sharing"]

    # Default based on pillar
    if pillar == "ai-organization":
        return ICP_PAIN_POINTS["organization"]
    elif pillar == "ai-design":
        return ICP_PAIN_POINTS["visual"]

    return ICP_PAIN_POINTS["fatigue"]


def generate_user_benefit(feature: dict) -> str:
    """Generate user-focused benefit statement."""
    pillar = feature.get("suggested_pillar", "general")
    benefits = PILLAR_BENEFITS.get(pillar, PILLAR_BENEFITS["general"])

    # Pick most relevant benefit
    description = feature.get("description", "").lower()

    if "sync" in description:
        return "Your notes, always in sync—across all your devices"
    elif "search" in description or "find" in description:
        return "Find any note in seconds—AI knows what you're looking for"
    elif "design" in description or "style" in description:
        return "Beautiful notes without the effort—AI handles the design"
    elif "board" in description or "layout" in description:
        return "See your thoughts organized visually—no folders needed"
    elif "share" in description or "export" in description:
        return "Share-ready notes without cleanup—look organized instantly"

    return benefits[0]


def generate_key_messages(feature: dict, pain_point: dict) -> list[str]:
    """Generate key marketing messages for the feature."""
    messages = []

    # Pain relief message
    messages.append(f"Say goodbye to \"{pain_point['pain']}\"")

    # Solution message
    messages.append(pain_point["solution"])

    # Feature-specific message
    name = feature.get("name", "")
    messages.append(f"{name}—built for how you actually work")

    # Pillar message
    pillar = feature.get("suggested_pillar", "general")
    if pillar == "ai-organization":
        messages.append("AI organizes in the background—you just capture")
    elif pillar == "ai-design":
        messages.append("Beautiful automatically—no design skills needed")

    return messages[:4]


def generate_social_hooks(feature: dict, user_benefit: str) -> dict[str, str]:
    """Generate platform-specific social media hooks."""
    name = feature.get("name", "")
    pillar = feature.get("suggested_pillar", "general")

    hooks = {}

    # Instagram: Visual + benefit focused
    hooks["instagram"] = f"✨ NEW: {name}\n\n{user_benefit}\n\nLink in bio to try it"

    # Twitter: Punchy, under 280 chars
    twitter_hook = f"{name} just dropped.\n\n{user_benefit}\n\nTry ToonNotes free →"
    if len(twitter_hook) > 280:
        twitter_hook = f"NEW: {name}\n\n{user_benefit[:100]}..."
    hooks["twitter"] = twitter_hook

    # TikTok: Hook-first
    hooks["tiktok"] = f"POV: {user_benefit.lower()} #ToonNotes #productivity"

    # Reddit: Authentic, not promotional
    hooks["reddit"] = f"I've been working on {name.lower()} for ToonNotes. Would love feedback from the community."

    # LinkedIn: Professional angle
    hooks["linkedin"] = f"Excited to share what we've been building: {name}.\n\n{user_benefit}\n\nWe're solving a problem millions face—note chaos."

    # Product Hunt: Tagline focused
    hooks["producthunt"] = f"{name}: {user_benefit}"

    return hooks


def generate_brief(feature: dict, output_dir: str) -> str:
    """Generate complete feature brief markdown."""
    # Extract data
    feature_id = feature.get("id", "feat-001")
    name = feature.get("name", "Unknown Feature")
    pillar = feature.get("suggested_pillar", "general")
    commits = feature.get("commits", [])
    apps = feature.get("apps", [])
    files_changed = feature.get("files_changed", 0)
    description = feature.get("description", "")

    # Generate content
    pain_point = detect_pain_point(feature)
    user_benefit = generate_user_benefit(feature)
    key_messages = generate_key_messages(feature, pain_point)
    social_hooks = generate_social_hooks(feature, user_benefit)

    # Build brief
    date = datetime.now().strftime("%Y-%m-%d")
    slug = slugify(name)

    brief = f"""---
id: "{feature_id}"
name: "{name}"
status: draft
generated_date: {date}
source: codebase-analysis
commits: {json.dumps(commits)}
pillar: {pillar}
apps: {json.dumps(apps)}
version: null
campaign: null
---

# Feature Brief: {name}

## Summary

{description}

This feature addresses the "{pain_point['pain']}" pain point that our Prolific Procrastinator ICP experiences. It aligns with our **{pillar.replace('-', ' ').title()}** pillar.

## User Benefit

{user_benefit}

## Pain Point Addressed

| Pain | Solution |
|------|----------|
| "{pain_point['pain']}" | {pain_point['solution']} |

## Key Messages

{chr(10).join(f'- {msg}' for msg in key_messages)}

## Social Hooks

| Platform | Hook |
|----------|------|
| Instagram | {social_hooks['instagram'][:100]}... |
| Twitter | {social_hooks['twitter'][:100]}... |
| TikTok | {social_hooks['tiktok'][:100]}... |
| Reddit | {social_hooks['reddit'][:100]}... |
| LinkedIn | {social_hooks['linkedin'][:100]}... |

### Full Platform Copy

#### Instagram
```
{social_hooks['instagram']}
```

#### Twitter
```
{social_hooks['twitter']}
```

#### TikTok
```
{social_hooks['tiktok']}
```

#### Reddit
```
{social_hooks['reddit']}
```

#### LinkedIn
```
{social_hooks['linkedin']}
```

#### Product Hunt
```
{social_hooks['producthunt']}
```

## Assets Required

- [ ] Hero image (1200x630)
- [ ] Feature screenshot
- [ ] Demo video/GIF
- [ ] App Store screenshots (if UI change)

## Technical Details

| Metric | Value |
|--------|-------|
| Commits | {len(commits)} |
| Files Changed | {files_changed} |
| Apps | {', '.join(apps)} |
| Pillar | {pillar} |

### Related Commits

{chr(10).join(f'- `{c}`' for c in commits)}

---

*Generated by /feature-launcher on {date}*
"""

    # Save to file
    output_path = Path(output_dir) / f"{date}-{slug}.md"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(brief)

    return str(output_path)


def main():
    parser = argparse.ArgumentParser(
        description="Generate marketing-ready feature briefs"
    )
    parser.add_argument(
        "--analysis",
        type=str,
        required=True,
        help="Path to analysis JSON from extract_features.py",
    )
    parser.add_argument(
        "--feature-id",
        type=str,
        help="Specific feature ID to generate brief for (generates all high-potential if omitted)",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="marketing/product/briefs/generated",
        help="Output directory for briefs",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Generate briefs for all features (not just high-potential)",
    )

    args = parser.parse_args()

    # Load analysis
    with open(args.analysis, "r", encoding="utf-8") as f:
        analysis = json.load(f)

    features = analysis.get("features", [])

    if not features:
        print("No features found in analysis")
        return

    # Filter features
    if args.feature_id:
        features = [f for f in features if f.get("id") == args.feature_id]
        if not features:
            print(f"Feature {args.feature_id} not found")
            return
    elif not args.all:
        # Only high-potential features
        features = [f for f in features if f.get("marketing_potential") == "high"]

    if not features:
        print("No features match criteria (try --all for all features)")
        return

    # Generate briefs
    print(f"Generating {len(features)} feature brief(s)...")

    for feature in features:
        output_path = generate_brief(feature, args.output_dir)
        print(f"  Created: {output_path}")

    print(f"\nDone! Briefs saved to: {args.output_dir}")


if __name__ == "__main__":
    main()
