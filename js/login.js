// This script depends on auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    const buttonText = document.getElementById('buttonText');
    const loginButton = document.getElementById('loginButton');
    const successCheckmark = document.getElementById('successCheckmark');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            errorMessage.style.display = 'none';
            loading.style.display = 'block';
            if(buttonText) buttonText.style.display = 'none';
            loginButton.disabled = true;

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            setTimeout(() => {
                const success = loginUser(email, password);

                if (success) {
                    loading.style.display = 'none';
                    successCheckmark.style.display = 'block';
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    loading.style.display = 'none';
                    if(buttonText) buttonText.style.display = 'inline';
                    loginButton.disabled = false;
                    errorMessage.textContent = 'Email ou mot de passe incorrect.';
                    errorMessage.style.display = 'block';
                }
            }, 1000);
        });
    }
});
