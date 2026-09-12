#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Installer standard Python-pakker fra din requirements.txt
pip install -r requirements.txt

# 2. Opret en mappe til Google Chrome
STORAGE_DIR=/opt/render/project/.render
mkdir -p "$STORAGE_DIR"

cd "$STORAGE_DIR"

# 3. Hent og udpak den officielle stabile version af Google Chrome til Linux
echo "... Henter Google Chrome ..."
wget -q https://googleapis.com
unzip -q chrome-linux64.zip
rm chrome-linux64.zip

# 4. Gør det muligt for Selenium at eksekvere binæren
chmod +x chrome-linux64/chrome

echo "... Google Chrome er installeret korrekt ..."
