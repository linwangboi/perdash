#!/bin/sh
# ===============================
# entrypoint.sh
# Handles migrations + web / worker
# ===============================

# Wait for the database to be ready
echo "Waiting for database..."
until python manage.py showmigrations > /dev/null 2>&1; do
    echo "Database not ready, sleeping 2s..."
    sleep 2
done

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Decide which process to start
if [ "$RAILWAY_PROCESS_TYPE" = "worker" ]; then
    echo "Starting Celery worker..."
    celery -A perdash worker --loglevel=info --concurrency=1 --uid=1000
else
    echo "Starting Gunicorn web server..."
    exec gunicorn perdash.wsgi:application --bind 0.0.0.0:10000
fi