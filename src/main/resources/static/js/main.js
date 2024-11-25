const map = L.map('map').setView([53.5511, 9.9937], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Utility function to add markers with Edit/Delete functionality
function addMarkerToMap(lat, lng, id, name = '', description = '') {
    const marker = L.marker([lat, lng]).addTo(map);
    let popupContent = `
        <strong>${name}</strong><br>${description}
        <br><button onclick="window.editPin(${id}, '${name}', '${description}', ${lat}, ${lng})">Edit</button>
        <button onclick="window.deletePin(${id})">Delete</button>
    `;
    marker.bindPopup(popupContent);
    return marker;
}

// Fetch pinpoints from the API
fetch('/api/pinpoints')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        data.forEach(pinPoint => {
            addMarkerToMap(pinPoint.lat, pinPoint.lng, pinPoint.id, pinPoint.name, pinPoint.description);
        });
    })
    .catch(error => console.error('Error fetching pinpoints:', error.message));

let tempMarker;
map.on('click', function (e) {
    if (tempMarker) { map.removeLayer(tempMarker); }
    tempMarker = addMarkerToMap(e.latlng.lat, e.latlng.lng);

    const form = document.getElementById('pin-form');
    form.style.display = 'block';
    form.style.left = `${e.originalEvent.pageX}px`;
    form.style.top = `${e.originalEvent.pageY}px`;

    document.getElementById('save-pin').onclick = function () {
        savePin(e.latlng.lat, e.latlng.lng);
    };

    document.getElementById('cancel-pin').onclick = function () {
        map.removeLayer(tempMarker);
        form.style.display = 'none';
    };
});

function savePin(lat, lng) {
    const name = document.getElementById('pin-name').value;
    const description = document.getElementById('pin-description').value;

    const pinData = { lat, lng, name, description };

    fetch('/add-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pinData),
    })
        .then(response => {
            if (!response.ok) throw new Error('Error saving pin.');
            return response.text();
        })
        .then(() => {
            addMarkerToMap(lat, lng, null, name, description); // New marker won't have an ID until refreshed
            resetPinForm();
        })
        .catch(error => console.error('Error saving pin:', error.message));
}

function resetPinForm() {
    const form = document.getElementById('pin-form');
    form.style.display = 'none';
    document.getElementById('pin-name').value = '';
    document.getElementById('pin-description').value = '';
}

// Make functions globally accessible
window.editPin = function (id, name, description, lat, lng) {
    const newName = prompt('Enter new name:', name);
    const newDescription = prompt('Enter new description:', description);
    if (newName && newDescription) {
        fetch(`/edit-pin/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, description: newDescription }),
        })
            .then(response => {
                if (!response.ok) throw new Error('Error editing pin.');
                alert('Pin updated successfully.');
                location.reload();
            })
            .catch(error => console.error('Error editing pin:', error.message));
    }
};

window.deletePin = function (id) {
    if (confirm('Are you sure you want to delete this pin?')) {
        fetch(`/delete-pin/${id}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) throw new Error('Error deleting pin.');
                alert('Pin deleted successfully.');
                location.reload();
            })
            .catch(error => console.error('Error deleting pin:', error.message));
    }
};
