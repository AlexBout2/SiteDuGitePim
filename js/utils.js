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
 * Valide spécifiquement le numéro de séjour
 * @returns {boolean} - true si le numéro de séjour est fourni
 */
function validateSejourNumber() {
    return validateByClass(
        'sejour-resa-input',
        'invalid-feedback',
        value => value !== ''
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

// Exporter les fonctions
export { validateByClass, validateSejourNumber, getSejourNumber };
