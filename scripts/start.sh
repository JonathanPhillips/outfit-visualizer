#!/bin/bash

# Start Outfit Visualizer services

echo "🚀 Starting Outfit Visualizer services..."

# Start PostgreSQL
echo "🐘 Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for database
echo "⏳ Waiting for database..."
sleep 5

# Start backend
echo "🖥️  Starting backend server..."
cd backend
npm run dev &

echo "✅ Services started!"
echo ""
echo "📊 Services running:"
echo "   • PostgreSQL: localhost:5432"  
echo "   • Backend API: http://localhost:3001"
echo "   • pgAdmin: http://localhost:8080"
echo ""
echo "🌐 Open index.html in your browser!"