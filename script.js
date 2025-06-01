let coords = [];
let selectedColor = '#2196F3';
let editingId = null;

const nameInput = document.getElementById('nameInput');
const xInput = document.getElementById('xInput');
const yInput = document.getElementById('yInput');
const zInput = document.getElementById('zInput');
const addBtn = document.getElementById('addBtn');
const coordsList = document.getElementById('coordsList');
const colorOptions = document.querySelectorAll('.color-option');

function loadFromStorage() {
    const saved = localStorage.getItem('minecraftCoords');
    if (saved) {
        coords = JSON.parse(saved);
        renderList();
    }
}

function saveToStorage() {
    localStorage.setItem('minecraftCoords', JSON.stringify(coords));
}

function generateId() {
    return Date.now() + Math.random();
}

nameInput.addEventListener('input', (e) => {
    if (e.target.value.length > 30) {
        e.target.value = e.target.value.slice(0, 30);
    }
});

function limitNumber(input, min, max) {
    input.addEventListener('input', (e) => {
        let value = parseInt(e.target.value);
        if (value > max) {
            e.target.value = max;
        } else if (value < min) {
            e.target.value = min;
        }
    });
}

limitNumber(xInput, -30000000, 30000000);
limitNumber(yInput, -64, 320);
limitNumber(zInput, -30000000, 30000000);

function addCoord() {
    const name = nameInput.value.trim();
    const x = xInput.value.trim();
    const y = yInput.value.trim();
    const z = zInput.value.trim();

    if (!name || !x || !z) {
        alert('Name, X and Z are needed!');
        return;
    }

    const newCoord = {
        id: generateId(),
        name: name,
        x: parseInt(x),
        y: y ? parseInt(y) : null,
        z: parseInt(z),
        color: selectedColor
    };

    coords.push(newCoord);
    saveToStorage();
    renderList();
    clearInputs();
}

function clearInputs() {
    nameInput.value = '';
    xInput.value = '';
    yInput.value = '';
    zInput.value = '';
}

function deleteCoord(id) {
    if (confirm('Are you sure?')) {
        coords = coords.filter(coord => coord.id !== id);
        saveToStorage();
        renderList();
    }
}

function startEdit(id) {
    editingId = id;
    renderList();
}

function cancelEdit() {
    editingId = null;
    renderList();
}

function saveEdit(id) {
    const item = document.querySelector(`[data-id="${id}"]`);
    const nameInput = item.querySelector('.edit-name');
    const xInput = item.querySelector('.edit-x');
    const yInput = item.querySelector('.edit-y');
    const zInput = item.querySelector('.edit-z');

    const name = nameInput.value.trim();
    const x = xInput.value.trim();
    const z = zInput.value.trim();
    const y = yInput.value.trim();

    if (!name || !x || !z) {
        alert('Name, X and Z are needed!');
        return;
    }

    const coordIndex = coords.findIndex(coord => coord.id === id);
    if (coordIndex !== -1) {
        coords[coordIndex].name = name;
        coords[coordIndex].x = parseInt(x);
        coords[coordIndex].y = y ? parseInt(y) : null;
        coords[coordIndex].z = parseInt(z);
    }

    editingId = null;
    saveToStorage();
    renderList();
}

async function copyToClipboard(coord) {
    if (coord.y === null) return;

    const tpCommand = `/tp ${coord.x} ${coord.y} ${coord.z}`;
    
    try {
        await navigator.clipboard.writeText(tpCommand);
        
        // Visual feedback
        const button = document.querySelector(`[data-coord-id="${coord.id}"] .copy-btn`);
        const originalText = button.textContent;
        button.textContent = 'COPIED!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 1500);
        
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = tpCommand;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        alert('Command copied to clipboard!');
    }
}

function renderList() {
    if (coords.length === 0) {
        coordsList.innerHTML = '<div class="empty-state">No coordinates saved yet.</div>';
        return;
    }

    coordsList.innerHTML = coords.map(coord => {
        const isEditing = editingId === coord.id;
        const hasY = coord.y !== null;
        
        if (isEditing) {
            return `
                <div class="coord-item edit-mode" data-id="${coord.id}" style="border-left-color: ${coord.color}">
                    <div class="coord-name-section">
                        <input type="text" class="edit-name" value="${coord.name}">
                    </div>
                    <div class="coord-value">
                        <input type="number" class="edit-x" value="${coord.x}">
                    </div>
                    <div class="coord-value">
                        <input type="number" class="edit-y" value="${coord.y || ''}">
                    </div>
                    <div class="coord-value">
                        <input type="number" class="edit-z" value="${coord.z}">
                    </div>
                    <div class="coord-actions">
                        <button class="save-btn" onclick="saveEdit(${coord.id})">SAVE</button>
                        <button class="cancel-btn" onclick="cancelEdit()">CANCEL</button>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="coord-item" data-id="${coord.id}" data-coord-id="${coord.id}" style="border-left-color: ${coord.color}">
                <div class="coord-name-section">
                    <div class="coord-name">${coord.name}</div>
                    <button class="copy-btn" 
                            onclick="copyToClipboard({id: ${coord.id}, x: ${coord.x}, y: ${coord.y}, z: ${coord.z}})"
                            ${!hasY ? 'disabled' : ''}>
                        ${hasY ? 'COPY /tp' : 'COPY /tp'}
                    </button>
                </div>
                <div class="coord-value">${coord.x}</div>
                <div class="coord-value ${coord.y === null ? 'empty' : ''}">${coord.y !== null ? coord.y : '---'}</div>
                <div class="coord-value">${coord.z}</div>
                <div class="coord-actions">
                    <button class="edit-btn" onclick="startEdit(${coord.id})">EDIT</button>
                    <button class="delete-btn" onclick="deleteCoord(${coord.id})">REMOVE</button>
                </div>
            </div>
        `;
    }).join('');
}

colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        colorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        selectedColor = option.dataset.color;
    });
});

addBtn.addEventListener('click', addCoord);

document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !editingId) {
        addCoord();
    }
});

loadFromStorage();