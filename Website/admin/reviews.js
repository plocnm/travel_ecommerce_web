// Function to load all reviews
async function loadReviews() {
    const reviewsTableBody = document.getElementById('reviewsTableBody');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorAlert = document.getElementById('errorAlert');

    if (!reviewsTableBody) {
        console.error('reviewsTableBody not found');
        return;
    }

    reviewsTableBody.innerHTML = ''; // Clear existing rows
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
    if (errorAlert) errorAlert.classList.add('hidden');

    try {
        const response = await fetch('http://localhost:5500/api/reviews', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reviews = await response.json();

        if (reviews.length === 0) {
            reviewsTableBody.innerHTML = '<tr><td colspan="6">No reviews found.</td></tr>';
        } else {
            reviews.forEach(review => {
                const row = reviewsTableBody.insertRow();
                row.innerHTML = `
                    <td>${review.user?.name || 'Unknown'}</td>
                    <td>${review.type}</td>
                    <td>${review.rating}</td>
                    <td>${review.comment}</td>
                    <td>${new Date(review.createdAt).toLocaleDateString()}</td>
                    <td class="actions">
                        <button class="delete-btn" onclick="showDeleteReviewModal('${review._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
            });
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        if (errorAlert) {
            errorAlert.textContent = `Failed to load reviews: ${error.message}`;
            errorAlert.classList.remove('hidden');
        }
    } finally {
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
    }
}

let reviewIdToDelete = null;

function showDeleteReviewModal(reviewId) {
    reviewIdToDelete = reviewId;
    document.getElementById('deleteReviewModal').style.display = 'block';
}

function closeDeleteReviewModal() {
    document.getElementById('deleteReviewModal').style.display = 'none';
    reviewIdToDelete = null;
}

async function confirmDeleteReview() {
    if (!reviewIdToDelete) return;

    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    if (successAlert) successAlert.classList.add('hidden');
    if (errorAlert) errorAlert.classList.add('hidden');

    try {
        const response = await fetch(`http://localhost:5500/api/reviews/${reviewIdToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (successAlert) {
            successAlert.textContent = 'Review deleted successfully!';
            successAlert.classList.remove('hidden');
        }
        loadReviews(); // Refresh the table
    } catch (error) {
        console.error('Error deleting review:', error);
        if (errorAlert) {
            errorAlert.textContent = `Failed to delete review: ${error.message}`;
            errorAlert.classList.remove('hidden');
        }
    } finally {
        closeDeleteReviewModal();
    }
}

// Add event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load reviews when the page loads
    loadReviews();

    // Add search functionality if needed
    const searchInput = document.getElementById('searchReview');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(loadReviews, 500));
    }
});

// Utility function for debouncing
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
} 