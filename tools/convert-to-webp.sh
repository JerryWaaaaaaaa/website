#!/usr/bin/env bash
# Batch convert all PNG files to WebP using macOS built-in sips.
# Originals are replaced by WebP files at the same path.
#
# Usage: ./convert-to-webp.sh [--quality <0-100>]
# Default quality: 100

set -euo pipefail

QUALITY=100
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --quality)
      QUALITY="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--quality <0-100>]"
      exit 1
      ;;
  esac
done

# Prompt for target folder
read -r -p "Enter folder path to convert: " TARGET_DIR
if [[ -z "$TARGET_DIR" ]]; then
  echo "Error: No folder path provided."
  exit 1
fi

# Expand ~ if present
TARGET_DIR="${TARGET_DIR/#\~/$HOME}"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Error: '$TARGET_DIR' is not a valid directory."
  exit 1
fi

echo "Converting PNGs to WebP (quality: $QUALITY) in: $TARGET_DIR"
echo ""

total_files=0
total_saved=0
failed=0

while IFS= read -r -d '' png; do
  webp="${png%.png}.webp"

  before=$(stat -f%z "$png")

  sips_exit=0
  sips_error=$(sips --setProperty format webp \
          --setProperty formatOptions "$QUALITY" \
          "$png" \
          --out "$webp" 2>&1) || sips_exit=$?
  if [[ $sips_exit -eq 0 ]]; then
    rm "$png"
    after=$(stat -f%z "$webp")
    saved=$(( before - after ))
    saved_pct=$(( saved * 100 / before ))
    total_saved=$(( total_saved + saved ))
    total_files=$(( total_files + 1 ))

    # Relative path for cleaner output
    rel="${png#$TARGET_DIR/}"
    printf "  %-70s %6s KB → %6s KB  (%s%%)\n" \
      "$rel" \
      "$(( before / 1024 ))" \
      "$(( after / 1024 ))" \
      "$saved_pct"
  else
    echo "  FAILED: $png"
    echo "  Reason: $sips_error"
    failed=$(( failed + 1 ))
  fi
done < <(find "$TARGET_DIR" -name "*.png" -not -name "._*" -print0 | sort -z)

echo ""
echo "Done."
echo "  Converted : $total_files files"
echo "  Failed    : $failed files"
if [[ $total_saved -gt 0 ]]; then
  echo "  Total saved: $(( total_saved / 1024 )) KB"
fi
