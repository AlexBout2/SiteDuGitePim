/**
 * Valide un champ de formulaire en utilisant des classes pour identifier l'input et le feedback
 * @param {string} inputClass - La classe CSS de l'input à valider
 * @param {string} feedbackClass - La classe CSS du message de feedback
 * @param {Function} validationFn - Fonction de validation retournant true si valide
 * @returns {boolean} - true si la validation est réussie, false sinon
 */
function validateByClass(inputClass, feedbackClass, validationFn) {
    // Sélectionner l'élément par sa classe (le premier s'il y en a plusieurs)
    const inputElement = document.querySelector(`.${inputClass}`);
    const feedbackElement = inputElement ? inputElement.nextElementSibling : null;

    // Vérifier que les éléments existent dans le DOM
    if (!inputElement || !feedbackElement || !feedbackElement.classList.contains(feedbackClass)) {
        console.error(`Éléments manquants ou invalides: input=${inputClass}, feedback=${feedbackClass}`);
        return false;
    }

    // Obtenir la valeur du champ et réinitialiser l'état
    const value = inputElement.value.trim();
    inputElement.classList.remove("is-invalid");

    // Appliquer la fonction de validation
    const isValid = validationFn(value);

    if (!isValid) {
        // Appliquer les styles d'erreur
        inputElement.classList.add("is-invalid");
        // Mettre le focus sur le champ en erreur
        inputElement.focus();
    }

    return isValid;
}

/**
 * Valide spécifiquement le numéro de séjour en vérifiant sa présence et son existence dans les réservations
 * @param {string} customMessage - Message d'erreur personnalisé (optionnel)
 * @returns {boolean} - true si le numéro de séjour est valide et existe
 */
function validateSejourNumber(customMessage) {
    return validateByClass(
        'sejour-resa-input',
        'sejour-valid',
        value => {
            if (value === '') {
                return false;
            }

            // Récupérer les réservations du localStorage
            const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
            const reservation = reservations.find(r => r.reservationNumber === value);

            if (!reservation) {
                const feedbackElement = document.querySelector('.sejour-valid');
                if (feedbackElement) {
                    feedbackElement.textContent = customMessage || 'Ce numéro de séjour n\'existe pas.';
                }
                return false;
            }

            return true;
        }
    );
}


/**
 * Récupère la valeur du numéro de séjour
 * @returns {string} - la valeur du numéro de séjour ou chaîne vide si non trouvé
 */
function getSejourNumber() {
    const inputElement = document.querySelector('.sejour-resa-input');
    return inputElement ? inputElement.value.trim() : '';
}


// Fonction pour formater les dates
function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Calculer le nombre de jours
function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}


export { validateByClass, validateSejourNumber, getSejourNumber, formatDate, calculateDays };