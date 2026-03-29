document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const isLoggedIn = localStorage.getItem('expenseTrackerLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const pinInput = document.getElementById('pin');
    const errorMsg = document.getElementById('error-msg');

    // Simple mock authentication (PIN: 1234)
    const MOCK_PIN = '1234';

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const enteredPin = pinInput.value.trim();
        
        if (enteredPin === MOCK_PIN) {
            // "Authenticate" user
            localStorage.setItem('expenseTrackerLoggedIn', 'true');
            // Redirect to main app
            window.location.href = 'index.html';
        } else {
            // Show error
            errorMsg.textContent = 'Invalid PIN. Please try again.';
            errorMsg.style.display = 'block';
            pinInput.value = '';
            pinInput.focus();
        }
    });
});
