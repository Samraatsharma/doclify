#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REVIA_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SRC_TAURI="${REVIA_ROOT}/src-tauri"
WORKSPACE_ROOT="$(cd "${REVIA_ROOT}/.." && pwd)"
WEBSITE_DOWNLOADS="${WORKSPACE_ROOT}/website/public/downloads"
TARGET_DIR="${SRC_TAURI}/target/x86_64-pc-windows-msvc/release"
EXE_PATH="${TARGET_DIR}/revia.exe"
ZIP_NAME="Revia_Windows_x64.zip"
OUTPUT_ZIP="${TARGET_DIR}/${ZIP_NAME}"

echo "============================================================"
echo "REVIA WINDOWS BETA PACKAGING PIPELINE (x86_64)"
echo "============================================================"

if [ ! -f "${EXE_PATH}" ]; then
    echo "ERROR: revia.exe not found at ${EXE_PATH}"
    exit 1
fi

echo "--> Inspecting Windows binary..."
file "${EXE_PATH}"

STAGE_DIR=$(mktemp -d /tmp/revia_win_staging.XXXXXX)
trap 'rm -rf "${STAGE_DIR}"' EXIT

echo "--> Staging Windows distribution package..."
cp "${EXE_PATH}" "${STAGE_DIR}/Revia.exe"

cat << 'EOF' > "${STAGE_DIR}/README.txt"
Revia for Windows — v1.5.0 Beta
================================

Thank you for testing Revia for Windows!

QUICK START:
1. Double-click Revia.exe to launch.
2. Complete the initial setup.
3. Use Alt+Space to summon Revia from anywhere.
4. Type your query or use voice search.
5. Press Escape to dismiss.

NOTE ON WINDOWS SMARTSCREEN:
Because this is an early beta release without an enterprise certificate,
Windows Defender SmartScreen may display an informational notice.
Click "More info" and "Run anyway" to open Revia.

SYSTEM TRAY:
Revia runs in your background tray (near the system clock). Right-click
the tray icon anytime to open settings, pause indexing, or quit.

Support & Updates: https://github.com/Samraatsharma/doclify
EOF

echo "--> Packaging release ZIP..."
rm -f "${OUTPUT_ZIP}"
(cd "${STAGE_DIR}" && zip -9 -r "${OUTPUT_ZIP}" Revia.exe README.txt)

echo "--> Verifying ZIP integrity..."
unzip -t "${OUTPUT_ZIP}"

echo "--> Calculating checksum..."
ZIP_SHA256=$(shasum -a 256 "${OUTPUT_ZIP}" | awk '{print $1}')
ZIP_SIZE_BYTES=$(stat -f%z "${OUTPUT_ZIP}")
ZIP_SIZE_MB=$(echo "scale=1; ${ZIP_SIZE_BYTES} / 1048576" | bc)
EXE_SHA256=$(shasum -a 256 "${EXE_PATH}" | awk '{print $1}')
EXE_SIZE_BYTES=$(stat -f%z "${EXE_PATH}")
EXE_SIZE_MB=$(echo "scale=1; ${EXE_SIZE_BYTES} / 1048576" | bc)

echo "    EXE SHA-256: ${EXE_SHA256} (${EXE_SIZE_MB} MB)"
echo "    ZIP SHA-256: ${ZIP_SHA256} (${ZIP_SIZE_MB} MB)"

echo "--> Copying to website downloads..."
mkdir -p "${WEBSITE_DOWNLOADS}"
cp -f "${OUTPUT_ZIP}" "${WEBSITE_DOWNLOADS}/${ZIP_NAME}"

echo "--> Verifying website copy integrity..."
WEB_SHA256=$(shasum -a 256 "${WEBSITE_DOWNLOADS}/${ZIP_NAME}" | awk '{print $1}')
if [ "${ZIP_SHA256}" != "${WEB_SHA256}" ]; then
    echo "ERROR: Checksum mismatch between package and website copy!"
    exit 1
fi

echo "============================================================"
echo "WINDOWS RELEASE PACKAGING COMPLETE"
echo "ZIP:    ${WEBSITE_DOWNLOADS}/${ZIP_NAME}"
echo "SHA256: ${ZIP_SHA256}"
echo "Size:   ${ZIP_SIZE_MB} MB (${ZIP_SIZE_BYTES} bytes)"
echo "============================================================"
