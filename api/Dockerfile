FROM python:3.10-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy ML requirements and code
COPY ml/requirements.txt ./ml_requirements.txt
COPY ml/ ./ml/

# Install ML dependencies and train model
RUN pip install --no-cache-dir -r ml_requirements.txt && \
    python ml/train.py

# Copy API requirements
COPY api/requirements.txt ./requirements.txt

# Install API dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy API code
COPY api/main.py ./main.py

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080

# Run the API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]

