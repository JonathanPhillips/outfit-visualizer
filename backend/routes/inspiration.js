const express = require('express');
const router = express.Router();
const db = require('../config/database');
const upload = require('../middleware/upload');

// Get all inspiration images
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM inspiration WHERE user_id = 1 ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inspiration:', error);
    res.status(500).json({ error: 'Failed to fetch inspiration' });
  }
});

// Get single inspiration
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM inspiration WHERE id = $1 AND user_id = 1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspiration not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching inspiration:', error);
    res.status(500).json({ error: 'Failed to fetch inspiration' });
  }
});

// Create new inspiration
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    const result = await db.query(
      'INSERT INTO inspiration (user_id, image_url, image_filename, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [1, imageUrl, req.file.filename, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating inspiration:', error);
    res.status(500).json({ error: 'Failed to create inspiration' });
  }
});

// Update inspiration
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const result = await db.query(
      'UPDATE inspiration SET description = $1 WHERE id = $2 AND user_id = 1 RETURNING *',
      [description || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspiration not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating inspiration:', error);
    res.status(500).json({ error: 'Failed to update inspiration' });
  }
});

// Delete inspiration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM inspiration WHERE id = $1 AND user_id = 1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspiration not found' });
    }

    // TODO: Delete associated image file from disk
    res.json({ message: 'Inspiration deleted successfully' });
  } catch (error) {
    console.error('Error deleting inspiration:', error);
    res.status(500).json({ error: 'Failed to delete inspiration' });
  }
});

module.exports = router;