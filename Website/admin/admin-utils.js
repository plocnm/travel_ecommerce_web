function checkAdminAccess() {
    const userToken = localStorage.getItem('userToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!userToken || userRole !== 'admin') {
        window.location.href = '../frontend/login.html';
        return false;
    }
    return true;
}