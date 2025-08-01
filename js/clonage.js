// clonage.js - Gestion du clonage vocal HéritageAI

// État du processus
let step = 1;

function showStep(n) {
    document.querySelectorAll('.clonage-step').forEach((el, i) => {
        el.style.display = (i + 1 === n) ? 'block' : 'none';
    });
    document.getElementById('clonage-progress').value = n;
}

// Navigation étapes
window.nextClonageStep = function() {
    if (step < 4) step++;
    showStep(step);
}
window.prevClonageStep = function() {
    if (step > 1) step--;
    showStep(step);
}

// Enregistrement vocal (Web Audio API)
let mediaRecorder, audioChunks = [], audioURL = '';
const recordBtn = () => document.getElementById('recordBtn');
const stopBtn = () => document.getElementById('stopBtn');
const audioPreview = () => document.getElementById('audioPreview');

window.startRecording = async function() {
    audioChunks = [];
    recordBtn().disabled = true;
    stopBtn().disabled = false;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        audioURL = URL.createObjectURL(blob);
        audioPreview().src = audioURL;
        audioPreview().style.display = 'block';
        // Sauvegarde dans localStorage (pour détection future)
        const reader = new FileReader();
        reader.onloadend = function() {
            localStorage.setItem('clonageAudio', reader.result);
        };
        reader.readAsDataURL(blob);
        recordBtn().disabled = false;
        stopBtn().disabled = true;
    };
    mediaRecorder.start();
};
window.stopRecording = function() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
};

// Soumission finale (simulation)
window.submitClonage = function() {
    document.getElementById('clonage-final').style.display = 'block';
    document.getElementById('clonage-main').style.display = 'none';
    // Ici, on pourrait envoyer le blob audio à l'API IA pour traitement
};

document.addEventListener('DOMContentLoaded', function() {
    showStep(step);
    stopBtn().disabled = true;
});
