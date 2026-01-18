#!/usr/bin/env python3
"""
parse_results.py
Parse Maestro test output and generate summary report.
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import TypedDict, Optional


class FlowResult(TypedDict):
    name: str
    status: str  # "passed" | "failed" | "skipped"
    duration_ms: int
    error: Optional[str]
    screenshot: Optional[str]


class TestSummary(TypedDict):
    platform: str
    device: str
    timestamp: str
    total: int
    passed: int
    failed: int
    skipped: int
    duration_ms: int
    pass_rate: str
    results: list[FlowResult]


def parse_maestro_output(output: str) -> list[FlowResult]:
    """Parse Maestro console output for flow results."""
    results = []

    # Pattern for completed flows
    # Matches: "✓ flow-name (12s)" or "✗ flow-name (45s)" or "○ flow-name (skipped)"
    flow_pattern = r"([✓✗○])\s+(.+?)\s+\((\d+(?:\.\d+)?)(s|ms|skipped)\)"

    for match in re.finditer(flow_pattern, output):
        icon, name, duration_str, unit = match.groups()

        # Parse duration
        if unit == "skipped":
            duration_ms = 0
            status = "skipped"
        else:
            duration = float(duration_str)
            if unit == "s":
                duration_ms = int(duration * 1000)
            else:
                duration_ms = int(duration)
            status = "passed" if icon == "✓" else "failed" if icon == "✗" else "skipped"

        results.append({
            "name": name.strip(),
            "status": status,
            "duration_ms": duration_ms,
            "error": None,
            "screenshot": None
        })

    # Parse error messages for failed tests
    error_pattern = r"FAILED:\s+(.+?)\n.*?Error:\s+(.+?)(?:\n|$)"
    for match in re.finditer(error_pattern, output, re.DOTALL):
        flow_name, error_msg = match.groups()
        # Find and update the matching result
        for result in results:
            if result["name"] in flow_name:
                result["error"] = error_msg.strip()
                break

    return results


def parse_maestro_json(json_path: str) -> list[FlowResult]:
    """Parse Maestro JSON output file."""
    with open(json_path, "r") as f:
        data = json.load(f)

    results = []
    for flow in data.get("flows", []):
        results.append({
            "name": flow.get("name", "unknown"),
            "status": flow.get("status", "unknown"),
            "duration_ms": flow.get("duration", 0),
            "error": flow.get("error"),
            "screenshot": flow.get("screenshot")
        })

    return results


def generate_summary(
    results: list[FlowResult],
    platform: str = "unknown",
    device: str = "unknown"
) -> TestSummary:
    """Generate test summary from results."""
    passed = sum(1 for r in results if r["status"] == "passed")
    failed = sum(1 for r in results if r["status"] == "failed")
    skipped = sum(1 for r in results if r["status"] == "skipped")
    total = len(results)
    total_duration = sum(r["duration_ms"] for r in results)

    return {
        "platform": platform,
        "device": device,
        "timestamp": datetime.now().isoformat(),
        "total": total,
        "passed": passed,
        "failed": failed,
        "skipped": skipped,
        "duration_ms": total_duration,
        "pass_rate": f"{(passed / total * 100):.0f}%" if total > 0 else "N/A",
        "results": results
    }


def format_duration(ms: int) -> str:
    """Format milliseconds as human-readable duration."""
    seconds = ms // 1000
    if seconds < 60:
        return f"{seconds}s"
    minutes = seconds // 60
    seconds = seconds % 60
    return f"{minutes}m {seconds}s"


def print_console_report(summary: TestSummary) -> None:
    """Print formatted console report."""
    print("")
    print("=" * 50)
    print("  Test Results - ToonNotes Mobile E2E")
    print("=" * 50)
    print(f"  Platform: {summary['platform']} ({summary['device']})")
    print(f"  Flows Run: {summary['total']}")
    print(f"  Duration: {format_duration(summary['duration_ms'])}")
    print("")
    print("  Results:")

    for result in summary["results"]:
        status_icon = {
            "passed": "[PASS]",
            "failed": "[FAIL]",
            "skipped": "[SKIP]"
        }.get(result["status"], "[????]")

        duration = format_duration(result["duration_ms"])
        print(f"    {status_icon} {result['name']} ({duration})")

    print("")
    print("-" * 50)
    print(f"  Summary: {summary['passed']}/{summary['total']} passed ({summary['pass_rate']})")

    # Print failed test details
    failed_tests = [r for r in summary["results"] if r["status"] == "failed"]
    if failed_tests:
        print("")
        print("  Failed Tests:")
        for result in failed_tests:
            print(f"    {result['name']}:")
            if result["error"]:
                print(f"      Error: {result['error']}")
            if result["screenshot"]:
                print(f"      Screenshot: {result['screenshot']}")

    print("")
    print("=" * 50)


def main():
    parser = argparse.ArgumentParser(
        description="Parse Maestro test results and generate summary"
    )
    parser.add_argument(
        "--input", "-i",
        type=str,
        help="Input file (Maestro output or JSON). If omitted, reads from stdin."
    )
    parser.add_argument(
        "--format", "-f",
        choices=["json", "console"],
        default="console",
        help="Output format (default: console)"
    )
    parser.add_argument(
        "--platform", "-p",
        type=str,
        default="unknown",
        help="Platform name (e.g., 'iOS', 'Android')"
    )
    parser.add_argument(
        "--device", "-d",
        type=str,
        default="unknown",
        help="Device name (e.g., 'iPhone 15 Pro')"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        help="Output file path (if omitted, prints to stdout)"
    )
    parser.add_argument(
        "--json-input",
        action="store_true",
        help="Treat input as Maestro JSON output file"
    )

    args = parser.parse_args()

    # Read input
    if args.input:
        if args.json_input or args.input.endswith(".json"):
            results = parse_maestro_json(args.input)
        else:
            with open(args.input, "r") as f:
                output = f.read()
            results = parse_maestro_output(output)
    else:
        output = sys.stdin.read()
        results = parse_maestro_output(output)

    # Generate summary
    summary = generate_summary(results, args.platform, args.device)

    # Output
    if args.format == "json":
        json_output = json.dumps(summary, indent=2)
        if args.output:
            with open(args.output, "w") as f:
                f.write(json_output)
        else:
            print(json_output)
    else:
        if args.output:
            # Redirect stdout to file
            with open(args.output, "w") as f:
                old_stdout = sys.stdout
                sys.stdout = f
                print_console_report(summary)
                sys.stdout = old_stdout
        else:
            print_console_report(summary)

    # Exit with error code if any tests failed
    if summary["failed"] > 0:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
