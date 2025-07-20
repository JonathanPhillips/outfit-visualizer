#!/bin/bash

# Stop Outfit Visualizer services

echo "🛑 Stopping Outfit Visualizer services..."

# Stop backend processes
echo "🖥️  Stopping backend server..."
pkill -f "npm run dev"
pkill -f "nodemon"
pkill -f "node server.js"

# Stop Docker containers
echo "🐘 Stopping PostgreSQL..."
docker-compose down

echo "✅ All services stopped!"