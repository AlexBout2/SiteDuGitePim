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


/**
 * Vérifie si une date est comprise dans la période de séjour
 * @param {string} dateValue - La date à vérifier (format YYYY-MM-DD)
 * @param {string} sejourNumber - Le numéro de séjour
 * @returns {boolean} - true si la date est dans la période du séjour, false sinon
 */
function isDateInSejourPeriod(dateValue, sejourNumber) {
    if (!dateValue || !sejourNumber) return false;

    // Récupérer les réservations du localStorage
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const reservation = reservations.find(r => r.reservationNumber === sejourNumber);

    if (!reservation) return false;

    // Convertir les dates en objets Date pour la comparaison
    const selectedDate = new Date(dateValue);
    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);

    // Normaliser les dates (sans heures, minutes, etc.)
    selectedDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Vérifier strictement si la date est comprise dans la période de séjour (inclusif)
    return selectedDate >= startDate && selectedDate <= endDate;
}

/**
 * Configure un champ de date pour restreindre les dates à la période du séjour
 * @param {HTMLElement} dateInputElement - L'élément input de type date
 * @param {string} sejourNumber - Numéro de séjour
 */
function setupDateInputForSejour(dateInputElement, sejourNumber) {
    if (!dateInputElement || !sejourNumber) return;

    // Récupérer les réservations du localStorage
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const reservation = reservations.find(r => r.reservationNumber === sejourNumber);

    if (!reservation) return;

    // Définir les dates min et max pour l'input
    dateInputElement.min = reservation.startDate;
    dateInputElement.max = reservation.endDate;

    // Désactiver les dates en dehors de la période via JavaScript
    dateInputElement.addEventListener('input', function (e) {
        const selectedDate = new Date(this.value);
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);

        // Normaliser les dates (sans heures, minutes, etc.)
        selectedDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        // Si la date est en dehors de la période, réinitialiser
        if (selectedDate < startDate || selectedDate > endDate) {
            // Empêcher la sélection en réinitialisant à une date valide
            this.value = "";

            // Afficher le message d'erreur
            this.classList.add("is-invalid");
            const feedbackElement = document.getElementById("date-feedback") ||
                this.nextElementSibling;
            if (feedbackElement) {
                feedbackElement.textContent = "La date doit être pendant votre séjour";
                feedbackElement.style.display = "block";
            }

            // Empêcher propagation de l'événement pour prévenir toute validation supplémentaire
            e.preventDefault();
            e.stopPropagation();
            return false;
        } else {
            this.classList.remove("is-invalid");
            const feedbackElement = document.getElementById("date-feedback") ||
                this.nextElementSibling;
            if (feedbackElement) {
                feedbackElement.style.display = "none";
            }
        }
    });

    // Ajouter une vérification sur le changement
    dateInputElement.addEventListener('change', function () {
        if (!isDateInSejourPeriod(this.value, sejourNumber)) {
            this.value = "";  // Réinitialiser la date
            this.classList.add("is-invalid");
            const feedbackElement = document.getElementById("date-feedback") ||
                this.nextElementSibling;
            if (feedbackElement) {
                feedbackElement.textContent = "La date doit être pendant votre séjour";
                feedbackElement.style.display = "block";
            }
        }
    });
}





export { validateByClass, validateSejourNumber, getSejourNumber, formatDate, calculateDays, setupDateInputForSejour, isDateInSejourPeriod };