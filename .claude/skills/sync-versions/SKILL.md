# Sync Versions

Synchronizes product version information from source files (app.json, package.json) to the marketing product manifest.

## When to Use

- After bumping app version in `ToonNotes_Expo/app.json`
- After updating web version in `ToonNotes_Web/package.json`
- Before launching a marketing campaign to verify version alignment
- Periodically to ensure manifest is up-to-date

## What It Does

1. **Reads source files:**
   - `ToonNotes_Expo/app.json` → iOS/Android version + build number
   - `ToonNotes_Web/package.json` → Web version

2. **Updates manifest:**
   - `marketing/product/manifest.yaml` → Updates current_version, build_number, last_synced

3. **Validates campaigns:**
   - Checks if any active campaigns reference unreleased versions
   - Warns about version mismatches

## Usage

```
/sync-versions              # Sync all versions
/sync-versions --check      # Check without updating (dry run)
/sync-versions --validate   # Validate campaign version references
```

## Implementation

When this skill is invoked:

### Step 1: Read Source Files

```bash
# Read ToonNotes_Expo/app.json
# Extract: expo.version, expo.ios.buildNumber, expo.android.versionCode

# Read ToonNotes_Web/package.json
# Extract: version
```

### Step 2: Update Manifest

Update `marketing/product/manifest.yaml`:

```yaml
last_synced: {current_timestamp}

products:
  ios:
    current_version: {expo.version}
    build_number: {expo.ios.buildNumber}
  android:
    current_version: {expo.version}
    version_code: {expo.android.versionCode}
  web:
    current_version: {package.version}
```

### Step 3: Validate Campaigns

For each campaign in `marketing/campaigns/active/`:
- Read `campaign.yaml`
- Check `product.min_version` against manifest versions
- Warn if campaign targets unreleased version

### Step 4: Report

Output sync results:
```
Sync Versions Report
====================

Source Files:
  ToonNotes_Expo/app.json: v1.1.1 (build 2)
  ToonNotes_Web/package.json: v0.1.0

Updated:
  marketing/product/manifest.yaml
  - ios: 1.1.1 (build 2)
  - android: 1.1.1 (version_code 2)
  - web: 0.1.0

Validation:
  pro-launch campaign: targets v1.2.0 (UNRELEASED)
```

## Files Modified

- `marketing/product/manifest.yaml` - Version numbers and last_synced timestamp

## Files Read

- `ToonNotes_Expo/app.json` - Source of iOS/Android versions
- `ToonNotes_Web/package.json` - Source of web version
- `marketing/campaigns/active/*/campaign.yaml` - Campaign version validation

## Related Skills

- `/marketing-campaign` - Creates campaigns that reference product versions
- `/deploy-staging` - May trigger version sync before deployment

## Notes

- Always run sync before major marketing campaigns
- The manifest is the source of truth for marketing - source files are authoritative
- Version mismatches between manifest and source indicate sync needed
