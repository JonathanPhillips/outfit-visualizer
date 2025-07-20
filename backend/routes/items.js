const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { upload, handleUploadError } = require('../middleware/upload');
const { validateItem, validateId, validateQueryParams } = require('../middleware/validation');

// Get all items
router.get('/', validateQueryParams, async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM items WHERE user_id = 1 ORDER BY created_at DESC';
    let params = [];

    if (category && category !== 'all') {
      query = 'SELECT * FROM items WHERE user_id = 1 AND category = $1 ORDER BY created_at DESC';
      params = [category];
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get single item
router.get('/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM items WHERE id = $1 AND user_id = 1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Create new item
router.post('/', upload.single('image'), validateItem, async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    const result = await db.query(
      'INSERT INTO items (user_id, name, category, image_url, image_filename) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [1, name, category, imageUrl, req.file.filename]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update item
router.put('/:id', validateId, validateItem, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const validCategories = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const result = await db.query(
      'UPDATE items SET name = $1, category = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = 1 RETURNING *',
      [name, category, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item
router.delete('/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM items WHERE id = $1 AND user_id = 1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // TODO: Delete associated image file from disk
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;