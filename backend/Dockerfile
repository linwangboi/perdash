FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y postgresql-client gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Copy entrypoint and make it executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 10000

CMD ["./entrypoint.sh"]