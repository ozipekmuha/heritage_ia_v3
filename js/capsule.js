// This script depends on auth.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Page Protection & Setup ---
    protectPage();
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const capsulesKey = `heritage_ai_capsules_${currentUser.email}`;
    let allCapsules = JSON.parse(localStorage.getItem(capsulesKey)) || [];

    // --- DOM Elements ---
    const createModal = document.getElementById('createModal');
    const createCapsuleForm = document.getElementById('createCapsuleForm');
    const timelineView = document.getElementById('timelineView');
    const gridView = document.getElementById('gridView');

    // --- Event Listeners ---
    document.getElementById('createCapsuleBtn')?.addEventListener('click', () => createModal.classList.add('active'));
    document.getElementById('closeModalBtn')?.addEventListener('click', () => createModal.classList.remove('active'));
    document.getElementById('cancelCreateCapsuleBtn')?.addEventListener('click', () => createModal.classList.remove('active'));

    if (createCapsuleForm) {
        createCapsuleForm.addEventListener('submit', saveCapsule);
    }

    // --- Main Functions ---
    function saveCapsule(e) {
        e.preventDefault();
        const form = e.target;
        const title = form.querySelector('input[type="text"]').value;
        if (!title.trim()) {
            alert("Veuillez donner un titre à votre capsule.");
            return;
        }

        const newCapsule = {
            id: Date.now(),
            title: title,
            recipient: form.querySelector('select').value,
            message: form.querySelector('textarea').value,
            deliveryDate: form.querySelector('input[type="date"]').value,
            isRecurring: form.querySelector('input[type="checkbox"]').checked,
            createdAt: new Date().toISOString(),
            status: 'pending' // Default status
        };

        allCapsules.unshift(newCapsule);
        localStorage.setItem(capsulesKey, JSON.stringify(allCapsules));

        createModal.classList.remove('active');
        form.reset();
        renderCapsules();
    }

    function renderCapsules() {
        // For now, we will just render the timeline view. Other views can be added later.
        if (!timelineView) return;

        const timelineLine = timelineView.querySelector('.timeline-line');
        timelineView.innerHTML = ''; // Clear existing content
        if (timelineLine) timelineView.appendChild(timelineLine);

        const sortedCapsules = allCapsules.sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));

        if (sortedCapsules.length === 0) {
            timelineView.innerHTML += `<div class="empty-state"><h3>Aucune capsule programmée.</h3><p>Créez votre premier message pour le futur !</p></div>`;
            return;
        }

        sortedCapsules.forEach((capsule, idx) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-content" style="position:relative;">
                    <div class="capsule-header">
                        <div>
                            <div class="capsule-title">${capsule.title}</div>
                            <div class="capsule-recipient">👤 Pour : ${capsule.recipient}</div>
                        </div>
                        <div class="capsule-date">${new Date(capsule.deliveryDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div class="capsule-preview">
                        ${capsule.message ? `"${capsule.message.substring(0, 100)}..."` : 'Aucun message.'}
                    </div>
                    <div class="capsule-status" style="margin-bottom:1rem;">Statut : ${capsule.status}</div>
                    <div style="display:flex;gap:0.7rem;justify-content:flex-end;align-items:center;">
                        <button class="btn btn-secondary btn-edit" style="padding:0.5rem 1.2rem;border-radius:8px;">✏️ Modifier</button>
                        <button class="btn btn-secondary btn-delete" style="background:var(--accent);color:white;padding:0.5rem 1.2rem;border-radius:8px;">🗑️ Supprimer</button>
                    </div>
                </div>
                <div class="timeline-dot"></div>
            `;
            // Actions
            const btnEdit = item.querySelector('.btn-edit');
            const btnDelete = item.querySelector('.btn-delete');
            btnEdit.onclick = () => editCapsule(idx);
            btnDelete.onclick = () => deleteCapsule(idx);
            timelineView.appendChild(item);
        });
    // Edition et suppression
    function editCapsule(idx) {
        alert('Fonctionnalité à implémenter : édition de la capsule #' + (idx+1));
        // Rediriger ou ouvrir un modal d’édition selon besoin
    }
    function deleteCapsule(idx) {
        if (confirm('Supprimer cette capsule ?')) {
            allCapsules.splice(idx,1);
            localStorage.setItem(capsulesKey, JSON.stringify(allCapsules));
            renderCapsules();
        }
    }
    }

    // --- Initial Load ---
    renderCapsules();
});
