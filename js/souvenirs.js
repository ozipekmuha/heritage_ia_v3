// Affichage dynamique des souvenirs avec actions Voir, Modifier, Supprimer
document.addEventListener('DOMContentLoaded', () => {
    protectPage && protectPage();
    const currentUser = getCurrentUser && getCurrentUser();
    if (!currentUser) return;
    const souvenirsGrid = document.getElementById('souvenirsGrid');
    const emptyState = document.getElementById('emptyState');
    const memoriesKey = `heritage_ai_souvenirs_${currentUser.email}`;
    let souvenirs = JSON.parse(localStorage.getItem(memoriesKey)) || [];

    function renderSouvenirs(filterType = 'all') {
        souvenirsGrid.innerHTML = '';
        let filtered = souvenirs;
        if (filterType !== 'all') {
            filtered = souvenirs.filter(s => (s.type || 'photo') === filterType);
        }
        if (!filtered.length) {
            emptyState.style.display = '';
            return;
        }
        emptyState.style.display = 'none';
        filtered.forEach((s, idx) => {
            const card = document.createElement('div');
            card.className = 'souvenir-card';
            // Header
            const header = document.createElement('div');
            header.className = 'souvenir-card-header';
            header.innerHTML = `<span class="souvenir-title">${s.title || 'Sans titre'}</span>`;
            card.appendChild(header);
            // Body
            const body = document.createElement('div');
            body.className = 'souvenir-card-body';
            // Meta
            const meta = document.createElement('div');
            meta.className = 'souvenir-meta';
            if (s.date) meta.innerHTML += `<span>📅 ${s.date}</span>`;
            if (s.location) meta.innerHTML += `<span>📍 ${s.location}</span>`;
            if (s.emotion && s.emotion.length) meta.innerHTML += `<span class="souvenir-emotions">${s.emotion.map(e=>emotionIcon(e)).join(' ')}</span>`;
            if (s.privacy) meta.innerHTML += `<span class="souvenir-privacy">${privacyIcon(s.privacy)} ${privacyLabel(s.privacy)}</span>`;
            body.appendChild(meta);
            // Tags
            if (s.tags && s.tags.length) {
                const tags = document.createElement('div');
                tags.className = 'souvenir-tags';
                s.tags.forEach(tag => {
                    const t = document.createElement('span');
                    t.className = 'souvenir-tag';
                    t.textContent = tag;
                    tags.appendChild(t);
                });
                body.appendChild(tags);
            }
            // Content
            if (s.story) {
                const content = document.createElement('div');
                content.className = 'souvenir-content';
                content.innerHTML = s.story.length > 200 ? s.story.slice(0,200)+'…' : s.story;
                body.appendChild(content);
            }
            // Media (simulation)
            // TODO: Afficher images/videos/audios si stockés
            // Footer
            card.appendChild(body);
            const footer = document.createElement('div');
            footer.className = 'souvenir-card-footer';
            footer.style.display = 'flex';
            footer.style.gap = '1rem';
            footer.style.justifyContent = 'flex-end';
            footer.style.alignItems = 'center';
            // Boutons actions
            const btnView = document.createElement('button');
            btnView.className = 'btn btn-secondary btn-view';
            btnView.innerHTML = '👁️ Voir';
            btnView.onclick = () => viewSouvenir(s);
            const btnEdit = document.createElement('button');
            btnEdit.className = 'btn btn-secondary btn-edit';
            btnEdit.innerHTML = '✏️ Modifier';
            btnEdit.onclick = () => editSouvenir(idx);
            const btnDelete = document.createElement('button');
            btnDelete.className = 'btn btn-secondary btn-delete';
            btnDelete.style.background = 'var(--accent)';
            btnDelete.style.color = 'white';
            btnDelete.innerHTML = '🗑️ Supprimer';
            btnDelete.onclick = () => deleteSouvenir(idx);
            footer.appendChild(btnView);
            footer.appendChild(btnEdit);
            footer.appendChild(btnDelete);
            card.appendChild(footer);
            souvenirsGrid.appendChild(card);
        });
    }

    function emotionIcon(e) {
        const map = {joy:'😊',love:'❤️',pride:'🌟',nostalgia:'🥰',gratitude:'🙏',excitement:'🎉',peace:'😌',hope:'🌈'};
        return map[e]||e;
    }
    function privacyIcon(p) {
        return p==='private'?'🔒':p==='family'?'👨‍👩‍👧‍👦':p==='heirs'?'🕰️':'';
    }
    function privacyLabel(p) {
        return p==='private'?'Privé':p==='family'?'Famille':p==='heirs'?'Héritage':'';
    }

    function viewSouvenir(s) {
        // Affichage modal simple
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(44,62,80,0.25)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div style="background:white;max-width:500px;width:90vw;padding:2rem 2.5rem;border-radius:18px;box-shadow:0 8px 32px rgba(44,62,80,0.18);position:relative;">
                <button style="position:absolute;top:1rem;right:1rem;font-size:1.5rem;background:none;border:none;cursor:pointer;" onclick="this.parentNode.parentNode.remove()">×</button>
                <h2 style="color:var(--primary);margin-bottom:0.5rem;">${s.title||'Sans titre'}</h2>
                <div style="color:#888;font-size:1rem;margin-bottom:1rem;">${s.date?`📅 ${s.date}`:''} ${s.location?`📍 ${s.location}`:''}</div>
                <div style="margin-bottom:1rem;">${(s.emotion||[]).map(e=>emotionIcon(e)).join(' ')}</div>
                <div style="margin-bottom:1rem;">${(s.tags||[]).map(t=>`<span class='souvenir-tag'>${t}</span>`).join(' ')}</div>
                <div style="margin-bottom:1rem;">${s.story||''}</div>
                <div style="margin-bottom:1rem;">${privacyIcon(s.privacy)} ${privacyLabel(s.privacy)}</div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function editSouvenir(idx) {
        // Redirige vers add.html avec l'index en query
        window.location.href = `add.html?edit=${idx}`;
    }

    function deleteSouvenir(idx) {
        if (confirm('Supprimer ce souvenir ?')) {
            souvenirs.splice(idx,1);
            localStorage.setItem(memoriesKey, JSON.stringify(souvenirs));
            renderSouvenirs();
        }
    }

    // Filtre par type
    const filterType = document.getElementById('filterType');
    if (filterType) {
        filterType.addEventListener('change', e => {
            renderSouvenirs(filterType.value);
        });
    }
    renderSouvenirs();
});
