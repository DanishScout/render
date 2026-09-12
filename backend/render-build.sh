#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Installer dine Python-pakker
pip install -r requirements.txt

# 2. Definer en fast mappe til Chrome
CHROME_DIR=/opt/render/project/.render/chrome-linux64
mkdir -p "$CHROME_DIR"

# 3. Hent og udpak Chrome direkte til den rigtige mappe
echo "... Henter Chrome til Render ..."
wget -q https://googleapis.com
unzip -q -o chrome-linux64.zip
rm chrome-linux64.zip

# 4. Gør filen eksekverbar
chmod +x /opt/render/project/.render/chrome-linux64/chrome

echo "... Chrome installation færdig! ..."
