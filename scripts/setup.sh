#!/bin/bash

# Outfit Visualizer Setup Script

echo "🚀 Setting up Outfit Visualizer..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start PostgreSQL with Docker
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is ready
until docker-compose exec postgres pg_isready -U outfit_user -d outfit_visualizer; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Run database migrations (schema should auto-load via docker-entrypoint-initdb.d)
echo "🗃️  Database schema loaded automatically"

# Start the backend server
echo "🚀 Starting backend server..."
npm run dev &
BACKEND_PID=$!

cd ..

echo "✅ Setup complete!"
echo ""
echo "🎉 Your Outfit Visualizer is ready!"
echo ""
echo "📊 Services running:"
echo "   • PostgreSQL: localhost:5432"
echo "   • Backend API: http://localhost:3001"
echo "   • pgAdmin: http://localhost:8080 (admin@outfitvisualizer.com / admin123)"
echo ""
echo "🌐 Open index.html in your browser to start using the app!"
echo ""
echo "⚠️  Make sure to keep this terminal open to keep the backend running."
echo ""
echo "To stop services:"
echo "   docker-compose down"

# Keep script running
wait $BACKEND_PID