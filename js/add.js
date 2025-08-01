// This script depends on auth.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Sélection de plusieurs émotions ---
    const emotionOptions = document.querySelectorAll('.emotion-option');
    emotionOptions.forEach(option => {
        option.addEventListener('click', () => {
            option.classList.toggle('selected');
        });
    });

    // --- Sélection de confidentialité ---
    const privacyOptions = document.querySelectorAll('.privacy-option');
    privacyOptions.forEach(option => {
        option.addEventListener('click', () => {
            privacyOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
    // --- Editeur riche ---
    const richTextArea = document.getElementById('richTextArea');
    const toolbar = document.querySelector('.editor-toolbar');
    if (toolbar && richTextArea) {
        toolbar.addEventListener('click', function(e) {
            if (e.target.classList.contains('editor-button')) {
                const cmd = e.target.getAttribute('data-command');
                if (cmd === 'bold' || cmd === 'italic' || cmd === 'underline') {
                    document.execCommand(cmd, false, null);
                    richTextArea.focus();
                } else if (e.target.textContent.includes('Titre')) {
                    document.execCommand('formatBlock', false, 'h2');
                    richTextArea.focus();
                } else if (e.target.textContent.includes('Lien')) {
                    let url = prompt('Entrez l’URL du lien :');
                    if (url) document.execCommand('createLink', false, url);
                    richTextArea.focus();
                } else if (e.target.textContent.includes('Emoji')) {
                    let emoji = prompt('Collez ou tapez un emoji :');
                    if (emoji) document.execCommand('insertText', false, emoji);
                    richTextArea.focus();
                }
            }
        });
    }

    // --- DOM Elements ---
    const previewArea = document.getElementById('previewArea');
    const previewGrid = document.getElementById('previewGrid');
    const memoryTypes = document.querySelectorAll('.memory-type');
    const uploadArea = document.getElementById('uploadArea');
    const audioRecorder = document.getElementById('audioRecorder');
    const fileInput = document.getElementById('fileInput');
    // S'assurer que l'input accepte plusieurs fichiers
    if (fileInput && !fileInput.hasAttribute('multiple')) fileInput.setAttribute('multiple', 'multiple');
    const publishButton = document.getElementById('publishButton');

    // --- Preview des fichiers uploadés ---

    // Gestion des images sélectionnées
    let selectedImages = [];

    function showPreviews(files) {
        if (!previewArea || !previewGrid) return;
        previewGrid.innerHTML = '';
        let hasImage = false;
        selectedImages = Array.from(files);
        selectedImages.forEach((file, idx) => {
            if (file.type.startsWith('image/')) {
                hasImage = true;
                const reader = new FileReader();
                reader.onload = function(e) {
                    const div = document.createElement('div');
                    div.className = 'preview-item';
                    div.style.position = 'relative';
                    div.innerHTML = `
                        <img src="${e.target.result}" alt="Image" style="width:100%;height:100%;object-fit:cover;">
                        <button class="preview-remove" title="Supprimer" data-idx="${idx}" style="position:absolute;top:0.5rem;right:0.5rem;">×</button>
                    `;
                    previewGrid.appendChild(div);
                };
                reader.readAsDataURL(file);
            }
        });
        previewArea.style.display = hasImage ? 'block' : 'none';
    }

    // Suppression d'une image de l'aperçu
    if (previewGrid) {
        previewGrid.addEventListener('click', function(e) {
            if (e.target.classList.contains('preview-remove')) {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                if (!isNaN(idx)) {
                    // Supprimer l'image de la liste
                    selectedImages.splice(idx, 1);
                    // Recréer un objet FileList à partir du tableau
                    const dataTransfer = new DataTransfer();
                    selectedImages.forEach(f => dataTransfer.items.add(f));
                    fileInput.files = dataTransfer.files;
                    showPreviews(fileInput.files);
                }
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (fileInput.files && fileInput.files.length > 0) {
                // Fusionner les fichiers sélectionnés avec ceux déjà présents
                let newFiles = Array.from(fileInput.files);
                if (selectedImages.length > 0) {
                    // Éviter les doublons (par nom et taille)
                    const existing = selectedImages.map(f => f.name + f.size);
                    newFiles = newFiles.filter(f => !existing.includes(f.name + f.size));
                    selectedImages = selectedImages.concat(newFiles);
                } else {
                    selectedImages = newFiles;
                }
                // Recréer FileList
                const dataTransfer = new DataTransfer();
                selectedImages.forEach(f => dataTransfer.items.add(f));
                fileInput.files = dataTransfer.files;
                showPreviews(fileInput.files);
            } else {
                if (previewArea) previewArea.style.display = 'none';
            }
        });
    }

    // --- Page Protection ---
    protectPage();
    const currentUser = getCurrentUser();
    if (!currentUser) return; // Should be handled by protectPage, but as a safeguard



    // --- Upload Area: click to open file explorer ---
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', (e) => {
            // Ne pas ouvrir si clic sur input caché
            if (e.target !== fileInput) fileInput.click();
        });

        // Drag & drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer && e.dataTransfer.files && fileInput) {
                // Fusionner les fichiers drag & drop avec ceux déjà présents
                let droppedFiles = Array.from(e.dataTransfer.files);
                if (selectedImages.length > 0) {
                    const existing = selectedImages.map(f => f.name + f.size);
                    droppedFiles = droppedFiles.filter(f => !existing.includes(f.name + f.size));
                    selectedImages = selectedImages.concat(droppedFiles);
                } else {
                    selectedImages = droppedFiles;
                }
                // Recréer FileList
                const dataTransfer = new DataTransfer();
                selectedImages.forEach(f => dataTransfer.items.add(f));
                fileInput.files = dataTransfer.files;
                showPreviews(fileInput.files);
            }
        });
    }

    // --- Event Listeners ---
    memoryTypes.forEach(type => {
        type.addEventListener('click', () => {
            memoryTypes.forEach(t => t.classList.remove('active'));
            type.classList.add('active');
            updateInterface(type.dataset.type);
        });
    });

    // Affichage dynamique selon le type de souvenir
    function updateInterface(type) {
        // Masquer tout
        if (uploadArea) uploadArea.style.display = 'none';
        if (previewArea) previewArea.style.display = 'none';
        if (audioRecorder) audioRecorder.style.display = 'none';
        if (richTextArea) richTextArea.parentElement.style.display = 'none';

        // Afficher selon le type
        if (type === 'photo' || type === 'video') {
            if (uploadArea) uploadArea.style.display = '';
            if (previewArea && selectedImages.length > 0) previewArea.style.display = '';
        }
        if (type === 'audio') {
            if (audioRecorder) audioRecorder.style.display = '';
        }
        if (type === 'text') {
            if (richTextArea) richTextArea.parentElement.style.display = '';
        }
        if (type === 'mixed') {
            if (uploadArea) uploadArea.style.display = '';
            if (previewArea && selectedImages.length > 0) previewArea.style.display = '';
            if (audioRecorder) audioRecorder.style.display = '';
            if (richTextArea) richTextArea.parentElement.style.display = '';
        }
    }

    if (publishButton) {
        publishButton.addEventListener('click', saveMemory);
    }

    // --- Functions ---
    // updateInterface est redéfini ci-dessus pour la logique dynamique

    function saveMemory() {
        const titleInput = document.getElementById('memoryTitle');
        if (!titleInput.value.trim()) {
            alert('Veuillez donner un titre à votre souvenir.');
            titleInput.focus();
            return;
        }

        // 1. Get all data from the form
        const memory = {
            id: Date.now(), // Simple unique ID
            title: titleInput.value,
            date: document.getElementById('memoryDate').value,
            location: document.getElementById('memoryLocation').value,
            people: Array.from(document.querySelectorAll('#peopleTagInput .tag')).map(t => t.innerText.replace('×', '').trim()),
            tags: Array.from(document.querySelectorAll('#tagsInput .tag')).map(t => t.innerText.replace('×', '').trim()),
            emotion: Array.from(document.querySelectorAll('.emotion-option.selected')).map(e => e.dataset.emotion),
            privacy: document.querySelector('.privacy-option.selected')?.dataset.privacy,
            story: richTextArea ? richTextArea.innerHTML : '',
            createdAt: new Date().toISOString()
            // Note: File data is not handled in this simulation
        };

        // 2. Get existing memories from localStorage
        const memoriesKey = `heritage_ai_souvenirs_${currentUser.email}`;
        let userMemories = JSON.parse(localStorage.getItem(memoriesKey)) || [];

        // 3. Add the new memory
        userMemories.unshift(memory); // Add to the beginning

        // 4. Save back to localStorage
        localStorage.setItem(memoriesKey, JSON.stringify(userMemories));

        // 5. Provide user feedback and redirect
        const progressIndicator = document.getElementById('progressIndicator');
        if(progressIndicator) progressIndicator.classList.add('active');

        setTimeout(() => {
            if(progressIndicator) progressIndicator.classList.remove('active');
            alert('Souvenir créé avec succès !');
            window.location.href = 'dashboard.html'; // Or to a new souvenirs list page
        }, 1500);
    }

    // --- Initial UI Setup ---
    updateInterface('photo'); // Default to photo
});
