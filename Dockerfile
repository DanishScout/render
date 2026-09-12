# Brug et officielt standard Python-image
FROM python:3.10-slim

# Installer KUN de absolut basale pakkeværktøjer
RUN apt-get update && apt-get install -y \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Hent den officielle Google Chrome installationspakke
RUN curl -LO https://google.com

# Installer Chrome og lad 'apt-get install -y -f' AUTOMATISK fikse og hente alle afhængigheder til den
RUN apt-get update && \
    (dpkg -i google-chrome-stable_current_amd64.deb || apt-get install -y -f) && \
    rm google-chrome-stable_current_amd64.deb && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Sæt arbejdsmappen i containeren
WORKDIR /app

# Kopier requirements.txt direkte fra din backend-mappe ind i containeren og installer
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Kopier alt indholdet fra din lokale backend-mappe ind i /app-mappen i containeren
COPY backend/ ./

# Start din uvicorn-server direkte fra roden af koden
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000"]
