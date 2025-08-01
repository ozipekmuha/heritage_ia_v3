// This script depends on auth.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Page Protection ---
    protectPage();
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    // --- Personalization ---
    const userNameElement = document.querySelector('.user-info h3');
    if (userNameElement) {
        userNameElement.textContent = `Bonjour, ${currentUser.firstName || 'Utilisateur'}`;
    }
    const planElement = document.querySelector('.user-info p');
    if (planElement && currentUser.plan) {
        planElement.textContent = `Plan ${currentUser.plan.name}`;
    }

    // --- Logout ---
    const logoutButton = Array.from(document.querySelectorAll('.nav-item')).find(item =>
        item.textContent.trim().includes('Déconnexion')
    );
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }

    // --- Dynamic Content ---
    // Load data from localStorage
    const memoriesKey = `heritage_ai_souvenirs_${currentUser.email}`;
    const userMemories = JSON.parse(localStorage.getItem(memoriesKey)) || [];
    const capsulesKey = `heritage_ai_capsules_${currentUser.email}`;
    const userCapsules = JSON.parse(localStorage.getItem(capsulesKey)) || [];

    // Update stats cards
    document.querySelector('.stats-grid .stat-card:nth-child(1) .stat-value').textContent = userMemories.length;
    document.querySelector('.stats-grid .stat-card:nth-child(2) .stat-value').textContent = userCapsules.filter(c => c.status === 'pending').length;

    // Update nav badges
    const souvenirsBadge = document.querySelector('.nav-item a[href="souvenirs.html"] .nav-badge');
    if(souvenirsBadge) souvenirsBadge.textContent = userMemories.length;
    const capsulesBadge = document.querySelector('.nav-item a[href="capsule.html"] .nav-badge');
    if(capsulesBadge) capsulesBadge.textContent = userCapsules.filter(c => c.status === 'pending').length;

    // Update recent activity list
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        const recentMemories = userMemories.slice(0, 3);
        if (recentMemories.length > 0) {
            activityList.innerHTML = recentMemories.map(memory => `
                <div class="activity-item">
                    <div class="activity-icon">📝</div>
                    <div class="activity-details">
                        <div class="activity-title">Souvenir ajouté : "${memory.title}"</div>
                        <div class="activity-time">${new Date(memory.createdAt).toLocaleDateString('fr-FR')}</div>
                    </div>
                </div>`).join('');
        } else {
            activityList.innerHTML = `<p>Aucune activité récente.</p>`;
        }
    }

    // Update upcoming capsules list
    const upcomingCapsulesContainer = document.querySelector('.activity-section:last-of-type > div[style]');
    if (upcomingCapsulesContainer) {
        const upcoming = userCapsules
            .filter(c => c.status === 'pending')
            .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
            .slice(0, 3);

        if (upcoming.length > 0) {
            upcomingCapsulesContainer.innerHTML = upcoming.map(capsule => `
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; border-left: 4px solid var(--secondary);">
                    <h4 style="color: var(--primary); margin-bottom: 0.5rem;">${capsule.title}</h4>
                    <p style="color: #666; font-size: 0.9rem; margin-bottom: 0.5rem;">Pour : ${capsule.recipient}</p>
                    <p style="color: var(--secondary); font-weight: bold; font-size: 0.9rem;">
                        📅 ${new Date(capsule.deliveryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            `).join('');
        } else {
            upcomingCapsulesContainer.innerHTML = `<p>Aucune capsule à venir.</p>`;
        }
    }

    // --- Existing Dashboard UI Logic ---
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (mobileMenuToggle && sidebar && overlay) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
});
