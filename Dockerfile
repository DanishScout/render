# Brug et officielt Python-image som base
FROM python:3.10-slim

# Installer Google Chrome og de nødvendige Linux-pakker til Selenium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    && wget -q -O - https://google.com | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://google.com stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
    && apt-get update && apt-get install -y google-chrome-stable \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Sæt arbejdsmappen i containeren
WORKDIR /app

# Kopier requirements.txt direkte fra din backend-mappe ind i containeren og installer
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Kopier alt indholdet fra din lokale backend-mappe ind i /app-mappen i containeren
COPY backend/ ./

# Fortæl containeren, at den skal starte din uvicorn-server direkte fra roden af koden
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000"]
