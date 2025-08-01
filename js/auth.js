// --- AUTHENTICATION SERVICE ---
// A simple auth service using localStorage to simulate a backend.

const USER_KEY = 'heritage_ai_user';
const SESSION_KEY = 'heritage_ai_session';

/**
 * Registers a new user.
 * @param {object} userData - The user data from the registration form.
 * @returns {boolean} - True if registration was successful, false otherwise.
 */
function registerUser(userData) {
    const existingUser = JSON.parse(localStorage.getItem(USER_KEY));
    if (existingUser && existingUser.email === userData.email) {
        alert('Un utilisateur avec cet email existe déjà.');
        return false;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return true;
}

/**
 * Logs in a user.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {boolean} - True if login is successful, false otherwise.
 */
function loginUser(email, password) {
    const storedUser = JSON.parse(localStorage.getItem(USER_KEY));

    if (storedUser && storedUser.email === email && storedUser.password === password) {
        const session = {
            loggedIn: true,
            user: {
                firstName: storedUser.firstName,
                email: storedUser.email,
                plan: storedUser.plan
            }
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return true;
    }
    return false;
}

/**
 * Logs out the current user.
 */
function logoutUser() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
}

/**
 * Checks if a user is currently logged in.
 * @returns {boolean} - True if a user is logged in, false otherwise.
 */
function isLoggedIn() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return !!session?.loggedIn;
}

/**
 * Gets the currently logged-in user's data.
 * @returns {object|null} - The user object or null if not logged in.
 */
function getCurrentUser() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return session?.user || null;
}

/**
 * Protects a page, redirecting to login if the user is not authenticated.
 */
function protectPage() {
    if (!isLoggedIn()) {
        // Using an alert for now. A more elegant solution would be a modal.
        alert("Vous devez être connecté pour accéder à cette page.");
        window.location.href = 'login.html';
    }
}
