// DOM Elements
const tourForm = document.getElementById('tourForm');
const userTable = document.getElementById('userTable');
const orderTable = document.getElementById('orderTable');

let currentEditingTourId = null;

// Tour management functions
async function loadTours() {
    const toursTableBody = document.getElementById('toursTableBody');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorAlert = document.getElementById('errorAlert');
    const searchTour = document.getElementById('searchTour').value;

    if (!toursTableBody || !loadingSpinner || !errorAlert) {
        console.error('Required HTML elements not found for loading tours.');
        return;
    }

    toursTableBody.innerHTML = ''; // Clear existing rows
    loadingSpinner.classList.remove('hidden');
    errorAlert.classList.add('hidden');

    try {
        let url = 'http://localhost:5500/api/tours';
        const params = new URLSearchParams();
        if (searchTour) params.append('search', searchTour);
        // Add other filters like status, price if needed
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tours = await response.json();

        if (tours.length === 0) {
            toursTableBody.innerHTML = '<tr><td colspan="9">No tours found.</td></tr>';
        } else {
            tours.forEach(tour => {
                const row = toursTableBody.insertRow();
                row.innerHTML = `
                    <td>${tour.name}</td>
                    <td>${tour.destination}</td>
                    <td>${tour.duration.days}D / ${tour.duration.nights}N</td>
                    <td>${tour.price.toLocaleString()}</td>
                    <td>${tour.maxParticipants}</td>
                    <td>${tour.currentParticipants}</td>
                    <td><span class="status-${tour.status.toLowerCase().replace(' ', '-')}">${tour.status}</span></td>
                    <td>${tour.rating || 'N/A'}</td>
                    <td class="actions">
                        <button class="edit-btn" onclick="showEditTourForm('${tour._id}')"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" onclick="showDeleteModal('${tour._id}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
            });
        }
    } catch (error) {
        console.error('Error loading tours:', error);
        errorAlert.textContent = `Failed to load tours: ${error.message}`;
        errorAlert.classList.remove('hidden');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function showAddTourForm() {
    currentEditingTourId = null;
    document.getElementById('modalTitle').textContent = 'Add New Tour';
    document.getElementById('tourForm').reset();
    // Clear specific fields that reset might not handle well for complex inputs
    document.getElementById('included').value = '';
    document.getElementById('excluded').value = '';
    document.getElementById('itinerary').value = '[]'; // Default to empty JSON array
    document.getElementById('images').value = '';
    document.getElementById('departureDates').value = '[]'; // Default to empty JSON array
    document.getElementById('rating').value = '0';

    const tourModal = document.getElementById('tourModal');
    // Reset position before showing
    tourModal.style.left = ''; 
    tourModal.style.top = '';
    // Recenter if it was dragged (we rely on CSS for initial centering now with margin:auto)
    // but if position is relative/absolute from dragging, margin:auto might not work as expected without resetting top/left.
    tourModal.style.display = 'block';
}

async function showEditTourForm(tourId) {
    currentEditingTourId = tourId;
    document.getElementById('modalTitle').textContent = 'Edit Tour';
    const errorAlert = document.getElementById('errorAlert');
    errorAlert.classList.add('hidden');

    // Reset position before showing and fetching data
    const tourModal = document.getElementById('tourModal');
    tourModal.style.left = '';
    tourModal.style.top = '';

    try {
        const response = await fetch(`http://localhost:5500/api/tours/${tourId}`, {
             headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tour = await response.json();

        document.getElementById('tourName').value = tour.name;
        document.getElementById('description').value = tour.description;
        document.getElementById('destination').value = tour.destination;
        document.getElementById('durationDays').value = tour.duration.days;
        document.getElementById('durationNights').value = tour.duration.nights;
        document.getElementById('price').value = tour.price;
        document.getElementById('included').value = tour.included ? tour.included.join(', ') : '';
        document.getElementById('excluded').value = tour.excluded ? tour.excluded.join(', ') : '';
        document.getElementById('itinerary').value = tour.itinerary ? JSON.stringify(tour.itinerary, null, 2) : '[]';
        document.getElementById('images').value = tour.images ? tour.images.join(', ') : '';
        document.getElementById('maxParticipants').value = tour.maxParticipants;
        document.getElementById('departureDates').value = tour.departureDates ? JSON.stringify(tour.departureDates.map(d => ({date: d.date.split('T')[0], available: d.available}) ), null, 2) : '[]';
        document.getElementById('rating').value = tour.rating || 0;
        document.getElementById('status').value = tour.status;

        document.getElementById('tourModal').style.display = 'block';

    } catch (error) {
        console.error('Error fetching tour details for edit:', error);
        errorAlert.textContent = `Failed to load tour for editing: ${error.message}`;
        errorAlert.classList.remove('hidden');
    }
}

function closeTourModal() {
    document.getElementById('tourModal').style.display = 'none';
    document.getElementById('tourForm').reset();
    currentEditingTourId = null;
}

async function handleTourSubmit(event) {
    event.preventDefault();
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    successAlert.classList.add('hidden');
    errorAlert.classList.add('hidden');

    const tourData = {
        name: document.getElementById('tourName').value,
        description: document.getElementById('description').value,
        destination: document.getElementById('destination').value,
        duration: {
            days: parseInt(document.getElementById('durationDays').value),
            nights: parseInt(document.getElementById('durationNights').value)
        },
        price: parseFloat(document.getElementById('price').value),
        included: document.getElementById('included').value.split(',').map(item => item.trim()).filter(item => item),
        excluded: document.getElementById('excluded').value.split(',').map(item => item.trim()).filter(item => item),
        itinerary: JSON.parse(document.getElementById('itinerary').value || '[]'),
        images: document.getElementById('images').value.split(',').map(item => item.trim()).filter(item => item),
        maxParticipants: parseInt(document.getElementById('maxParticipants').value),
        departureDates: JSON.parse(document.getElementById('departureDates').value || '[]'),
        rating: parseFloat(document.getElementById('rating').value || 0),
        status: document.getElementById('status').value
    };

    // Validate JSON fields before submitting
    try {
        if (document.getElementById('itinerary').value) {
            JSON.parse(document.getElementById('itinerary').value);
        }
         if (document.getElementById('departureDates').value) {
            JSON.parse(document.getElementById('departureDates').value);
        }
    } catch (e) {
        errorAlert.textContent = 'Invalid JSON format in Itinerary or Departure Dates.';
        errorAlert.classList.remove('hidden');
        return;
    }

    const method = currentEditingTourId ? 'PUT' : 'POST';
    const url = currentEditingTourId ? `http://localhost:5500/api/tours/${currentEditingTourId}` : 'http://localhost:5500/api/tours';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            },
            body: JSON.stringify(tourData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        successAlert.textContent = `Tour ${currentEditingTourId ? 'updated' : 'added'} successfully!`
        successAlert.classList.remove('hidden');
        closeTourModal();
        loadTours(); // Refresh the table
    } catch (error) {
        console.error('Error submitting tour:', error);
        errorAlert.textContent = `Failed to ${currentEditingTourId ? 'update' : 'add'} tour: ${error.message}`;
        errorAlert.classList.remove('hidden');
    }
}

let tourIdToDelete = null;

function showDeleteModal(tourId) {
    tourIdToDelete = tourId;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    tourIdToDelete = null;
}

async function confirmDelete() {
    if (!tourIdToDelete) return;

    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    successAlert.classList.add('hidden');
    errorAlert.classList.add('hidden');

    try {
        const response = await fetch(`http://localhost:5500/api/tours/${tourIdToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        successAlert.textContent = 'Tour deleted successfully!';
        successAlert.classList.remove('hidden');
        loadTours(); // Refresh the table
    } catch (error) {
        console.error('Error deleting tour:', error);
        errorAlert.textContent = `Failed to delete tour: ${error.message}`;
        errorAlert.classList.remove('hidden');
    } finally {
        closeDeleteModal();
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

// Make modal draggable
function makeModalDraggable(modalElement, dragHandleElement) {
    let offsetX, offsetY, isDragging = false;

    dragHandleElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        // Calculate offset from mouse pointer to top-left corner of modal
        offsetX = e.clientX - modalElement.offsetLeft;
        offsetY = e.clientY - modalElement.offsetTop;
        modalElement.style.cursor = 'grabbing'; // Change cursor to indicate dragging
        // Ensure the modal is positioned absolutely or fixed to allow dragging
        if (getComputedStyle(modalElement).position === 'static') {
            modalElement.style.position = 'relative'; // or 'absolute' or 'fixed' as per your layout
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        // Calculate new position
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        // Optional: Keep modal within viewport bounds
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const modalWidth = modalElement.offsetWidth;
        const modalHeight = modalElement.offsetHeight;

        newX = Math.max(0, Math.min(newX, viewportWidth - modalWidth));
        newY = Math.max(0, Math.min(newY, viewportHeight - modalHeight));

        modalElement.style.left = newX + 'px';
        modalElement.style.top = newY + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            modalElement.style.cursor = 'default'; // Reset cursor
        }
    });

    // Also make the drag handle have a grab cursor on hover
    dragHandleElement.style.cursor = 'grab';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial load of tours is already handled in tours.html
    // Add event listener for search input
    const searchInput = document.getElementById('searchTour');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(loadTours, 300));
    }

    // Initialize draggable modal
    const tourModal = document.getElementById('tourModal');
    if (tourModal) {
        const modalHeader = tourModal.querySelector('.modal-drag-header');
        if (modalHeader) {
            makeModalDraggable(tourModal, modalHeader);
        }
    }
});

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Order Management Functions
async function loadOrders() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    const loadingSpinner = document.getElementById('loadingSpinner'); // Assuming you have a spinner with this ID
    const errorAlert = document.getElementById('errorAlert'); // Assuming you have an error alert with this ID

    if (!ordersTableBody) {
        console.error('ordersTableBody not found');
        return;
    }

    ordersTableBody.innerHTML = ''; // Clear existing rows
    if(loadingSpinner) loadingSpinner.classList.remove('d-none'); // Use d-none if you use Bootstrap for hidden
    if(errorAlert) errorAlert.classList.add('d-none');

    try {
        // FIXME: Update with the correct API endpoint for fetching all orders/bookings
        const response = await fetch('http://localhost:5500/api/bookings', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const orders = await response.json();

        if (orders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="8">No orders found.</td></tr>'; // Colspan should match number of columns
        } else {
            orders.forEach(order => {
                const row = ordersTableBody.insertRow();
                // Ensure user object and name exist, or provide a fallback.
                const customerName = order.user && order.user.name ? order.user.name : (order.user ? order.user : 'N/A'); 
                row.innerHTML = `
                    <td>${order._id}</td>
                    <td>${customerName}</td> 
                    <td>${order.type}</td>
                    <td>${new Date(order.bookingDate).toLocaleDateString()}</td>
                    <td>${formatPrice(order.totalAmount)}</td>
                    <td><span class="status-${order.status ? order.status.toLowerCase().replace(' ', '-') : 'unknown'}">${order.status || 'N/A'}</span></td>
                    <td><span class="payment-status-${order.paymentStatus ? order.paymentStatus.toLowerCase().replace(' ', '-') : 'unknown'}">${order.paymentStatus || 'N/A'}</span></td>
                    <td class="actions">
                        <button class="btn btn-sm btn-primary me-2" onclick="editOrder('${order._id}')" title="Edit Order">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order._id}')" title="Delete Order">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
            });
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        if(errorAlert) {
            errorAlert.textContent = `Failed to load orders: ${error.message}`;
            errorAlert.classList.remove('d-none');
        }
    } finally {
        if(loadingSpinner) loadingSpinner.classList.add('d-none');
    }
}

async function editOrder(orderId) {
    console.log('Attempting to edit order:', orderId);
    showLoadingSpinner();
    try {
        const response = await fetch(`http://localhost:5500/api/bookings/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const order = await response.json();

        document.getElementById('orderIdInput').value = order._id;
        document.getElementById('statusSelect').value = order.status;
        document.getElementById('paymentStatusSelect').value = order.paymentStatus;

        const statusModal = new bootstrap.Modal(document.getElementById('statusModal'));
        statusModal.show();
    } catch (error) {
        console.error('Error fetching order details for edit:', error);
        showError(`Failed to load order details: ${error.message}`);
    } finally {
        hideLoadingSpinner();
    }
}

async function saveOrderStatus() {
    const orderId = document.getElementById('orderIdInput').value;
    const newStatus = document.getElementById('statusSelect').value;
    const newPaymentStatus = document.getElementById('paymentStatusSelect').value;

    if (!orderId) {
        showError('No order ID found for update.');
        return;
    }
    showLoadingSpinner();

    try {
        const response = await fetch(`http://localhost:5500/api/bookings/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            },
            body: JSON.stringify({ status: newStatus, paymentStatus: newPaymentStatus })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        const statusModalInstance = bootstrap.Modal.getInstance(document.getElementById('statusModal'));
        if (statusModalInstance) {
            statusModalInstance.hide();
        }
        showSuccess('Order status updated successfully!');
        loadOrders(); // Refresh the table
    } catch (error) {
        console.error('Error updating order status:', error);
        showError(`Failed to update order status: ${error.message}`);
    } finally {
        hideLoadingSpinner();
    }
}

async function deleteOrder(orderId) {
    console.log('Attempting to delete order:', orderId);
    if (confirm(`Are you sure you want to delete order ${orderId}?`)) {
        showLoadingSpinner();
        try {
            const response = await fetch(`http://localhost:5500/api/bookings/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });

            const result = await response.json(); 
            if (!response.ok) {
                 // Try to parse error message from JSON if available
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }
            showSuccess('Order deleted successfully!');
            loadOrders(); // Refresh the table
        } catch (error) {
            console.error('Error deleting order:', error);
            showError(`Failed to delete order: ${error.message}`);
        } finally {
            hideLoadingSpinner();
        }
    }
}

function setupEventListeners() {
    console.log('setupEventListeners called. Add specific listeners as needed.');
    // Example: Add listener for a refresh button if it's common across admin pages
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn && typeof loadOrders === 'function') { // Check if loadOrders exists for context
        refreshBtn.addEventListener('click', loadOrders);
    }
    
    // Example: Add listener for a search input if common
    const searchInput = document.getElementById('searchInput');
    if (searchInput && typeof loadOrders === 'function') { // Check if loadOrders exists for context
        searchInput.addEventListener('input', debounce(loadOrders, 500)); // Assuming debounce is available
    }

    const saveStatusBtn = document.getElementById('saveStatusBtn');
    if (saveStatusBtn) {
        saveStatusBtn.addEventListener('click', saveOrderStatus);
    }
}

// Flight Management Functions
let currentEditingFlightId = null;

async function loadFlights() {
    const flightsTableBody = document.getElementById('flightsTableBody');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorAlert = document.getElementById('errorAlert');
    const searchFlight = document.getElementById('searchFlight')?.value || '';

    if (!flightsTableBody || !loadingSpinner || !errorAlert) {
        console.error('Required HTML elements not found for loading flights.');
        return;
    }

    flightsTableBody.innerHTML = ''; // Clear existing rows
    loadingSpinner.classList.remove('hidden');
    errorAlert.classList.add('hidden');

    try {
        let url = 'http://localhost:5500/api/flights/admin'; // Ensure this is the correct admin endpoint
        const params = new URLSearchParams();
        if (searchFlight) params.append('search', searchFlight);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const flights = await response.json();

        if (flights.length === 0) {
            flightsTableBody.innerHTML = '<tr><td colspan="10">No flights found.</td></tr>';
        } else {
            flights.forEach(flight => {
                const row = flightsTableBody.insertRow();
                row.innerHTML = `
                    <td>${flight.flightNumber}</td>
                    <td>${flight.airline}</td>
                    <td>${flight.departure.city}</td>
                    <td>${flight.arrival.city}</td>
                    <td>${new Date(flight.departure.time).toLocaleString()}</td>
                    <td>${new Date(flight.arrival.time).toLocaleString()}</td>
                    <td>${formatPrice(flight.price)}</td>
                    <td>${flight.availableSeats}</td>
                    <td><span class="status-${flight.status.toLowerCase().replace(' ', '-')}">${flight.status}</span></td>
                    <td class="actions">
                        <button class="edit-btn" onclick="showEditFlightForm('${flight._id}')"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" onclick="showDeleteFlightModal('${flight._id}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
            });
        }
    } catch (error) {
        console.error('Error loading flights:', error);
        errorAlert.textContent = `Failed to load flights: ${error.message}`;
        errorAlert.classList.remove('hidden');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function showAddFlightForm() {
    currentEditingFlightId = null;
    document.getElementById('flightModalTitle').textContent = 'Add New Flight';
    document.getElementById('flightForm').reset();
    
    const flightModal = document.getElementById('flightModal');
    flightModal.style.left = ''; 
    flightModal.style.top = '';
    flightModal.style.display = 'block';
}

async function showEditFlightForm(flightId) {
    currentEditingFlightId = flightId;
    document.getElementById('flightModalTitle').textContent = 'Edit Flight';
    const errorAlert = document.getElementById('errorAlert');
    errorAlert.classList.add('hidden');

    const flightModal = document.getElementById('flightModal');
    flightModal.style.left = '';
    flightModal.style.top = '';

    try {
        const response = await fetch(`http://localhost:5500/api/flights/admin/${flightId}`, {
             headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const flight = await response.json();

        document.getElementById('flightNumber').value = flight.flightNumber;
        document.getElementById('airline').value = flight.airline;
        document.getElementById('departureCity').value = flight.departure.city;
        document.getElementById('departureAirport').value = flight.departure.airport;
        document.getElementById('departureTime').value = flight.departure.time.substring(0, 16); // Format for datetime-local
        document.getElementById('arrivalCity').value = flight.arrival.city;
        document.getElementById('arrivalAirport').value = flight.arrival.airport;
        document.getElementById('arrivalTime').value = flight.arrival.time.substring(0, 16); // Format for datetime-local
        document.getElementById('price').value = flight.price;
        document.getElementById('availableSeats').value = flight.availableSeats;
        document.getElementById('flightClass').value = flight.class; 
        document.getElementById('flightStatus').value = flight.status;

        flightModal.style.display = 'block';

    } catch (error) {
        console.error('Error fetching flight details for edit:', error);
        errorAlert.textContent = `Failed to load flight for editing: ${error.message}`;
        errorAlert.classList.remove('hidden');
    }
}

function closeFlightModal() {
    document.getElementById('flightModal').style.display = 'none';
    document.getElementById('flightForm').reset();
    currentEditingFlightId = null;
}

async function handleFlightSubmit(event) {
    event.preventDefault();
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    successAlert.classList.add('hidden');
    errorAlert.classList.add('hidden');

    const flightData = {
        flightNumber: document.getElementById('flightNumber').value,
        airline: document.getElementById('airline').value,
        departure: {
            city: document.getElementById('departureCity').value,
            airport: document.getElementById('departureAirport').value,
            time: document.getElementById('departureTime').value
        },
        arrival: {
            city: document.getElementById('arrivalCity').value,
            airport: document.getElementById('arrivalAirport').value,
            time: document.getElementById('arrivalTime').value
        },
        price: parseFloat(document.getElementById('price').value),
        availableSeats: parseInt(document.getElementById('availableSeats').value),
        class: document.getElementById('flightClass').value, 
        status: document.getElementById('flightStatus').value
    };

    const method = currentEditingFlightId ? 'PUT' : 'POST';
    const url = currentEditingFlightId ? `http://localhost:5500/api/flights/admin/${currentEditingFlightId}` : 'http://localhost:5500/api/flights/admin';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            },
            body: JSON.stringify(flightData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        successAlert.textContent = `Flight ${currentEditingFlightId ? 'updated' : 'added'} successfully!`;
        successAlert.classList.remove('hidden');
        closeFlightModal();
        loadFlights(); // Refresh the table
    } catch (error) {
        console.error('Error submitting flight:', error);
        errorAlert.textContent = `Failed to ${currentEditingFlightId ? 'update' : 'add'} flight: ${error.message}`;
        errorAlert.classList.remove('hidden');
    }
}

let flightIdToDelete = null;

function showDeleteFlightModal(flightId) {
    flightIdToDelete = flightId;
    document.getElementById('deleteFlightModal').style.display = 'block';
}

function closeDeleteFlightModal() {
    document.getElementById('deleteFlightModal').style.display = 'none';
    flightIdToDelete = null;
}

async function confirmDeleteFlight() {
    if (!flightIdToDelete) return;

    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    successAlert.classList.add('hidden');
    errorAlert.classList.add('hidden');

    try {
        const response = await fetch(`http://localhost:5500/api/flights/admin/${flightIdToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        successAlert.textContent = 'Flight deleted successfully!';
        successAlert.classList.remove('hidden');
        loadFlights(); // Refresh the table
    } catch (error) {
        console.error('Error deleting flight:', error);
        errorAlert.textContent = `Failed to delete flight: ${error.message}`;
        errorAlert.classList.remove('hidden');
    } finally {
        closeDeleteFlightModal();
    }
}

function setupEventListeners() {
    console.log('setupEventListeners called. Add specific listeners as needed.');
    // Example: Add listener for a refresh button if it's common across admin pages
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn && typeof loadFlights === 'function') { // Check if loadFlights exists for context
        refreshBtn.addEventListener('click', loadFlights);
    }
    
    // Example: Add listener for a search input if common
    const searchInput = document.getElementById('searchFlight');
    if (searchInput && typeof loadFlights === 'function') { // Check if loadFlights exists for context
        searchInput.addEventListener('input', debounce(loadFlights, 500)); // Assuming debounce is available
    }

    const saveStatusBtn = document.getElementById('saveStatusBtn');
    if (saveStatusBtn) {
        saveStatusBtn.addEventListener('click', handleFlightSubmit);
    }
}

// Hotel Management Functions
let currentEditingHotelId = null;

async function loadHotels() {
    const hotelsTableBody = document.getElementById('hotelsTableBody');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorAlert = document.getElementById('errorAlert');
    const searchHotel = document.getElementById('searchHotel')?.value || '';

    if (!hotelsTableBody || !loadingSpinner || !errorAlert) {
        console.error('Required HTML elements not found for loading hotels.');
        return;
    }

    hotelsTableBody.innerHTML = ''; // Clear existing rows
    loadingSpinner.classList.remove('hidden');
    errorAlert.classList.add('hidden');

    try {
        let url = 'http://localhost:5500/api/hotels/admin'; // Ensure this is the correct admin endpoint
        const params = new URLSearchParams();
        if (searchHotel) params.append('search', searchHotel);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const hotels = await response.json();

        if (hotels.length === 0) {
            hotelsTableBody.innerHTML = '<tr><td colspan="6">No hotels found.</td></tr>';
        } else {
            hotels.forEach(hotel => {
                const row = hotelsTableBody.insertRow();
                row.innerHTML = `
                    <td>${hotel.name}</td>
                    <td>${hotel.location.city}</td>
                    <td>${hotel.location.address}</td>
                    <td>${hotel.rating || 'N/A'}</td>
                    <td><span class="status-${hotel.status.toLowerCase().replace(' ', '-')}">${hotel.status}</span></td>
                    <td class="actions">
                        <button class="edit-btn" onclick="showEditHotelForm('${hotel._id}')"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" onclick="showDeleteHotelModal('${hotel._id}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
            });
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
        errorAlert.textContent = `Failed to load hotels: ${error.message}`;
        errorAlert.classList.remove('hidden');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function showAddHotelForm() {
    currentEditingHotelId = null;
    document.getElementById('hotelModalTitle').textContent = 'Add New Hotel';
    document.getElementById('hotelForm').reset();
    document.getElementById('rooms').value = '[]'; // Default to empty JSON array for rooms

    const hotelModal = document.getElementById('hotelModal');
    hotelModal.style.left = ''; 
    hotelModal.style.top = '';
    hotelModal.style.display = 'block';
}

async function showEditHotelForm(hotelId) {
    currentEditingHotelId = hotelId;
    document.getElementById('hotelModalTitle').textContent = 'Edit Hotel';
    const errorAlert = document.getElementById('errorAlert');
    errorAlert.classList.add('hidden');

    const hotelModal = document.getElementById('hotelModal');
    hotelModal.style.left = '';
    hotelModal.style.top = '';

    try {
        const response = await fetch(`http://localhost:5500/api/hotels/admin/${hotelId}`, {
             headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const hotel = await response.json();

        document.getElementById('hotelName').value = hotel.name;
        document.getElementById('description').value = hotel.description;
        document.getElementById('hotelCity').value = hotel.location.city;
        document.getElementById('hotelAddress').value = hotel.location.address;
        document.getElementById('latitude').value = hotel.location.coordinates?.latitude || '';
        document.getElementById('longitude').value = hotel.location.coordinates?.longitude || '';
        document.getElementById('rating').value = hotel.rating || 0;
        document.getElementById('amenities').value = hotel.amenities ? hotel.amenities.join(', ') : '';
        document.getElementById('images').value = hotel.images ? hotel.images.join(', ') : '';
        document.getElementById('rooms').value = hotel.rooms ? JSON.stringify(hotel.rooms, null, 2) : '[]';
        document.getElementById('contactPhone').value = hotel.contact?.phone || '';
        document.getElementById('contactEmail').value = hotel.contact?.email || '';
        document.getElementById('contactWebsite').value = hotel.contact?.website || '';
        document.getElementById('hotelStatus').value = hotel.status;

        hotelModal.style.display = 'block';

    } catch (error) {
        console.error('Error fetching hotel details for edit:', error);
        errorAlert.textContent = `Failed to load hotel for editing: ${error.message}`;
        errorAlert.classList.remove('hidden');
    }
}

function closeHotelModal() {
    document.getElementById('hotelModal').style.display = 'none';
    document.getElementById('hotelForm').reset();
    currentEditingHotelId = null;
}

async function handleHotelSubmit(event) {
    event.preventDefault();
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    successAlert.classList.add('hidden');
    errorAlert.classList.add('hidden');

    let roomsData;
    try {
        roomsData = JSON.parse(document.getElementById('rooms').value || '[]');
    } catch (e) {
        errorAlert.textContent = 'Invalid JSON format in Rooms.';
        errorAlert.classList.remove('hidden');
        return;
    }

    const hotelData = {
        name: document.getElementById('hotelName').value,
        description: document.getElementById('description').value,
        location: {
            city: document.getElementById('hotelCity').value,
            address: document.getElementById('hotelAddress').value,
            coordinates: {
                latitude: parseFloat(document.getElementById('latitude').value) || null,
                longitude: parseFloat(document.getElementById('longitude').value) || null,
            }
        },
        rating: parseFloat(document.getElementById('rating').value || 0),
        amenities: document.getElementById('amenities').value.split(',').map(item => item.trim()).filter(item => item),
        images: document.getElementById('images').value.split(',').map(item => item.trim()).filter(item => item),
        rooms: roomsData,
        contact: {
            phone: document.getElementById('contactPhone').value || null,
            email: document.getElementById('contactEmail').value || null,
            website: document.getElementById('contactWebsite').value || null,
        },
        status: document.getElementById('hotelStatus').value
    };
    // Remove null coordinates if not provided
    if (hotelData.location.coordinates.latitude === null && hotelData.location.coordinates.longitude === null) {
        delete hotelData.location.coordinates;
    }


    const method = currentEditingHotelId ? 'PUT' : 'POST';
    const url = currentEditingHotelId ? `http://localhost:5500/api/hotels/admin/${currentEditingHotelId}` : 'http://localhost:5500/api/hotels/admin';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            },
            body: JSON.stringify(hotelData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        successAlert.textContent = `Hotel ${currentEditingHotelId ? 'updated' : 'added'} successfully!`;
        successAlert.classList.remove('hidden');
        closeHotelModal();
        loadHotels(); // Refresh the table
    } catch (error) {
        console.error('Error submitting hotel:', error);
        errorAlert.textContent = `Failed to ${currentEditingHotelId ? 'update' : 'add'} hotel: ${error.message}`;
        errorAlert.classList.remove('hidden');
    }
}

let hotelIdToDelete = null;

function showDeleteHotelModal(hotelId) {
    hotelIdToDelete = hotelId;
    document.getElementById('deleteHotelModal').style.display = 'block';
}

function closeDeleteHotelModal() {
    document.getElementById('deleteHotelModal').style.display = 'none';
    hotelIdToDelete = null;
}

async function confirmDeleteHotel() {
    if (!hotelIdToDelete) return;

    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    successAlert.classList.add('hidden');
    errorAlert.classList.add('hidden');

    try {
        const response = await fetch(`http://localhost:5500/api/hotels/admin/${hotelIdToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        successAlert.textContent = 'Hotel deleted successfully!';
        successAlert.classList.remove('hidden');
        loadHotels(); // Refresh the table
    } catch (error) {
        console.error('Error deleting hotel:', error);
        errorAlert.textContent = `Failed to delete hotel: ${error.message}`;
        errorAlert.classList.remove('hidden');
    } finally {
        closeDeleteHotelModal();
    }
}

function setupEventListeners() {
    console.log('setupEventListeners called. Add specific listeners as needed.');
    // Example: Add listener for a refresh button if it's common across admin pages
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn && typeof loadHotels === 'function') { // Check if loadHotels exists for context
        refreshBtn.addEventListener('click', loadHotels);
    }
    
    // Example: Add listener for a search input if common
    const searchInput = document.getElementById('searchHotel');
    if (searchInput && typeof loadHotels === 'function') { // Check if loadHotels exists for context
        searchInput.addEventListener('input', debounce(loadHotels, 500)); // Assuming debounce is available
    }

    const saveStatusBtn = document.getElementById('saveStatusBtn');
    if (saveStatusBtn) {
        saveStatusBtn.addEventListener('click', handleHotelSubmit);
    }
}