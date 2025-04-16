function checkAdminAccess() {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || userRole !== 'admin') {
        window.location.href = '../frontend/login.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    window.location.href = '../frontend/login.html';
}