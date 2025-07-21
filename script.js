// App State
const AppState = {
    items: [],
    outfits: [],
    inspiration: [],
    currentSection: 'inventory',
    currentFilter: 'all',
    draggedItem: null,
    canvasItems: []
};

// Local Storage Keys
const STORAGE_KEYS = {
    ITEMS: 'outfit_visualizer_items',
    OUTFITS: 'outfit_visualizer_outfits',
    INSPIRATION: 'outfit_visualizer_inspiration'
};

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const addItemBtn = document.getElementById('add-item-btn');
const addItemModal = document.getElementById('add-item-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelAddBtn = document.getElementById('cancel-add');
const addItemForm = document.getElementById('add-item-form');
const itemsGrid = document.getElementById('items-grid');
const filterButtons = document.querySelectorAll('.filter-btn');
const sidebarItems = document.getElementById('sidebar-items');
const outfitCanvas = document.getElementById('outfit-canvas');
const saveOutfitBtn = document.getElementById('save-outfit-btn');
const outfitsGrid = document.getElementById('outfits-grid');
const inspirationGrid = document.getElementById('inspiration-grid');
const addInspirationBtn = document.getElementById('add-inspiration-btn');

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App initializing...');
    await loadFromAPI();
    setupEventListeners();
    renderCurrentSection();
    console.log('App initialized, AppState:', AppState);
});

// Event Listeners
function setupEventListeners() {
    // Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });
    
    // Modal
    addItemBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', () => closeModal());
    cancelAddBtn.addEventListener('click', () => closeModal());
    
    // Form submission
    addItemForm.addEventListener('submit', handleAddItem);
    
    // Filters
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => filterItems(btn.dataset.category));
    });
    
    // Outfit saving
    saveOutfitBtn.addEventListener('click', saveCurrentOutfit);
    
    // Inspiration
    addInspirationBtn.addEventListener('click', handleAddInspiration);
    
    // Canvas drop events
    outfitCanvas.addEventListener('dragover', handleDragOver);
    outfitCanvas.addEventListener('drop', handleDrop);
    outfitCanvas.addEventListener('dragenter', handleDragEnter);
    outfitCanvas.addEventListener('dragleave', handleDragLeave);
    
    // Modal close on backdrop click
    addItemModal.addEventListener('click', (e) => {
        if (e.target === addItemModal) closeModal();
    });
    
    // Inspiration modal
    const inspirationModal = document.getElementById('inspiration-modal');
    const closeInspirationModalBtn = document.getElementById('close-inspiration-modal');
    
    closeInspirationModalBtn.addEventListener('click', closeInspirationModal);
    inspirationModal.addEventListener('click', (e) => {
        if (e.target === inspirationModal) closeInspirationModal();
    });
}

// Navigation
function switchSection(sectionId) {
    AppState.currentSection = sectionId;
    
    // Update nav buttons
    navButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    
    // Update sections
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    renderCurrentSection();
}

function renderCurrentSection() {
    switch(AppState.currentSection) {
        case 'inventory':
            renderInventory();
            break;
        case 'builder':
            renderBuilder();
            break;
        case 'inspiration':
            renderInspiration();
            break;
        case 'saved':
            renderSavedOutfits();
            break;
    }
}

// Modal Management
function openModal() {
    addItemModal.classList.add('active');
}

function closeModal() {
    addItemModal.classList.remove('active');
    addItemForm.reset();
}

// Inspiration Modal Functions
function openInspirationModal(imageUrl, description) {
    const modal = document.getElementById('inspiration-modal');
    const modalImage = document.getElementById('inspiration-modal-image');
    const modalDescription = document.getElementById('inspiration-modal-description');
    
    modalImage.src = imageUrl;
    modalDescription.textContent = description || '';
    modalDescription.style.display = description ? 'block' : 'none';
    
    modal.classList.add('active');
}

function closeInspirationModal() {
    const modal = document.getElementById('inspiration-modal');
    modal.classList.remove('active');
}

// Item Management
async function handleAddItem(e) {
    console.log('handleAddItem called');
    e.preventDefault();
    
    const formData = new FormData(addItemForm);
    const imageFile = formData.get('image');
    const name = formData.get('name');
    const category = formData.get('category');
    
    console.log('Form data:', { imageFile, name, category });
    console.log('FormData keys:', Array.from(formData.keys()));
    console.log('FormData values:', Array.from(formData.values()));
    console.log('Image file exists:', !!imageFile);
    console.log('Image file size:', imageFile ? imageFile.size : 'no file');
    console.log('Name value:', name);
    console.log('Category value:', category);
    
    if (imageFile && name && category) {
        try {
            console.log('All fields valid, uploading...');
            showLoading('Adding item...');
            
            const item = await api.createItem(formData);
            console.log('Item created via API:', item);
            
            // Add to local state and re-render
            AppState.items.push(item);
            console.log('AppState.items now has', AppState.items.length, 'items');
            
            // Also refresh all items from API to make sure we're in sync
            try {
                const allItems = await api.getItems();
                AppState.items = allItems;
                console.log('Refreshed items from API, now have:', AppState.items.length, 'items');
            } catch (refreshError) {
                console.warn('Could not refresh items from API:', refreshError);
            }
            
            renderInventory();
            closeModal();
            hideLoading();
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Failed to add item: ' + error.message);
            hideLoading();
        }
    } else {
        console.log('Missing required fields');
        alert('Please fill in all fields and select an image.');
    }
}

function renderInventory() {
    console.log('renderInventory called, AppState.items:', AppState.items.length);
    console.log('currentFilter:', AppState.currentFilter);
    
    const filteredItems = AppState.currentFilter === 'all' 
        ? AppState.items 
        : AppState.items.filter(item => item.category === AppState.currentFilter);
    
    console.log('filteredItems:', filteredItems.length);
    itemsGrid.innerHTML = '';
    
    filteredItems.forEach(item => {
        console.log('Creating card for item:', item.name);
        const itemCard = createItemCard(item);
        itemsGrid.appendChild(itemCard);
    });
}

function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.draggable = true;
    card.dataset.itemId = item.id;
    
    // Use image_url from API or fall back to image for localStorage compatibility
    const imageUrl = item.image_url || item.image;
    const fullImageUrl = imageUrl.startsWith('/uploads/') ? `http://localhost:3001${imageUrl}` : imageUrl;
    
    card.innerHTML = `
        <button class="delete-item-btn" onclick="deleteItem('${item.id}')" title="Delete item">&times;</button>
        <img src="${fullImageUrl}" alt="${item.name}" class="item-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNmNmY2ZjYiLz48dGV4dCB4PSI2MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=='">
        <div class="item-name">${item.name}</div>
        <div class="item-category">${item.category}</div>
    `;
    
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    
    return card;
}

async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    try {
        showLoading('Deleting item...');
        await api.deleteItem(itemId);
        
        // Remove from local state
        AppState.items = AppState.items.filter(item => item.id != itemId);
        renderInventory();
        hideLoading();
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item: ' + error.message);
        hideLoading();
    }
}

async function deleteInspiration(inspirationId) {
    if (!confirm('Are you sure you want to delete this inspiration image?')) {
        return;
    }
    
    try {
        showLoading('Deleting inspiration...');
        await api.deleteInspiration(inspirationId);
        
        // Remove from local state
        AppState.inspiration = AppState.inspiration.filter(inspiration => inspiration.id != inspirationId);
        renderInspiration();
        hideLoading();
    } catch (error) {
        console.error('Error deleting inspiration:', error);
        alert('Failed to delete inspiration: ' + error.message);
        hideLoading();
    }
}

function filterItems(category) {
    AppState.currentFilter = category;
    
    // Update filter buttons
    filterButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    renderInventory();
}

// Drag and Drop
function handleDragStart(e) {
    const itemId = e.target.dataset.itemId;
    AppState.draggedItem = AppState.items.find(item => item.id === itemId);
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'copy';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    AppState.draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
    if (AppState.draggedCanvasItem) {
        e.dataTransfer.dropEffect = 'move';
    } else {
        e.dataTransfer.dropEffect = 'copy';
    }
}

function handleDragEnter(e) {
    e.preventDefault();
    if (AppState.draggedItem || AppState.draggedCanvasItem) {
        outfitCanvas.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (!outfitCanvas.contains(e.relatedTarget)) {
        outfitCanvas.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    outfitCanvas.classList.remove('drag-over');
    
    if (AppState.draggedCanvasItem) {
        // Handle moving canvas items
        handleCanvasDrop(e);
    } else if (AppState.draggedItem) {
        // Handle adding new items to canvas
        const rect = outfitCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        addItemToCanvas(AppState.draggedItem, x, y);
    }
}

function addItemToCanvas(item, x, y) {
    // Remove drop message if it exists
    const dropMessage = outfitCanvas.querySelector('.drop-message');
    if (dropMessage) {
        dropMessage.style.display = 'none';
    }
    
    const canvasItem = document.createElement('div');
    canvasItem.className = 'canvas-item';
    canvasItem.style.left = `${x - 60}px`;
    canvasItem.style.top = `${y - 60}px`;
    canvasItem.dataset.itemId = item.id;
    
    const imageUrl = item.image_url || item.image;
    const fullImageUrl = imageUrl.startsWith('/uploads/') ? `http://localhost:3001${imageUrl}` : imageUrl;
    
    canvasItem.innerHTML = `
        <img src="${fullImageUrl}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNmNmY2ZjYiLz48dGV4dCB4PSI2MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPj88L3RleHQ+PC9zdmc+'">
        <button class="remove-btn" onclick="removeFromCanvas('${item.id}')">&times;</button>
    `;
    
    // Make canvas item draggable within canvas
    canvasItem.draggable = true;
    canvasItem.addEventListener('dragstart', handleCanvasDragStart);
    canvasItem.addEventListener('dragend', handleCanvasDragEnd);
    
    outfitCanvas.appendChild(canvasItem);
    
    // Add to canvas items state
    AppState.canvasItems.push({
        id: item.id,
        x: x - 60,
        y: y - 60,
        item: item
    });
}

function handleCanvasDragStart(e) {
    e.stopPropagation();
    AppState.draggedCanvasItem = e.target.closest('.canvas-item');
    AppState.draggedCanvasItem.classList.add('dragging');
    
    // Store the initial mouse position relative to the element
    const rect = AppState.draggedCanvasItem.getBoundingClientRect();
    AppState.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    
    // Clear any regular dragged item
    AppState.draggedItem = null;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
}

function handleCanvasDragEnd(e) {
    if (AppState.draggedCanvasItem) {
        AppState.draggedCanvasItem.classList.remove('dragging');
        AppState.draggedCanvasItem = null;
        AppState.dragOffset = null;
    }
}

function handleCanvasDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (AppState.draggedCanvasItem) {
        const rect = outfitCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left - AppState.dragOffset.x;
        const y = e.clientY - rect.top - AppState.dragOffset.y;
        
        // Keep item within canvas bounds
        const maxX = outfitCanvas.offsetWidth - 120;
        const maxY = outfitCanvas.offsetHeight - 120;
        const finalX = Math.max(0, Math.min(x, maxX));
        const finalY = Math.max(0, Math.min(y, maxY));
        
        AppState.draggedCanvasItem.style.left = `${finalX}px`;
        AppState.draggedCanvasItem.style.top = `${finalY}px`;
        
        // Update state
        const itemId = AppState.draggedCanvasItem.dataset.itemId;
        const canvasItem = AppState.canvasItems.find(ci => ci.id === itemId);
        if (canvasItem) {
            canvasItem.x = finalX;
            canvasItem.y = finalY;
        }
        
        AppState.draggedCanvasItem.classList.remove('dragging');
        AppState.draggedCanvasItem = null;
        AppState.dragOffset = null;
    }
}

function removeFromCanvas(itemId) {
    const canvasItem = outfitCanvas.querySelector(`[data-item-id="${itemId}"]`);
    if (canvasItem) {
        canvasItem.remove();
    }
    
    // Remove from state
    AppState.canvasItems = AppState.canvasItems.filter(ci => ci.id !== itemId);
    
    // Show drop message if no items left
    if (AppState.canvasItems.length === 0) {
        const dropMessage = outfitCanvas.querySelector('.drop-message');
        if (dropMessage) {
            dropMessage.style.display = 'block';
        }
    }
}

// Builder Section
function renderBuilder() {
    renderSidebarItems();
}

function renderSidebarItems() {
    sidebarItems.innerHTML = '';
    
    AppState.items.forEach(item => {
        const sidebarItem = document.createElement('div');
        sidebarItem.className = 'sidebar-item';
        sidebarItem.draggable = true;
        sidebarItem.dataset.itemId = item.id;
        
        const imageUrl = item.image_url || item.image;
        const fullImageUrl = imageUrl.startsWith('/uploads/') ? `http://localhost:3001${imageUrl}` : imageUrl;
        
        sidebarItem.innerHTML = `
            <img src="${fullImageUrl}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y2ZjZmNiIvPjx0ZXh0IHg9IjIwIiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Pz88L3RleHQ+PC9zdmc+'">
            <div class="sidebar-item-info">
                <div class="sidebar-item-name">${item.name}</div>
                <div class="sidebar-item-category">${item.category}</div>
            </div>
        `;
        
        sidebarItem.addEventListener('dragstart', handleDragStart);
        sidebarItem.addEventListener('dragend', handleDragEnd);
        
        sidebarItems.appendChild(sidebarItem);
    });
}

// Outfit Saving
async function saveCurrentOutfit() {
    if (AppState.canvasItems.length === 0) {
        alert('Please add items to your outfit before saving.');
        return;
    }
    
    const outfitName = prompt('Enter a name for your outfit:');
    if (!outfitName) return;
    
    try {
        showLoading('Saving outfit...');
        
        const outfitData = {
            name: outfitName,
            items: AppState.canvasItems.map(ci => ({
                id: ci.item.id,
                position_x: ci.x,
                position_y: ci.y
            }))
        };
        
        const outfit = await api.createOutfit(outfitData);
        console.log('Outfit created via API:', outfit);
        
        // Add to local state
        AppState.outfits.push(outfit);
        console.log('Total outfits now:', AppState.outfits.length);
        
        // Clear canvas
        AppState.canvasItems = [];
        outfitCanvas.innerHTML = '<p class="drop-message">Drag items here to create your outfit</p>';
        
        hideLoading();
        alert('Outfit saved successfully!');
    } catch (error) {
        console.error('Error saving outfit:', error);
        alert('Failed to save outfit: ' + error.message);
        hideLoading();
    }
}

function renderSavedOutfits() {
    outfitsGrid.innerHTML = '';
    
    AppState.outfits.forEach(outfit => {
        const outfitCard = document.createElement('div');
        outfitCard.className = 'outfit-card';
        
        const previewImages = outfit.items.map(item => {
            const imageUrl = item.image_url || item.image;
            const fullImageUrl = imageUrl.startsWith('/uploads/') ? `http://localhost:3001${imageUrl}` : imageUrl;
            return `<img src="${fullImageUrl}" alt="${item.name}" onerror="this.style.display='none'">`;
        }).join('');
        
        const date = new Date(outfit.created_at || outfit.dateCreated).toLocaleDateString();
        
        outfitCard.innerHTML = `
            <div class="outfit-preview">${previewImages}</div>
            <div class="outfit-info">
                <h3>${outfit.name}</h3>
                <div class="outfit-date">Created: ${date}</div>
            </div>
        `;
        
        outfitCard.addEventListener('click', () => loadOutfit(outfit));
        
        outfitsGrid.appendChild(outfitCard);
    });
}

function loadOutfit(outfit) {
    // Switch to builder section
    switchSection('builder');
    
    // Clear current canvas
    AppState.canvasItems = [];
    outfitCanvas.innerHTML = '';
    
    // Add items to canvas
    outfit.items.forEach(item => {
        const x = item.position_x || item.x || 100;
        const y = item.position_y || item.y || 100;
        addItemToCanvas(item, x, y);
    });
}

// Inspiration
async function handleAddInspiration() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                showLoading('Adding inspiration...');
                
                const formData = new FormData();
                formData.append('image', file);
                
                const inspiration = await api.createInspiration(formData);
                console.log('Inspiration created via API:', inspiration);
                
                AppState.inspiration.push(inspiration);
                renderInspiration();
                hideLoading();
            } catch (error) {
                console.error('Error adding inspiration:', error);
                alert('Failed to add inspiration: ' + error.message);
                hideLoading();
            }
        }
    };
    input.click();
}

function renderInspiration() {
    inspirationGrid.innerHTML = '';
    
    AppState.inspiration.forEach(inspiration => {
        const inspirationCard = document.createElement('div');
        inspirationCard.className = 'inspiration-card';
        
        const imageUrl = inspiration.image_url || inspiration.image;
        const fullImageUrl = imageUrl.startsWith('/uploads/') ? `http://localhost:3001${imageUrl}` : imageUrl;
        
        inspirationCard.innerHTML = `
            <button class="delete-inspiration-btn" onclick="deleteInspiration('${inspiration.id}')" title="Delete inspiration">&times;</button>
            <img src="${fullImageUrl}" alt="Inspiration" class="inspiration-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNmY2ZjYiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW5zcGlyYXRpb248L3RleHQ+PC9zdmc+'">
            ${inspiration.description ? `<div class="inspiration-description">${inspiration.description}</div>` : ''}
        `;
        
        // Add click handler to open full-size image (but not on delete button)
        inspirationCard.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-inspiration-btn')) {
                openInspirationModal(fullImageUrl, inspiration.description);
            }
        });
        
        inspirationGrid.appendChild(inspirationCard);
    });
}

// API Management
async function loadFromAPI() {
    try {
        console.log('Loading data from API...');
        showLoading('Loading your closet...');
        
        // Load all data in parallel
        const [items, outfits, inspiration] = await Promise.all([
            api.getItems(),
            api.getOutfits(),
            api.getInspiration()
        ]);
        
        AppState.items = items;
        AppState.outfits = outfits;
        AppState.inspiration = inspiration;
        
        console.log('Loaded from API:', AppState);
        hideLoading();
    } catch (error) {
        console.error('Error loading from API:', error);
        // Try to continue with empty state
        AppState.items = [];
        AppState.outfits = [];
        AppState.inspiration = [];
        hideLoading();
        
        // Show error message
        alert('Could not connect to server. Please make sure the backend is running on http://localhost:3001');
    }
}

async function refreshItems() {
    try {
        console.log('Manual refresh clicked');
        showLoading('Refreshing items...');
        AppState.items = await api.getItems();
        console.log('Manual refresh got', AppState.items.length, 'items');
        renderInventory();
        hideLoading();
    } catch (error) {
        console.error('Error refreshing items:', error);
        hideLoading();
        alert('Failed to refresh items: ' + error.message);
    }
}

async function refreshOutfits() {
    try {
        AppState.outfits = await api.getOutfits();
        renderSavedOutfits();
    } catch (error) {
        console.error('Error refreshing outfits:', error);
    }
}

async function refreshInspiration() {
    try {
        AppState.inspiration = await api.getInspiration();
        renderInspiration();
    } catch (error) {
        console.error('Error refreshing inspiration:', error);
    }
}

// Utility Functions
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function showLoading(message = 'Loading...') {
    // Remove existing loading indicator
    hideLoading();
    
    const loading = document.createElement('div');
    loading.id = 'loading-indicator';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        font-size: 1.2rem;
    `;
    loading.innerHTML = `
        <div style="text-align: center;">
            <div style="margin-bottom: 1rem;">⏳</div>
            <div>${message}</div>
        </div>
    `;
    
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loading-indicator');
    if (loading) {
        loading.remove();
    }
}

// Debug function
function debugStorage() {
    console.log('=== STORAGE DEBUG ===');
    console.log('Current AppState:', AppState);
    console.log('localStorage items:', localStorage.getItem(STORAGE_KEYS.ITEMS));
    console.log('localStorage outfits:', localStorage.getItem(STORAGE_KEYS.OUTFITS));
    console.log('localStorage inspiration:', localStorage.getItem(STORAGE_KEYS.INSPIRATION));
    
    // Show in alert for easy viewing
    alert(`
Storage Debug:
Items: ${AppState.items.length} in memory, ${localStorage.getItem(STORAGE_KEYS.ITEMS) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS)).length : 0} in storage
Outfits: ${AppState.outfits.length} in memory, ${localStorage.getItem(STORAGE_KEYS.OUTFITS) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.OUTFITS)).length : 0} in storage
Inspiration: ${AppState.inspiration.length} in memory, ${localStorage.getItem(STORAGE_KEYS.INSPIRATION) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.INSPIRATION)).length : 0} in storage
    `);
}