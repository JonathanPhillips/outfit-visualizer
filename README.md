# Outfit Visualizer

A visual outfit planning web app that lets you drag and drop clothing items to create outfits. Upload photos of your clothes, organize them by category, and visually plan your outfits with persistent storage.

## ✨ Features

- **📸 Item Management** - Upload photos of clothing items with categorization
- **🎨 Visual Outfit Builder** - Drag and drop interface to create outfits
- **💡 Inspiration Board** - Save outfit ideas from photos
- **💾 Persistent Storage** - PostgreSQL database with cross-browser sync
- **📱 Responsive Design** - Works on desktop and mobile
- **🔄 Real-time Updates** - Changes sync across all browser tabs

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 16+

### Setup (First Time)

```bash
# Clone and navigate to the project
cd outfit-visualizer

# Run the setup script (starts database, installs dependencies, runs migrations)
./scripts/setup.sh
```

The setup script will:
1. Start PostgreSQL in Docker
2. Install backend dependencies  
3. Create database schema
4. Start the backend server
5. Open the app in your browser

### Daily Usage

```bash
# Start services
./scripts/start.sh

# Stop services  
./scripts/stop.sh
```

Then open `index.html` in your browser.

## 🏗️ Architecture

### Frontend
- **Vanilla JavaScript** - No frameworks, fast and lightweight
- **Drag & Drop API** - Native browser drag and drop
- **Responsive CSS** - Clean, minimal design
- **Real-time API** - Communicates with backend REST API

### Backend  
- **Node.js + Express** - RESTful API server
- **PostgreSQL** - Persistent database storage
- **Multer** - File upload handling
- **Docker** - Containerized database

### Database Schema
```sql
- users (for future multi-user support)
- items (clothing items with categories)  
- outfits (saved outfit collections)
- outfit_items (items positioned in outfits)
- inspiration (inspiration images)
```

## 📡 API Endpoints

### Items
- `GET /api/items` - Get all items (optional ?category filter)
- `POST /api/items` - Upload new item (multipart/form-data)
- `PUT /api/items/:id` - Update item details
- `DELETE /api/items/:id` - Delete item

### Outfits
- `GET /api/outfits` - Get all outfits with positioned items
- `POST /api/outfits` - Create outfit with item positions
- `PUT /api/outfits/:id` - Update outfit name
- `DELETE /api/outfits/:id` - Delete outfit

### Inspiration
- `GET /api/inspiration` - Get all inspiration images
- `POST /api/inspiration` - Upload inspiration image
- `DELETE /api/inspiration/:id` - Delete inspiration

## 📂 Project Structure

```
outfit-visualizer/
├── index.html              # Main frontend app
├── styles.css              # All styling  
├── script.js               # App logic & state management
├── api.js                  # API service layer
├── docker-compose.yml      # PostgreSQL container setup
├── backend/                # Express API server
│   ├── server.js           # Main server file
│   ├── routes/             # API endpoints
│   ├── config/             # Database config
│   ├── middleware/         # Upload & auth middleware
│   └── schema.sql          # Database schema
├── scripts/                # Helper scripts
│   ├── setup.sh            # First-time setup
│   ├── start.sh            # Start services
│   └── stop.sh             # Stop services
└── tests/                  # Jest test suite
```

## 🎮 Usage

### Adding Items
1. Click "Add Item" in the My Closet section
2. Upload a photo, enter name, and select category
3. Item appears in your closet immediately

### Creating Outfits  
1. Go to "Outfit Builder"
2. Drag items from sidebar to the canvas
3. Position items by dragging them around
4. Click "Save Outfit" to store with a name

### Categories
- **Tops** - Shirts, blouses, sweaters
- **Bottoms** - Pants, jeans, skirts  
- **Shoes** - All footwear
- **Accessories** - Belts, jewelry, bags
- **Outerwear** - Jackets, coats

### Inspiration
- Upload photos of outfit ideas you find online
- View them in the Inspiration section for reference

## 🛠️ Development

### Running Tests
```bash
cd outfit-visualizer
npm test                # Run once
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Backend Development
```bash
cd backend
npm run dev            # Start with nodemon auto-reload
npm run migrate        # Run database migrations
```

### Database Management
- **pgAdmin**: http://localhost:8080
  - Email: admin@outfitvisualizer.com  
  - Password: admin123
- **Direct connection**: localhost:5432
  - Database: outfit_visualizer
  - User: outfit_user
  - Password: outfit_password

## 🔒 Data Storage

- **Images**: Stored in `backend/uploads/` directory
- **Metadata**: PostgreSQL database with full ACID compliance
- **Persistence**: All data survives browser restarts and works across devices
- **Backup**: Docker volumes ensure data persistence

## 🚧 Future Enhancements

- [ ] User authentication & multi-user support
- [ ] Weather integration for outfit suggestions
- [ ] Calendar integration for outfit scheduling  
- [ ] Social sharing of outfits
- [ ] AI-powered outfit recommendations
- [ ] Mobile app with camera integration
- [ ] Cloud storage for images (AWS S3)

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres

# View database logs  
docker-compose logs postgres
```

### Backend Issues
```bash
# Check backend logs
cd backend
npm run dev

# Verify environment variables
cat .env
```

### Frontend Issues
- Make sure backend is running on http://localhost:3001
- Check browser console for API errors
- Verify CORS settings in backend

## 📝 License

MIT License - feel free to use this project as inspiration for your own outfit planning apps!