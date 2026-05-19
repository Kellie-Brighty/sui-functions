#!/bin/bash

# scripts/upload_to_walrus.sh
# Usage: ./scripts/upload_to_walrus.sh <filename>

if [ -z "$1" ]; then
    echo "Usage: $0 <filename>"
    exit 1
fi

FILENAME=$1

if [ ! -f "$FILENAME" ]; then
    echo "Error: File $FILENAME not found."
    exit 1
fi

echo "Uploading $FILENAME to Walrus..."

# Run walrus store and capture output
# We use --epochs 180 as requested
OUTPUT=$(walrus store "$FILENAME" --epochs 180 2>&1)

if [ $? -ne 0 ]; then
    echo "Error: Walrus upload failed."
    echo "$OUTPUT"
    exit 1
fi

# Extract Blob ID
# Adjusting regex based on typical Walrus output (e.g., "Blob ID: ...")
BLOB_ID=$(echo "$OUTPUT" | grep -oE "Blob ID: [a-zA-Z0-9_-]+" | cut -d' ' -f3)

if [ -z "$BLOB_ID" ]; then
    # Fallback: search for any string that looks like a Blob ID if the label isn't found
    BLOB_ID=$(echo "$OUTPUT" | grep -oE "[a-zA-Z0-9_-]{43,}")
fi

if [ -z "$BLOB_ID" ]; then
    echo "Error: Could not extract Blob ID from Walrus output."
    echo "Raw output:"
    echo "$OUTPUT"
    exit 1
fi

echo "Successfully uploaded. Blob ID: $BLOB_ID"

# Ensure metadata directory exists
mkdir -p metadata

# Save to metadata/latest_upload.json
cat <<EOF > metadata/latest_upload.json
{
  "filename": "$FILENAME",
  "blob_id": "$BLOB_ID",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "epochs": 180
}
EOF

echo "Metadata saved to metadata/latest_upload.json"
