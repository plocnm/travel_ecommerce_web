// DOM Elements
const tourForm = document.getElementById('tourForm');
const userTable = document.getElementById('userTable');
const orderTable = document.getElementById('orderTable');

// Tour Management Functions
async function loadTours() {
    try {
        const response = await fetch('/api/tours');
        const tours = await response.json();
        displayTours(tours);
    } catch (error) {
        showAlert('Error loading tours', 'error');
    }
}

async function addTour(tourData) {
    try {
        const response = await fetch('/api/tours', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tourData)
        });
        if (response.ok) {
            showAlert('Tour added successfully', 'success');
            loadTours();
        }
    } catch (error) {
        showAlert('Error adding tour', 'error');
    }
}

async function updateTour(tourId, tourData) {
    try {
        const response = await fetch(`/api/tours/${tourId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tourData)
        });
        if (response.ok) {
            showAlert('Tour updated successfully', 'success');
            loadTours();
        }
    } catch (error) {
        showAlert('Error updating tour', 'error');
    }
}

async function deleteTour(tourId) {
    if (confirm('Are you sure you want to delete this tour?')) {
        try {
            const response = await fetch(`/api/tours/${tourId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                showAlert('Tour deleted successfully', 'success');
                loadTours();
            }
        } catch (error) {
            showAlert('Error deleting tour', 'error');
        }
    }
}

// User Management Functions
async function updateUserRole(userId, newRole) {
    try {
        const response = await fetch(`/api/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
        });
        if (response.ok) {
            showAlert('User role updated successfully', 'success');
        }
    } catch (error) {
        showAlert('Error updating user role', 'error');
    }
}

async function updateUserStatus(userId, newStatus) {
    try {
        const response = await fetch(`/api/users/${userId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            showAlert('User status updated successfully', 'success');
        }
    } catch (error) {
        showAlert('Error updating user status', 'error');
    }
}

// Order Management Functions
async function changeOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            showAlert('Order status updated successfully', 'success');
        }
    } catch (error) {
        showAlert('Error updating order status', 'error');
    }
}

// Utility Functions
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.prepend(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTours();

    // Tour form submission
    tourForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(tourForm);
        const tourData = Object.fromEntries(formData);
        if (tourData.id) {
            updateTour(tourData.id, tourData);
        } else {
            addTour(tourData);
        }
    });

    // User role/status change handlers
    userTable?.addEventListener('change', (e) => {
        if (e.target.matches('.role-select')) {
            const userId = e.target.dataset.userId;
            updateUserRole(userId, e.target.value);
        }
        if (e.target.matches('.status-select')) {
            const userId = e.target.dataset.userId;
            updateUserStatus(userId, e.target.value);
        }
    });

    // Order status change handler
    orderTable?.addEventListener('change', (e) => {
        if (e.target.matches('.order-status')) {
            const orderId = e.target.dataset.orderId;
            changeOrderStatus(orderId, e.target.value);
        }
    });

    // Delete tour handler
    document.addEventListener('click', (e) => {
        if (e.target.matches('.delete-tour')) {
            const tourId = e.target.dataset.tourId;
            deleteTour(tourId);
        }
    });
});