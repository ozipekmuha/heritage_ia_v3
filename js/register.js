// This script depends on auth.js

document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 4;
    let selectedPlanData = null;

    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;


    // Ajout explicite des event listeners sur les bons boutons next/prev
    const nextStepBtn1 = document.getElementById('nextStepBtn1');
    if (nextStepBtn1) nextStepBtn1.addEventListener('click', nextStep);
    const nextStepBtn2 = document.getElementById('nextStepBtn2');
    if (nextStepBtn2) nextStepBtn2.addEventListener('click', nextStep);
    const planNextBtn = document.getElementById('planNextBtn');
    if (planNextBtn) planNextBtn.addEventListener('click', nextStep);

    const prevStepBtn2 = document.getElementById('prevStepBtn2');
    if (prevStepBtn2) prevStepBtn2.addEventListener('click', previousStep);
    const prevStepBtn3 = document.getElementById('prevStepBtn3');
    if (prevStepBtn3) prevStepBtn3.addEventListener('click', previousStep);
    const prevStepBtn4 = document.getElementById('prevStepBtn4');
    if (prevStepBtn4) prevStepBtn4.addEventListener('click', previousStep);

    document.querySelectorAll('.plan-card').forEach(card => {
        card.onclick = null;
        card.addEventListener('click', () => selectPlan(card, card.dataset.planId || card.querySelector('.plan-name').textContent.toLowerCase()));
    });


    function nextStep() {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateProgress();
            }
        }
    }

    function previousStep() {
        if (currentStep > 1) {
            currentStep--;
            updateProgress();
        }
    }

    function showStep(step) {
        document.querySelectorAll('.form-section').forEach(section => section.classList.remove('active'));
        const activeSection = document.querySelector(`.form-section[data-section="${step}"]`);
        if (activeSection) activeSection.classList.add('active');
        if (step === 4) updateSummary();
    }

    function updateProgress() {
        const progressLine = document.getElementById('progressLine');
        if(progressLine) progressLine.style.width = `${((currentStep - 1) / (totalSteps - 1)) * 100}%`;

        document.querySelectorAll('.step').forEach((stepEl, index) => {
            const stepNumber = index + 1;
            stepEl.classList.remove('active', 'completed');
            if (stepNumber < currentStep) stepEl.classList.add('completed');
            else if (stepNumber === currentStep) stepEl.classList.add('active');
        });
        showStep(currentStep);
    }

    function validateCurrentStep() {
        // Validation personnalisée par étape
        const activeSection = document.querySelector('.form-section.active');
        if (!activeSection) return false;
        const step = parseInt(activeSection.getAttribute('data-section'));

        // Étape 1 : infos de base
        if (step === 1) {
            const firstName = document.getElementById('firstName');
            const lastName = document.getElementById('lastName');
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');
            if (!firstName.value.trim() || !lastName.value.trim() || !email.value.trim() || !password.value || !confirmPassword.value) return false;
            if (password.value !== confirmPassword.value) return false;
        }
        // Étape 3 : plan (doit être sélectionné)
        if (step === 3) {
            if (!document.getElementById('selectedPlan').value) return false;
        }
        // Étape 4 : cases à cocher obligatoires
        if (step === 4) {
            const terms = document.getElementById('terms');
            const dataConsent = document.getElementById('dataConsent');
            if (!terms.checked || !dataConsent.checked) {
                // Affiche un message d'erreur simple
                let err = document.getElementById('registerErrorMsg');
                if (!err) {
                    err = document.createElement('div');
                    err.id = 'registerErrorMsg';
                    err.style.color = 'red';
                    err.style.marginBottom = '1rem';
                    dataConsent.parentElement.parentElement.insertBefore(err, dataConsent.parentElement.nextSibling);
                }
                err.textContent = "Merci de cocher toutes les cases obligatoires.";
                return false;
            } else {
                const err = document.getElementById('registerErrorMsg');
                if (err) err.remove();
            }
        }
        return true;
    }

    function selectPlan(element, planId) {
        document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
        element.classList.add('selected');
        selectedPlanData = {
            id: planId,
            name: element.querySelector('.plan-name').textContent,
            price: element.querySelector('.plan-price').textContent
        };
        document.getElementById('selectedPlan').value = planId;
        document.getElementById('planNextBtn').disabled = false;
    }

    function updateSummary() {
        const summaryContent = document.getElementById('summaryContent');
        if (summaryContent) {
            summaryContent.innerHTML = `
                <p><strong>Nom :</strong> ${document.getElementById('firstName').value} ${document.getElementById('lastName').value}</p>
                <p><strong>Email :</strong> ${document.getElementById('email').value}</p>
                <p><strong>Plan choisi :</strong> ${selectedPlanData ? `${selectedPlanData.name}` : 'Non sélectionné'}</p>
            `;
        }
    }

    registerForm.addEventListener('submit', function(e) {

        // Si l'étape active n'est pas la 4, on force l'affichage de l'étape 4 et on empêche la soumission
        if (typeof currentStep !== 'undefined' && currentStep !== 4) {
            e.preventDefault();
            currentStep = 4;
            updateProgress();
            // Scroll vers le haut du formulaire pour que l'utilisateur voie les cases à cocher
            registerForm.scrollIntoView({behavior: 'smooth'});
            return;
        }
        e.preventDefault();
        if (!validateCurrentStep()) return;

        const loadingSpinner = document.getElementById('loadingSpinner');
        const submitBtn = document.getElementById('submitBtn');
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (submitBtn) submitBtn.disabled = true;

        const formData = new FormData(registerForm);
        const userData = Object.fromEntries(formData.entries());
        userData.plan = selectedPlanData;

        const success = registerUser(userData);

        setTimeout(() => {
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (success) {
                const successMessage = document.getElementById('successMessage');
                if (successMessage) successMessage.style.display = 'block';
                const progressBar = document.querySelector('.progress-bar');
                if(progressBar) progressBar.style.display = 'none';
                registerForm.style.display = 'none';

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                if (submitBtn) submitBtn.disabled = false;
                currentStep = 1;
                updateProgress();
            }
        }, 1500);
    });

    updateProgress();
});
