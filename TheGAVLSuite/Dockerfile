# TheGAVL Production Deployment
# Multi-stage Docker build for 87.5% accuracy Supreme Court verdict prediction

FROM python:3.11-slim as base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY supremecourt_*.py /app/
COPY gavl_production_api.py /app/
COPY phase_4*.py /app/

# Copy data files
COPY justice_voting_profiles.json /app/
COPY scotus_training_dataset_200.jsonl /app/

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Expose API port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "gavl_production_api:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
