const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all outfits
router.get('/', async (req, res) => {
  try {
    const outfitsQuery = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            CASE WHEN oi.id IS NOT NULL THEN
              json_build_object(
                'id', i.id,
                'name', i.name,
                'category', i.category,
                'image_url', i.image_url,
                'position_x', oi.position_x,
                'position_y', oi.position_y
              )
            END
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) as items
      FROM outfits o
      LEFT JOIN outfit_items oi ON o.id = oi.outfit_id
      LEFT JOIN items i ON oi.item_id = i.id
      WHERE o.user_id = 1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    
    const result = await db.query(outfitsQuery);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching outfits:', error);
    res.status(500).json({ error: 'Failed to fetch outfits' });
  }
});

// Get single outfit
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const outfitQuery = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            CASE WHEN oi.id IS NOT NULL THEN
              json_build_object(
                'id', i.id,
                'name', i.name,
                'category', i.category,
                'image_url', i.image_url,
                'position_x', oi.position_x,
                'position_y', oi.position_y
              )
            END
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) as items
      FROM outfits o
      LEFT JOIN outfit_items oi ON o.id = oi.outfit_id
      LEFT JOIN items i ON oi.item_id = i.id
      WHERE o.id = $1 AND o.user_id = 1
      GROUP BY o.id
    `;
    
    const result = await db.query(outfitQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching outfit:', error);
    res.status(500).json({ error: 'Failed to fetch outfit' });
  }
});

// Create new outfit
router.post('/', async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { name, items } = req.body;
    
    if (!name || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Name and items array are required' });
    }

    // Create the outfit
    const outfitResult = await client.query(
      'INSERT INTO outfits (user_id, name) VALUES ($1, $2) RETURNING *',
      [1, name]
    );
    
    const outfit = outfitResult.rows[0];

    // Add items to the outfit
    for (const item of items) {
      if (!item.id || typeof item.position_x !== 'number' || typeof item.position_y !== 'number') {
        throw new Error('Each item must have id, position_x, and position_y');
      }
      
      await client.query(
        'INSERT INTO outfit_items (outfit_id, item_id, position_x, position_y) VALUES ($1, $2, $3, $4)',
        [outfit.id, item.id, item.position_x, item.position_y]
      );
    }

    await client.query('COMMIT');
    
    // Fetch the complete outfit with items
    const completeOutfitQuery = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id,
              'name', i.name,
              'category', i.category,
              'image_url', i.image_url,
              'position_x', oi.position_x,
              'position_y', oi.position_y
            )
          ),
          '[]'::json
        ) as items
      FROM outfits o
      LEFT JOIN outfit_items oi ON o.id = oi.outfit_id
      LEFT JOIN items i ON oi.item_id = i.id
      WHERE o.id = $1
      GROUP BY o.id
    `;
    
    const completeResult = await client.query(completeOutfitQuery, [outfit.id]);
    
    res.status(201).json(completeResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating outfit:', error);
    res.status(500).json({ error: 'Failed to create outfit' });
  } finally {
    client.release();
  }
});

// Update outfit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await db.query(
      'UPDATE outfits SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = 1 RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating outfit:', error);
    res.status(500).json({ error: 'Failed to update outfit' });
  }
});

// Delete outfit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM outfits WHERE id = $1 AND user_id = 1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    res.json({ message: 'Outfit deleted successfully' });
  } catch (error) {
    console.error('Error deleting outfit:', error);
    res.status(500).json({ error: 'Failed to delete outfit' });
  }
});

module.exports = router;