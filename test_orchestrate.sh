#!/bin/bash
# Test script for POST /api/orchestrate endpoint

echo "Starting server in background..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo ""
echo "=== Test 1: tariff_video_overlay job type ==="
curl -X POST http://localhost:3000/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"job_type": "tariff_video_overlay"}' \
  -w "\n"

echo ""
echo "=== Test 2: unknown job type ==="
curl -X POST http://localhost:3000/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"job_type": "unknown_job"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "=== Test 3: missing job_type ==="
curl -X POST http://localhost:3000/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "Stopping server..."
kill $SERVER_PID

echo "Tests completed!"
