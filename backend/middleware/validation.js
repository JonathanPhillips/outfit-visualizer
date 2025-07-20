// Validation middleware for API endpoints

const validateItem = (req, res, next) => {
  const { name, category } = req.body;
  const errors = [];

  // Name validation
  if (!name) {
    errors.push('Name is required');
  } else if (typeof name !== 'string') {
    errors.push('Name must be a string');
  } else if (name.trim().length < 1) {
    errors.push('Name cannot be empty');
  } else if (name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  // Category validation
  const validCategories = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];
  if (!category) {
    errors.push('Category is required');
  } else if (!validCategories.includes(category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  next();
};

const validateOutfit = (req, res, next) => {
  const { name, items } = req.body;
  const errors = [];

  // Name validation
  if (!name) {
    errors.push('Name is required');
  } else if (typeof name !== 'string') {
    errors.push('Name must be a string');
  } else if (name.trim().length < 1) {
    errors.push('Name cannot be empty');
  } else if (name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  // Items validation
  if (!items) {
    errors.push('Items array is required');
  } else if (!Array.isArray(items)) {
    errors.push('Items must be an array');
  } else if (items.length === 0) {
    errors.push('At least one item is required');
  } else if (items.length > 20) {
    errors.push('Maximum 20 items allowed per outfit');
  } else {
    // Validate each item
    items.forEach((item, index) => {
      if (!item.id) {
        errors.push(`Item ${index + 1}: id is required`);
      } else if (typeof item.id !== 'string' && typeof item.id !== 'number') {
        errors.push(`Item ${index + 1}: id must be a string or number`);
      }

      if (typeof item.position_x !== 'number') {
        errors.push(`Item ${index + 1}: position_x must be a number`);
      } else if (item.position_x < 0 || item.position_x > 1000) {
        errors.push(`Item ${index + 1}: position_x must be between 0 and 1000`);
      }

      if (typeof item.position_y !== 'number') {
        errors.push(`Item ${index + 1}: position_y must be a number`);
      } else if (item.position_y < 0 || item.position_y > 1000) {
        errors.push(`Item ${index + 1}: position_y must be between 0 and 1000`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  next();
};

const validateInspiration = (req, res, next) => {
  const { title, description } = req.body;
  const errors = [];

  // Title validation (optional but if provided, must be valid)
  if (title && typeof title !== 'string') {
    errors.push('Title must be a string');
  } else if (title && title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  // Description validation (optional but if provided, must be valid)
  if (description && typeof description !== 'string') {
    errors.push('Description must be a string');
  } else if (description && description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  next();
};

// ID parameter validation
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'ID parameter is required' });
  }

  // Check if ID is a valid integer
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({ error: 'ID must be a positive integer' });
  }

  next();
};

// Query parameter validation
const validateQueryParams = (req, res, next) => {
  const { category } = req.query;
  
  if (category) {
    const validCategories = ['all', 'tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      });
    }
  }

  next();
};

module.exports = {
  validateItem,
  validateOutfit,
  validateInspiration,
  validateId,
  validateQueryParams
};