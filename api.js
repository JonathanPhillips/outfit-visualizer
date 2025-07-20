// API Service for Outfit Visualizer
const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Don't set Content-Type for FormData (multipart uploads)
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Items API
  async getItems(category = null) {
    const query = category && category !== 'all' ? `?category=${category}` : '';
    return this.request(`/items${query}`);
  }

  async getItem(id) {
    return this.request(`/items/${id}`);
  }

  async createItem(formData) {
    return this.request('/items', {
      method: 'POST',
      body: formData,
    });
  }

  async updateItem(id, data) {
    return this.request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id) {
    return this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Outfits API
  async getOutfits() {
    return this.request('/outfits');
  }

  async getOutfit(id) {
    return this.request(`/outfits/${id}`);
  }

  async createOutfit(data) {
    return this.request('/outfits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOutfit(id, data) {
    return this.request(`/outfits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOutfit(id) {
    return this.request(`/outfits/${id}`, {
      method: 'DELETE',
    });
  }

  // Inspiration API
  async getInspiration() {
    return this.request('/inspiration');
  }

  async getInspirationItem(id) {
    return this.request(`/inspiration/${id}`);
  }

  async createInspiration(formData) {
    return this.request('/inspiration', {
      method: 'POST',
      body: formData,
    });
  }

  async updateInspiration(id, data) {
    return this.request(`/inspiration/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInspiration(id) {
    return this.request(`/inspiration/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health', { method: 'GET' });
  }
}

// Create global instance
const api = new ApiService();