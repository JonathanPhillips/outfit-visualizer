# Outfit Visualizer Backend

REST API backend for the Outfit Visualizer app with PostgreSQL database.

## Setup

### Prerequisites

- Node.js 16+
- PostgreSQL 12+

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb outfit_visualizer
   
   # Or using psql
   psql -c "CREATE DATABASE outfit_visualizer;"
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run migrations:**
   ```bash
   npm run migrate
   ```

5. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Items

- `GET /api/items` - Get all items (optional ?category filter)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create item (multipart/form-data with image)
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Outfits

- `GET /api/outfits` - Get all outfits with items
- `GET /api/outfits/:id` - Get single outfit with items
- `POST /api/outfits` - Create outfit with positioned items
- `PUT /api/outfits/:id` - Update outfit name
- `DELETE /api/outfits/:id` - Delete outfit

### Inspiration

- `GET /api/inspiration` - Get all inspiration images
- `GET /api/inspiration/:id` - Get single inspiration
- `POST /api/inspiration` - Upload inspiration image
- `PUT /api/inspiration/:id` - Update inspiration description
- `DELETE /api/inspiration/:id` - Delete inspiration

### Health Check

- `GET /health` - Server health check

## Database Schema

### Tables

- **users** - User accounts (prepared for multi-user)
- **items** - Clothing items with categories
- **outfits** - Saved outfit collections
- **outfit_items** - Junction table with item positions
- **inspiration** - Inspiration images

### Categories

- tops
- bottoms  
- shoes
- accessories
- outerwear

## File Upload

Images are stored in `/backend/uploads/` and served at `/uploads/:filename`.

**Supported formats:** JPEG, PNG, WebP, GIF  
**Max file size:** 5MB (configurable)

## Configuration

Key environment variables:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/outfit_visualizer
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
```

## Development

```bash
# Watch mode with nodemon
npm run dev

# Run migrations
npm run migrate

# Database operations
npm run seed  # (when implemented)
```

## Security Features

- Helmet for security headers
- Rate limiting (100 requests/15min per IP)
- CORS configuration
- File type validation
- File size limits
- SQL injection protection via parameterized queries