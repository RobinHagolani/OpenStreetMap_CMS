// Initialize the map
const map = L.map('map').setView([53.5511, 9.9937], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Variables to track temporary states
let tempMarker = null;
let editingMarkerId = null;

// Function to add markers to the map
function addMarkerToMap(lat, lng, id, name = '', description = '') {
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`
        <div class="box">
            <p class="title is-6">${name || 'No Title'}</p>
            <p class="subtitle is-7">${description || 'No Description'}</p>
            <button class="button is-primary is-small" onclick="openEditModal(${id}, '${name}', '${description}', ${lat}, ${lng})">Edit</button>
            <button class="button is-danger is-small" onclick="openDeleteModal(${id})">Delete</button>
        </div>
    `);
    marker.bindTooltip(`${name || 'No Title'}`);
}

// Handle map clicks to add a new pin
map.on('click', function (e) {
    if (tempMarker) {
        map.removeLayer(tempMarker);
    }
    tempMarker = L.marker(e.latlng).addTo(map);
    openPinModal(e.latlng.lat, e.latlng.lng);
});

// Open modal for adding or editing pins
function openPinModal(lat, lng) {
    editingMarkerId = null; // Reset editing state
    document.getElementById('pin-name').value = '';
    document.getElementById('pin-description').value = '';
    document.getElementById('save-pin').onclick = function () {
        savePin(lat, lng);
    };
    document.getElementById('pin-modal').classList.add('is-active');
}

// Save or edit a pin
function savePin(lat, lng) {
    const name = document.getElementById('pin-name').value.trim();
    const description = document.getElementById('pin-description').value.trim();

    if (!name || !description) {
        alert('Name and description are required.');
        return;
    }

    const payload = { lat, lng, name, description };
    const url = editingMarkerId ? `/edit-pin/${editingMarkerId}` : '/add-pin';
    const method = editingMarkerId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json(); // Expect JSON response from the server
        })
        .then(data => {
            showToast(data.message, 'is-success');
            closePinModal(); // Close the modal
            location.reload(); // Refresh the map to reflect changes
        })
        .catch(err => {
            console.error('Error saving pin:', err);
            showToast('Failed to save pin. Please try again.', 'is-danger');
        });
}


// Close the modal
function closePinModal() {
    if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }
    document.getElementById('pin-modal').classList.remove('is-active');
}

// Open modal for editing an existing pin
function openEditModal(id, name, description, lat, lng) {
    editingMarkerId = id;
    document.getElementById('pin-name').value = name;
    document.getElementById('pin-description').value = description;
    document.getElementById('save-pin').onclick = function () {
        savePin(lat, lng);
    };
    document.getElementById('pin-modal').classList.add('is-active');
}

// Open confirmation modal for deleting a pin
function openDeleteModal(id) {
    document.getElementById('delete-confirmation-modal').classList.add('is-active');
    document.getElementById('confirm-delete').onclick = function () {
        deletePin(id);
    };
}

// Delete a pin
function deletePin(id) {
    fetch(`/delete-pin/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete pin.');
            showToast('Pin deleted successfully!', 'is-success');
            location.reload(); // Refresh the map to remove deleted pin
        })
        .catch(err => {
            console.error('Error deleting pin:', err);
            showToast('Failed to delete pin.', 'is-danger');
        });
}

// Fetch and render existing pins
fetch('/api/pinpoints')
    .then(response => response.json())
    .then(data => {
        data.forEach(pin => {
            addMarkerToMap(pin.latitude, pin.longitude, pin.id, pin.city, pin.description);
        });
    })
    .catch(err => console.error('Error fetching pins:', err));

// Toast notification function
function showToast(message, type) {
    const toast = document.getElementById('feedback-toast');
    toast.textContent = message;
    toast.className = `notification ${type}`;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}
