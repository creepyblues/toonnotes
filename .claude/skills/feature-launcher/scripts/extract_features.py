#!/usr/bin/env python3
"""
Extract marketable features from ToonNotes git history.

Analyzes git commits to identify user-facing features, categorize them
by marketing potential, and map them to Strategy v2 pillars.

Usage:
    python3 extract_features.py --since=v1.1.0
    python3 extract_features.py --days=7
    python3 extract_features.py --since=main --app=webapp
"""

import argparse
import json
import re
import subprocess
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from typing import Optional


@dataclass
class Commit:
    hash: str
    type: str  # feat, fix, perf, etc.
    scope: Optional[str]
    message: str
    author: str
    timestamp: str
    files_changed: int
    insertions: int
    deletions: int
    files: list[str]
    category: str  # feature, improvement, bugfix, technical
    marketing_potential: str  # high, medium, low


@dataclass
class Feature:
    id: str
    name: str
    source: str  # commit, prd, manual
    commits: list[str]
    category: str
    apps: list[str]
    files_changed: int
    marketing_potential: str
    suggested_pillar: str
    description: str
    user_benefit: Optional[str]


# Conventional commit types
COMMIT_TYPES = {
    "feat": {"category": "feature", "marketing": True},
    "fix": {"category": "bugfix", "marketing": True},
    "perf": {"category": "improvement", "marketing": True},
    "style": {"category": "improvement", "marketing": False},
    "refactor": {"category": "technical", "marketing": False},
    "docs": {"category": "technical", "marketing": False},
    "test": {"category": "technical", "marketing": False},
    "chore": {"category": "technical", "marketing": False},
    "ci": {"category": "technical", "marketing": False},
    "build": {"category": "technical", "marketing": False},
}

# Strategy v2 pillar mapping keywords
PILLAR_KEYWORDS = {
    "ai-organization": [
        "sync", "organize", "label", "search", "group", "summary",
        "auto", "categorize", "tag", "find", "retrieve", "index",
        "sort", "filter", "smart", "suggest", "recommend",
    ],
    "ai-design": [
        "design", "style", "visual", "theme", "board", "layout",
        "aesthetic", "color", "border", "texture", "template",
        "beautiful", "export", "share", "image", "photo",
    ],
}

# Apps detection from file paths
APP_PATTERNS = {
    "expo": r"(?:apps/expo|ToonNotes_Expo)/",
    "webapp": r"apps/webapp/",
    "web": r"ToonNotes_Web/",
    "marketing": r"marketing/",
}

# User-facing directories (high marketing potential)
USER_FACING_PATHS = [
    r"/components/",
    r"/screens/",
    r"/pages/",
    r"/views/",
    r"/ui/",
    r"/features/",
    r"/api/",
    r"/routes/",
]

# Technical directories (low marketing potential)
TECHNICAL_PATHS = [
    r"/utils/",
    r"/lib/",
    r"/helpers/",
    r"/config/",
    r"/types/",
    r"/constants/",
    r"/__tests__/",
    r"/test/",
]


def parse_conventional_commit(message: str) -> tuple[str, Optional[str], str]:
    """Parse conventional commit format: type(scope): description."""
    pattern = r"^(\w+)(?:\(([^)]+)\))?\s*:\s*(.+)$"
    match = re.match(pattern, message.split("\n")[0])

    if match:
        commit_type, scope, description = match.groups()
        return commit_type.lower(), scope, description

    # Non-conventional commit
    return "other", None, message.split("\n")[0]


def detect_apps(files: list[str]) -> list[str]:
    """Detect which apps are affected by file changes."""
    apps = set()

    for file in files:
        for app, pattern in APP_PATTERNS.items():
            if re.search(pattern, file):
                apps.add(app)

    return list(apps) if apps else ["unknown"]


def calculate_marketing_potential(
    commit_type: str,
    files: list[str],
    message: str
) -> str:
    """Calculate marketing potential based on commit type and files."""
    type_info = COMMIT_TYPES.get(commit_type, {"marketing": False})

    if not type_info["marketing"]:
        return "low"

    # Check if files are user-facing
    user_facing_count = sum(
        1 for f in files
        if any(re.search(p, f) for p in USER_FACING_PATHS)
    )

    technical_count = sum(
        1 for f in files
        if any(re.search(p, f) for p in TECHNICAL_PATHS)
    )

    if user_facing_count > technical_count:
        return "high"
    elif user_facing_count > 0:
        return "medium"
    else:
        return "low"


def suggest_pillar(message: str, files: list[str]) -> str:
    """Suggest Strategy v2 pillar based on content."""
    text = (message + " " + " ".join(files)).lower()

    org_score = sum(1 for kw in PILLAR_KEYWORDS["ai-organization"] if kw in text)
    design_score = sum(1 for kw in PILLAR_KEYWORDS["ai-design"] if kw in text)

    if org_score > design_score:
        return "ai-organization"
    elif design_score > org_score:
        return "ai-design"
    elif org_score > 0 and design_score > 0:
        return "both"
    else:
        return "general"


def get_commit_files(commit_hash: str, repo_path: str = ".") -> list[str]:
    """Get list of files changed in a commit."""
    try:
        result = subprocess.run(
            ["git", "-C", repo_path, "show", "--name-only", "--format=", commit_hash],
            capture_output=True,
            text=True,
            check=True,
        )
        return [f.strip() for f in result.stdout.strip().split("\n") if f.strip()]
    except subprocess.CalledProcessError:
        return []


def get_commit_stats(commit_hash: str, repo_path: str = ".") -> tuple[int, int, int]:
    """Get file change statistics for a commit."""
    try:
        result = subprocess.run(
            ["git", "-C", repo_path, "show", "--stat", "--format=", commit_hash],
            capture_output=True,
            text=True,
            check=True,
        )

        # Parse last line: "X files changed, Y insertions(+), Z deletions(-)"
        lines = result.stdout.strip().split("\n")
        if lines:
            stat_line = lines[-1]
            files_match = re.search(r"(\d+) file", stat_line)
            ins_match = re.search(r"(\d+) insertion", stat_line)
            del_match = re.search(r"(\d+) deletion", stat_line)

            files = int(files_match.group(1)) if files_match else 0
            insertions = int(ins_match.group(1)) if ins_match else 0
            deletions = int(del_match.group(1)) if del_match else 0

            return files, insertions, deletions
    except subprocess.CalledProcessError:
        pass

    return 0, 0, 0


def get_commits(
    since: Optional[str] = None,
    days: Optional[int] = None,
    app: Optional[str] = None,
    repo_path: str = "."
) -> list[Commit]:
    """Get commits within the specified range."""
    commits = []

    # Build git log command
    cmd = ["git", "-C", repo_path, "log", "--format=%H|%s|%an|%ai"]

    if since:
        # Check if it's a tag, branch, or commit
        cmd.append(f"{since}..HEAD")
    elif days:
        since_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        cmd.append(f"--since={since_date}")
    else:
        # Default to last 30 days
        since_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        cmd.append(f"--since={since_date}")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)

        for line in result.stdout.strip().split("\n"):
            if not line or "|" not in line:
                continue

            parts = line.split("|", 3)
            if len(parts) < 4:
                continue

            commit_hash, message, author, timestamp = parts

            # Parse conventional commit
            commit_type, scope, description = parse_conventional_commit(message)

            # Get files and stats
            files = get_commit_files(commit_hash, repo_path)
            files_changed, insertions, deletions = get_commit_stats(commit_hash, repo_path)

            # Filter by app if specified
            if app:
                apps = detect_apps(files)
                if app not in apps:
                    continue

            # Calculate marketing potential
            marketing_potential = calculate_marketing_potential(commit_type, files, message)

            # Determine category
            type_info = COMMIT_TYPES.get(commit_type, {"category": "technical"})
            category = type_info["category"]

            commits.append(Commit(
                hash=commit_hash[:8],
                type=commit_type,
                scope=scope,
                message=description,
                author=author,
                timestamp=timestamp,
                files_changed=files_changed,
                insertions=insertions,
                deletions=deletions,
                files=files,
                category=category,
                marketing_potential=marketing_potential,
            ))

    except subprocess.CalledProcessError as e:
        print(f"Error running git: {e}")

    return commits


def group_into_features(commits: list[Commit]) -> list[Feature]:
    """Group related commits into features."""
    features = []
    feature_id = 0

    # Group by scope and type
    groups: dict[tuple[str, str], list[Commit]] = {}

    for commit in commits:
        if commit.marketing_potential == "low":
            continue

        # Group key: (type, scope or first meaningful word)
        scope = commit.scope or "general"
        key = (commit.type, scope)

        if key not in groups:
            groups[key] = []
        groups[key].append(commit)

    # Convert groups to features
    for (commit_type, scope), group_commits in groups.items():
        if not group_commits:
            continue

        feature_id += 1

        # Aggregate data
        all_files = []
        all_apps = set()
        total_files_changed = 0

        for c in group_commits:
            all_files.extend(c.files)
            all_apps.update(detect_apps(c.files))
            total_files_changed += c.files_changed

        # Use highest marketing potential in group
        potentials = [c.marketing_potential for c in group_commits]
        if "high" in potentials:
            marketing_potential = "high"
        elif "medium" in potentials:
            marketing_potential = "medium"
        else:
            marketing_potential = "low"

        # Generate feature name from commits
        main_commit = group_commits[0]
        name = main_commit.message.split(".")[0].strip()
        if len(name) > 50:
            name = name[:47] + "..."

        # Determine category
        if commit_type == "feat":
            category = "New Feature"
        elif commit_type == "fix":
            category = "Bug Fix"
        elif commit_type == "perf":
            category = "Performance"
        else:
            category = "Improvement"

        features.append(Feature(
            id=f"feat-{feature_id:03d}",
            name=name,
            source="commit",
            commits=[c.hash for c in group_commits],
            category=category,
            apps=list(all_apps),
            files_changed=total_files_changed,
            marketing_potential=marketing_potential,
            suggested_pillar=suggest_pillar(
                " ".join(c.message for c in group_commits),
                all_files
            ),
            description=main_commit.message,
            user_benefit=None,
        ))

    # Sort by marketing potential
    potential_order = {"high": 0, "medium": 1, "low": 2}
    features.sort(key=lambda f: potential_order.get(f.marketing_potential, 3))

    return features


def generate_changelog_entries(commits: list[Commit]) -> dict[str, list[dict]]:
    """Generate changelog entries grouped by category."""
    entries: dict[str, list[dict]] = {
        "features": [],
        "improvements": [],
        "bugfixes": [],
        "technical": [],
    }

    for commit in commits:
        entry = {
            "scope": commit.scope,
            "description": commit.message,
            "commits": [commit.hash],
        }

        if commit.category == "feature":
            entries["features"].append(entry)
        elif commit.category == "improvement":
            entries["improvements"].append(entry)
        elif commit.category == "bugfix":
            entries["bugfixes"].append(entry)
        else:
            entries["technical"].append(entry)

    return entries


def main():
    parser = argparse.ArgumentParser(
        description="Extract marketable features from ToonNotes git history"
    )
    parser.add_argument(
        "--since",
        type=str,
        help="Git ref to analyze from (tag, branch, or commit SHA)",
    )
    parser.add_argument(
        "--days",
        type=int,
        help="Number of days to analyze (alternative to --since)",
    )
    parser.add_argument(
        "--app",
        type=str,
        choices=["expo", "webapp", "web", "marketing"],
        help="Filter commits by app",
    )
    parser.add_argument(
        "--repo-path",
        type=str,
        default=".",
        help="Path to git repository",
    )
    parser.add_argument(
        "--output",
        type=str,
        help="Output JSON file path (defaults to stdout)",
    )
    parser.add_argument(
        "--marketing-only",
        action="store_true",
        help="Only include commits with marketing potential",
    )

    args = parser.parse_args()

    # Get commits
    commits = get_commits(
        since=args.since,
        days=args.days,
        app=args.app,
        repo_path=args.repo_path,
    )

    # Filter if requested
    if args.marketing_only:
        commits = [c for c in commits if c.marketing_potential != "low"]

    # Group into features
    features = group_into_features(commits)

    # Generate changelog entries
    changelog_entries = generate_changelog_entries(commits)

    # Build output
    output = {
        "analysis_date": datetime.now().strftime("%Y-%m-%d"),
        "period": {
            "since": args.since or f"last {args.days or 30} days",
            "to": "HEAD",
        },
        "summary": {
            "commit_count": len(commits),
            "features_detected": len(features),
            "high_potential": sum(1 for f in features if f.marketing_potential == "high"),
            "apps_affected": list(set(app for f in features for app in f.apps)),
        },
        "features": [asdict(f) for f in features],
        "commits": [asdict(c) for c in commits],
        "changelog_entries": changelog_entries,
    }

    # Output
    output_json = json.dumps(output, indent=2, default=str)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output_json)
        print(f"Analysis saved to: {args.output}")
    else:
        print(output_json)


if __name__ == "__main__":
    main()
