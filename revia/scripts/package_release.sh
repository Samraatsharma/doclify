#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REVIA_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SRC_TAURI="${REVIA_ROOT}/src-tauri"
WORKSPACE_ROOT="$(cd "${REVIA_ROOT}/.." && pwd)"
WEBSITE_DOWNLOADS="${WORKSPACE_ROOT}/website/public/downloads"
BUNDLE_DIR="${SRC_TAURI}/target/release/bundle/macos"
APP_PATH="${BUNDLE_DIR}/Revia.app"
ZIP_NAME="Revia_1.5.0_aarch64.zip"
OUTPUT_ZIP="${BUNDLE_DIR}/${ZIP_NAME}"
DMG_NAME="Revia_1.5.0_aarch64.dmg"
OUTPUT_DMG="${BUNDLE_DIR}/${DMG_NAME}"

echo "============================================================"
echo "REVIA PACKAGING & SIGNING PIPELINE (V1.5 BETA ZIP)"
echo "============================================================"

if [ ! -d "${APP_PATH}" ]; then
    echo "ERROR: Revia.app not found at ${APP_PATH}"
    exit 1
fi

echo "--> Inspecting bundle structure..."
echo "    App bundle: ${APP_PATH}"
echo "    Executable: ${APP_PATH}/Contents/MacOS/revia"
file "${APP_PATH}/Contents/MacOS/revia"

echo "--> Removing any stale extended attributes / metadata..."
xattr -cr "${APP_PATH}"

echo "--> Signing all nested binaries (if any) and application bundle..."
SIGNING_IDENTITY="-"
AVAILABLE_IDENTITIES=$(security find-identity -v -p codesigning 2>/dev/null | grep "valid identities found" | awk '{print $1}')
if [ "${AVAILABLE_IDENTITIES:-0}" -gt 0 ]; then
    DEV_ID=$(security find-identity -v -p codesigning | grep "Developer ID Application:" | head -n 1 | awk -F'"' '{print $2}')
    if [ -n "${DEV_ID}" ]; then
        SIGNING_IDENTITY="${DEV_ID}"
        echo "    Using Developer ID: ${SIGNING_IDENTITY}"
    fi
fi

if [ "${SIGNING_IDENTITY}" = "-" ]; then
    echo "    Using valid ad-hoc bundle signing with sealed resources"
    codesign --force --deep --sign - "${APP_PATH}"
else
    codesign --force --deep --sign "${SIGNING_IDENTITY}" --options runtime --timestamp "${APP_PATH}"
fi

echo "--> Verifying code signature with strict verification..."
codesign --verify --deep --strict --verbose=4 "${APP_PATH}"
codesign -dv --verbose=4 "${APP_PATH}"

echo "--> Packaging fresh release ZIP (containing Revia.app directly at root)..."
rm -f "${OUTPUT_ZIP}"
cd "${BUNDLE_DIR}"
# Use zip -ry to preserve symlinks, permissions, and directory structure cleanly without macOS junk metadata
zip -ry "${OUTPUT_ZIP}" "Revia.app"

echo "--> Testing ZIP integrity..."
unzip -t "${OUTPUT_ZIP}"

echo "--> Calculating release ZIP checksum..."
ZIP_SHA256=$(shasum -a 256 "${OUTPUT_ZIP}" | awk '{print $1}')
ZIP_SIZE_BYTES=$(stat -f%z "${OUTPUT_ZIP}")
ZIP_SIZE_MB=$(echo "scale=1; ${ZIP_SIZE_BYTES} / 1048576" | bc)
echo "    ZIP SHA-256: ${ZIP_SHA256}"
echo "    ZIP Size:    ${ZIP_SIZE_MB} MB (${ZIP_SIZE_BYTES} bytes)"

echo "--> Deploying ZIP to website downloads directory..."
mkdir -p "${WEBSITE_DOWNLOADS}"
cp -f "${OUTPUT_ZIP}" "${WEBSITE_DOWNLOADS}/${ZIP_NAME}"

echo "--> Verifying byte-for-byte integrity between release and website..."
WEBSITE_ZIP_SHA256=$(shasum -a 256 "${WEBSITE_DOWNLOADS}/${ZIP_NAME}" | awk '{print $1}')
if [ "${ZIP_SHA256}" != "${WEBSITE_ZIP_SHA256}" ]; then
    echo "ERROR: Checksum mismatch between packaged ZIP and website ZIP!"
    exit 1
fi

echo "--> (Optional) Building secondary development DMG..."
STAGING_DIR=$(mktemp -d /tmp/revia_dmg_staging.XXXXXX)
trap 'rm -rf "${STAGING_DIR}"' EXIT
cp -R "${APP_PATH}" "${STAGING_DIR}/Revia.app"
ln -s /Applications "${STAGING_DIR}/Applications"
rm -f "${OUTPUT_DMG}"
hdiutil create \
    -volname "Revia" \
    -srcfolder "${STAGING_DIR}" \
    -ov \
    -format UDZO \
    "${OUTPUT_DMG}" >/dev/null 2>&1 || true
codesign --force --sign - "${OUTPUT_DMG}" 2>/dev/null || true

echo "============================================================"
echo "RELEASE PACKAGING COMPLETE"
echo "ZIP:    ${WEBSITE_DOWNLOADS}/${ZIP_NAME}"
echo "SHA256: ${ZIP_SHA256}"
echo "Size:   ${ZIP_SIZE_MB} MB (${ZIP_SIZE_BYTES} bytes)"
echo "============================================================"
