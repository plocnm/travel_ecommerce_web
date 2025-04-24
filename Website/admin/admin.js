// DOM Elements
const tourForm = document.getElementById('tourForm');
const userTable = document.getElementById('userTable');
const orderTable = document.getElementById('orderTable');

// Tour management functions
async function loadTours() {
    try {
        showLoadingSpinner();
        const response = await fetch('http://localhost:5000/api/tours');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tours = await response.json();
        displayTours(tours);
    } catch (error) {
        showError('Failed to load tours: ' + error.message);
    } finally {
        hideLoadingSpinner();
    }
}

function displayTours(tours) {
    const tableBody = document.getElementById('toursTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    tours.forEach(tour => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tour.name}</td>
            <td>${tour.destination}</td>
            <td>${tour.duration ? `${tour.duration.days}D/${tour.duration.nights}N` : 'N/A'}</td>
            <td>${formatPrice(tour.price)}</td>
            <td>${tour.status}</td>
            <td>${tour.currentParticipants}/${tour.maxParticipants}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editTour('${tour._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="showDeleteConfirmation('${tour._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function searchTours(searchTerm) {
    try {
        showLoadingSpinner();
        const response = await fetch(`http://localhost:5000/api/tours?search=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tours = await response.json();
        displayTours(tours);
    } catch (error) {
        showError('Failed to search tours: ' + error.message);
    } finally {
        hideLoadingSpinner();
    }
}

async function editTour(tourId) {
    try {
        const response = await fetch(`http://localhost:5000/api/tours/${tourId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tour = await response.json();
        showTourModal(tour);
    } catch (error) {
        showError('Failed to load tour details: ' + error.message);
    }
}

// Add new tour
function showAddTourForm() {
    const modal = document.getElementById('tourModal');
    if (modal) {
        // Reset form
        document.getElementById('tourForm').reset();
        document.getElementById('tourModalTitle').textContent = 'Add New Tour';
        modal.style.display = 'block';
    }
}

// Show tour modal for edit
function showTourModal(tour = null) {
    const modal = document.getElementById('tourModal');
    const form = document.getElementById('tourForm');
    
    if (modal && form) {
        document.getElementById('tourModalTitle').textContent = tour ? 'Edit Tour' : 'Add New Tour';
        
        if (tour) {
            // Populate form with tour data
            form.elements['tourName'].value = tour.name;
            form.elements['destination'].value = tour.destination;
            form.elements['durationDays'].value = tour.duration?.days || '';
            form.elements['durationNights'].value = tour.duration?.nights || '';
            form.elements['price'].value = tour.price;
            form.elements['maxParticipants'].value = tour.maxParticipants;
            form.elements['description'].value = tour.description;
            form.elements['status'].value = tour.status;
            form.dataset.tourId = tour._id;
        } else {
            form.reset();
            delete form.dataset.tourId;
        }
        
        modal.style.display = 'block';
    }
}

// Close tour modal
function closeTourModal() {
    const modal = document.getElementById('tourModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle tour form submission
async function handleTourSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const tourId = form.dataset.tourId;
    const isEdit = !!tourId;
    
    const tourData = {
        name: form.elements['tourName'].value,
        destination: form.elements['destination'].value,
        duration: {
            days: parseInt(form.elements['durationDays'].value),
            nights: parseInt(form.elements['durationNights'].value)
        },
        price: parseFloat(form.elements['price'].value),
        maxParticipants: parseInt(form.elements['maxParticipants'].value),
        description: form.elements['description'].value,
        status: form.elements['status'].value
    };

    try {
        const url = isEdit 
            ? `http://localhost:5000/api/tours/${tourId}`
            : 'http://localhost:5000/api/tours';
            
        const response = await fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tourData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await loadTours(); // Reload tours table
        closeTourModal();
        showSuccess(`Tour successfully ${isEdit ? 'updated' : 'created'}`);
    } catch (error) {
        showError(`Failed to ${isEdit ? 'update' : 'create'} tour: ${error.message}`);
    }
}

// Delete tour
function showDeleteConfirmation(tourId) {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.dataset.tourId = tourId;
        modal.style.display = 'block';
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.style.display = 'none';
        delete modal.dataset.tourId;
    }
}

async function confirmDelete() {
    const modal = document.getElementById('deleteModal');
    const tourId = modal?.dataset.tourId;
    
    if (!tourId) return;
    
    try {
        const response = await fetch(`http://localhost:5000/api/tours/${tourId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await loadTours(); // Reload tours table
        closeDeleteModal();
        showSuccess('Tour successfully deleted');
    } catch (error) {
        showError('Failed to delete tour: ' + error.message);
    }
}

// Success message utility
function showSuccess(message) {
    const alert = document.getElementById('successAlert');
    if (alert) {
        alert.textContent = message;
        alert.classList.remove('d-none');
        setTimeout(() => alert.classList.add('d-none'), 3000);
    }
}

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function showLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.remove('d-none');
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.add('d-none');
}

function showError(message) {
    const alert = document.getElementById('errorAlert');
    if (alert) {
        alert.textContent = message;
        alert.classList.remove('d-none');
        setTimeout(() => alert.classList.add('d-none'), 5000);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTours();
    
    const searchInput = document.getElementById('searchTour');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            searchTours(e.target.value);
        }, 300));
    }
});

// Debounce function to limit API calls during search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}