# Outfit Visualizer - Claude Context

## Project Overview
Web application for visualizing outfit combinations. Originally used browser localStorage, now migrating to PostgreSQL database.

## Database Setup Progress ✅
- **PostgreSQL + pgAdmin** running in Docker containers
- **Database schema** created with tables for users, items, outfits, outfit_items, inspiration
- **Backend configuration** ready with pg connection pool
- **Environment variables** configured in backend/.env

## Database Connection Details
- **Database**: outfit_visualizer
- **User**: outfit_user  
- **Port**: 5432
- **pgAdmin**: http://localhost:8080 (admin@outfitvisualizer.com / admin123)

## Database Migration Status ✅  
- **Database connection**: Working (connected to PostgreSQL)
- **Tables created**: All tables exist (users, items, outfits, outfit_items, inspiration)
- **API endpoints**: Working (GET /health, GET /api/items returning empty array)

## Migration Status ✅ COMPLETE
- ~~Test database connection~~ ✅
- ~~Run migrations to set up tables~~ ✅ (auto-created by Docker)
- ~~Update frontend to use API instead of localStorage~~ ✅
- ~~Test the full application flow~~ ✅

## What's Working
- **PostgreSQL database** with all tables
- **Backend API** with full CRUD operations for items, outfits, and inspiration
- **Frontend application** fully migrated from localStorage to API calls
- **File uploads** working for item images and inspiration
- **Outfit builder** with drag-and-drop functionality
- **Image serving** from backend uploads directory

## Testing Status
- **Basic Tests** ✅ All 18 tests passing (DOM structure, state management, form validation)
- **Item Management Tests** ✅ All tests passing 
- **Integration Tests** ⚠️ Some failures due to localStorage mock conflicts (expected after API migration)
- **Test Files**: `tests/simple.test.js`, `tests/itemManagement.test.js`, `tests/outfitManagement.test.js`, `tests/dragAndDrop.test.js`, `tests/localStorage.test.js`

## Current Status ✅ FULLY OPERATIONAL
The application is running and fully functional with PostgreSQL database.

**Servers Running:**
- Backend API: http://localhost:3001 (health endpoint working)
- Frontend: http://localhost:3000 (serving all files correctly)
- Database: PostgreSQL containers running

## Next Steps / TODO List
- **Integration Tests** ⚠️ Fix localStorage mock conflicts in integration tests
- **Data Validation** 📝 Add input validation on backend API endpoints
- **Error Handling** 🛡️ Improve file upload error handling
- **User Auth** 👤 Consider adding user authentication (currently no user system)

## Commands to Remember
```bash
# Start database (if not running)
docker-compose up -d

# Check container status  
docker-compose ps

# Start backend server (runs on port 3001)
cd backend && npm start

# Start frontend server (runs on port 3000)
python3 -m http.server 3000

# Run tests
npm test

# Run migrations
cd backend && npm run migrate
```