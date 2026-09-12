#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Installer dine Python-pakker
pip install -r requirements.txt

# 2. Definer en fast mappe til Chrome
CHROME_DIR=/opt/render/project/.render
mkdir -p "$CHROME_DIR"
cd "$CHROME_DIR"

# 3. Hent den officielle stabile version af Chrome (Opdelt URL så den ikke ændres)
echo "... Henter Chrome til Render ..."
URL_PART1="https://googleapis.com"
URL_PART2="/122.0.6261.94/linux64/chrome-linux64.zip"
wget -q "$URL_PART1$URL_PART2"

# 4. Pak ud ved hjælp af Python (da 'unzip' mangler på Render)
echo "... Pakker Chrome ud uden unzip-kommandoen ..."
python -c "import zipfile; z = zipfile.ZipFile('chrome-linux64.zip'); z.extractall(); z.close()"

# 5. Fjern zip-filen for at spare plads
rm chrome-linux64.zip

# 6. Gør filen eksekverbar
chmod +x chrome-linux64/chrome

echo "... Chrome installation færdig! ..."
