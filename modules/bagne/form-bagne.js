import { validateSejourNumber, getSejourNumber, formatDate, setupDateInputForSejour, isDateInSejourPeriod } from '../../js/utils.js';

window.addEventListener("DOMContentLoaded", function () {
    const resaCheckButton = document.querySelector(".sejour-validation");
    const fullFormContainer = document.querySelector(".fullForm");
    const confirmationDiv = document.querySelector(".confirm-resa");
    const MAX_PLACES = 10;

    resaCheckButton.addEventListener("click", function (event) {
        event.preventDefault();

        // Vider la div de confirmation
        if (confirmationDiv) {
            confirmationDiv.innerHTML = "";
        }

        // Validation du numéro de séjour
        if (!validateSejourNumber()) {
            return;
        }
        const sejourNumber = getSejourNumber();

        // Afficher le formulaire si non déjà affiché
        if (fullFormContainer && fullFormContainer.innerHTML.trim() === "") {
            fullFormContainer.innerHTML = generateFormHTML();
            initFormFunctionality(sejourNumber);
        }
    });

    // Génération du HTML du formulaire
    function generateFormHTML() {
        return `
            <div class="col-md-8 mx-auto text-center">
                <form class="reservation-form" aria-live="polite" aria-atomic="true">
                    <div class="form-group mb-3">
                        <label for="NbVisiteurs" class="fs-4">Nombre de visiteurs</label>
                        <input class="form-control" id="NbVisiteurs" type="number" min="1" max="10">
                        <div class="invalid-feedback" id="nbvisiteurs-feedback">Maximum 10 visiteurs autorisé</div>
                    </div>
                    
                    <hr class="separator my-3">
                    
                    <div class="form-group mb-3">
                        <label for="DateVisite" class="fs-4">Date de visite</label>
                        <input type="date" class="form-control" id="DateVisite" required>
                        <div class="invalid-feedback" id="date-feedback">Réservations uniquement les weekends</div>
                    </div>

                    <hr class="separator my-3">
                    <div class="form-group mb-3">
                        <label class="fs-4">Créneau de visite</label>
                        <div class="d-flex justify-content-center justify-content-between">
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="creneau" id="matinCreneau" value="matin" checked>
                                <label class="form-check-label" for="matinCreneau">
                                    10h - 11h30 (Matin)
                                </label>
                                <p class="d-block border" id="places-matin">10 places disponibles</p>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="creneau" id="midiCreneau" value="midi">
                                <label class="form-check-label" for="midiCreneau">
                                    14h - 15h30 (Après-midi)
                                </label>
                                <p class="d-block border" id="places-midi">10 places disponibles</p>
                            </div>
                        </div>
                        <div class="invalid-feedback" id="creneau-feedback">Ce créneau est complet</div>
                    </div>

                    <div class="mb-3 mt-3">
                        <meteo-widget></meteo-widget>
                    </div>
                    
                    <div class="d-flex justify-content-center mb-3 mt-4">
                        <button type="button" class="btn-reservation submit-reservation-btn">
                            <span class="btn-text">
                                Réserver ma visite
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    // Initialisation et gestion des interactions du formulaire
    function initFormFunctionality(sejourNumber) {
        const formElements = {
            form: document.querySelector(".reservation-form"),
            nbVisiteurs: document.getElementById("NbVisiteurs"),
            date: document.getElementById("DateVisite"),
            matinRadio: document.getElementById("matinCreneau"),
            midiRadio: document.getElementById("midiCreneau"),
            submitBtn: document.querySelector(".submit-reservation-btn"),
            feedbacks: {
                nbVisiteurs: document.getElementById("nbvisiteurs-feedback"),
                date: document.getElementById("date-feedback"),
                creneau: document.getElementById("creneau-feedback")
            }
        };

        // Configurer le champ de date en fonction du séjour
        setupDateInputForSejour(formElements.date, sejourNumber);

        // Initialiser les valeurs par défaut
        setDefaultValues(formElements, sejourNumber);

        // Mettre à jour les places disponibles pour la date par défaut
        updatePlacesDisponibles(formElements.date.value, formElements);

        // Mettre à jour le composant météo avec la date par défaut
        updateMeteoWidget(formElements.date.value);

        // Attacher les écouteurs d'événements
        attachEventListeners(formElements, sejourNumber);
    }

    // Configuration des valeurs par défaut
    function setDefaultValues(elements, sejourNumber) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        elements.nbVisiteurs.value = 1;

        // Trouver le prochain weekend dans la période du séjour
        let nextDate = new Date(tomorrow);
        let dateStr = nextDate.toISOString().split('T')[0];

        // Avancer jour par jour jusqu'à trouver un weekend valide dans la période du séjour
        while (!isWeekend(dateStr) || !isDateInSejourPeriod(dateStr, sejourNumber)) {
            nextDate.setDate(nextDate.getDate() + 1);
            dateStr = nextDate.toISOString().split('T')[0];

            // Éviter une boucle infinie si aucun weekend n'est disponible dans la période du séjour
            if (nextDate > new Date(elements.date.max)) {
                break;
            }
        }

        // Si on a trouvé une date valide, l'utiliser
        if (isDateInSejourPeriod(dateStr, sejourNumber) && isWeekend(dateStr)) {
            elements.date.value = dateStr;
        } else {
            // Sinon utiliser la première date disponible même si ce n'est pas un weekend
            elements.date.value = elements.date.min;
            // Et afficher un message
            elements.feedbacks.date.textContent = "Aucun weekend disponible dans votre période de séjour";
            elements.date.classList.add("is-invalid");
            elements.feedbacks.date.style.display = "block";
        }
    }

    // Attache tous les écouteurs d'événements nécessaires
    function attachEventListeners(elements, sejourNumber) {
        // Écouteur pour le changement de date
        elements.date.addEventListener("change", function () {
            // Réinitialiser le message d'erreur
            elements.feedbacks.date.textContent = "Réservations uniquement les weekends";

            // Vérifier si la date est dans la période du séjour
            if (!isDateInSejourPeriod(this.value, sejourNumber)) {
                elements.date.classList.add("is-invalid");
                elements.feedbacks.date.textContent = "La date doit être pendant votre séjour";
                elements.feedbacks.date.style.display = "block";
                return;
            }

            // Vérifier si c'est un weekend
            if (!isWeekend(this.value)) {
                elements.date.classList.add("is-invalid");
                elements.feedbacks.date.style.display = "block";
                return;
            }

            // Si tout est OK
            elements.date.classList.remove("is-invalid");
            elements.feedbacks.date.style.display = "none";

            updateMeteoWidget(this.value);
            updatePlacesDisponibles(this.value, elements);
            updateNbVisiteursMaximum(this.value, elements);
        });

        // Écouteurs pour les créneaux
        elements.matinRadio.addEventListener("change", () => {
            if (elements.matinRadio.checked) {
                updateNbVisiteursMaximum(elements.date.value, elements);
            }
        });

        elements.midiRadio.addEventListener("change", () => {
            if (elements.midiRadio.checked) {
                updateNbVisiteursMaximum(elements.date.value, elements);
            }
        });

        // Écouteur pour le nombre de visiteurs
        elements.nbVisiteurs.addEventListener("change", function () {
            if (this.value > parseInt(this.max)) this.value = this.max;
            if (this.value < 1) this.value = 1;
        });

        // Écouteur pour le bouton de soumission
        elements.submitBtn.addEventListener("click", function (event) {
            event.preventDefault();
            processReservation(elements, sejourNumber);
        });
    }

    // Traitement de la réservation
    function processReservation(elements, sejourNumber) {
        const nbVisiteurs = parseInt(elements.nbVisiteurs.value);
        const creneauSelectionne = elements.matinRadio.checked ? 'matin' : 'midi';

        // Validations
        if (!validateReservation(elements, nbVisiteurs, creneauSelectionne, sejourNumber)) {
            return;
        }

        // Générer le code de réservation
        const codeReservation = generateReservationCode(elements.date.value);

        // Préparer les données
        const formData = {
            numeroSejour: sejourNumber,
            codeReservation: codeReservation,
            nbVisiteurs: nbVisiteurs,
            date: elements.date.value,
            creneau: creneauSelectionne
        };

        // Enregistrer et mettre à jour
        saveReservation(elements.date.value, creneauSelectionne, nbVisiteurs);

        // Masquer le formulaire et afficher la confirmation
        fullFormContainer.style.display = "none";
        fullFormContainer.innerHTML = "";
        document.querySelector(".sejour-resa-input").value = "";

        displayConfirmation(formData);
    }

    // Validation de la réservation
    function validateReservation(elements, nbVisiteurs, creneauSelectionne, sejourNumber) {
        // Vérifier le nombre de visiteurs
        if (nbVisiteurs < 1 || nbVisiteurs > parseInt(elements.nbVisiteurs.max)) {
            elements.nbVisiteurs.classList.add("is-invalid");
            elements.feedbacks.nbVisiteurs.style.display = "block";
            return false;
        } else {
            elements.nbVisiteurs.classList.remove("is-invalid");
            elements.feedbacks.nbVisiteurs.style.display = "none";
        }

        // Vérifier si la date est dans la période du séjour
        if (!isDateInSejourPeriod(elements.date.value, sejourNumber)) {
            elements.date.classList.add("is-invalid");
            elements.feedbacks.date.textContent = "La date doit être pendant votre séjour";
            elements.feedbacks.date.style.display = "block";
            return false;
        }

        // Vérifier la date (weekend)
        if (!isWeekend(elements.date.value)) {
            elements.date.classList.add("is-invalid");
            elements.feedbacks.date.textContent = "Réservations uniquement les weekends";
            elements.feedbacks.date.style.display = "block";
            return false;
        } else {
            elements.date.classList.remove("is-invalid");
            elements.feedbacks.date.style.display = "none";
        }

        // Vérifier la disponibilité du créneau
        const isMatinDisabled = elements.matinRadio.disabled && creneauSelectionne === 'matin';
        const isMidiDisabled = elements.midiRadio.disabled && creneauSelectionne === 'midi';

        if (isMatinDisabled || isMidiDisabled) {
            elements.feedbacks.creneau.style.display = "block";
            return false;
        }

        return true;
    }

    // Affiche la confirmation de réservation
    function displayConfirmation(formData) {
        const creneauText = formData.creneau === 'matin' ? '10h - 11h30' : '14h - 15h30';

        confirmationDiv.innerHTML = `
            <div class="reservation-confirmation p-4 my-3 text-center border rounded">
                <h1 class="mb-3">Réservation confirmée !</h1>
                <div class="reservation-details text-start bg-light p-3 rounded mx-auto" style="max-width: 400px;">
                    <p><strong>Date :</strong> ${formatDate(formData.date)}</p>
                    <p><strong>Créneau :</strong> ${creneauText}</p>
                    <p><strong>Visiteurs :</strong> ${formData.nbVisiteurs}</p>
                    <p><strong>Durée de la visite :</strong> 90 minutes</p>
                </div>
                <p class="mt-3 fs-3 fw-semibold">Conservez votre code de réservation pour la visite.</p>
                <div class="row justify-content-center">
                    <p class="fw-bold col-5 fs-4 p-2">Code de réservation :</p>
                    <p class="reservation-number fs-4 bg-light p-2 rounded col-5">${formData.codeReservation}</p>
                </div>
            </div>
        `;

        // Faire défiler la page vers la confirmation
        confirmationDiv.scrollIntoView({ behavior: 'smooth' });
        console.log("Données de réservation:", formData);
    }

    // Mise à jour du composant météo
    function updateMeteoWidget(date) {
        const meteoWidget = document.querySelector("meteo-widget");
        if (meteoWidget) {
            meteoWidget.setAttribute("date", date);
        }
    }

    // Vérification de la date (weekend)
    function checkDate(elements) {
        return isWeekend(elements.date.value);
    }

    // Fonction pour vérifier si une date est un weekend
    function isWeekend(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDay();
        return day === 0 || day === 6; // 0 = Dimanche, 6 = Samedi
    }

    // Nombre de places déjà réservées
    function getPlacesReservees(date, creneau) {
        const reservations = JSON.parse(localStorage.getItem('bagneReservations')) || {};
        if (!reservations[date] || !reservations[date][creneau]) {
            return 0;
        }
        return reservations[date][creneau];
    }

    // Enregistrement d'une réservation
    function saveReservation(date, creneau, nbPersonnes) {
        const reservations = JSON.parse(localStorage.getItem('bagneReservations')) || {};

        if (!reservations[date]) {
            reservations[date] = {};
        }

        if (!reservations[date][creneau]) {
            reservations[date][creneau] = 0;
        }

        reservations[date][creneau] += nbPersonnes;
        localStorage.setItem('bagneReservations', JSON.stringify(reservations));
    }

    // Mise à jour des places disponibles
    function updatePlacesDisponibles(date, elements) {
        const placesMatinElement = document.getElementById("places-matin");
        const placesMidiElement = document.getElementById("places-midi");

        const matinReservees = getPlacesReservees(date, 'matin');
        const midiReservees = getPlacesReservees(date, 'midi');

        const matinDisponibles = MAX_PLACES - matinReservees;
        const midiDisponibles = MAX_PLACES - midiReservees;

        placesMatinElement.textContent = `${matinDisponibles} places disponibles`;
        placesMidiElement.textContent = `${midiDisponibles} places disponibles`;

        // Gestion des créneaux complets
        handleFullSlots(elements, matinDisponibles, midiDisponibles);

        updateNbVisiteursMaximum(date, elements);
    }

    // Gestion des créneaux complets
    function handleFullSlots(elements, matinDisponibles, midiDisponibles) {
        const placesMatinElement = document.getElementById("places-matin");
        const placesMidiElement = document.getElementById("places-midi");

        // Créneau matin
        if (matinDisponibles <= 0) {
            elements.matinRadio.disabled = true;
            placesMatinElement.textContent = "Complet";

            // Si matin sélectionné mais complet, basculer sur midi
            if (elements.matinRadio.checked && midiDisponibles > 0) {
                elements.midiRadio.checked = true;
            }
        } else {
            elements.matinRadio.disabled = false;
        }

        // Créneau midi
        if (midiDisponibles <= 0) {
            elements.midiRadio.disabled = true;
            placesMidiElement.textContent = "Complet";

            // Si midi sélectionné mais complet, basculer sur matin
            if (elements.midiRadio.checked && matinDisponibles > 0) {
                elements.matinRadio.checked = true;
            }
        } else {
            elements.midiRadio.disabled = false;
        }

        // Message si tous les créneaux sont complets
        if (matinDisponibles <= 0 && midiDisponibles <= 0) {
            elements.feedbacks.creneau.textContent = "Tous les créneaux sont complets pour cette date";
            elements.feedbacks.creneau.style.display = "block";
        } else {
            elements.feedbacks.creneau.style.display = "none";
        }
    }

    // Mise à jour du maximum de visiteurs selon places disponibles
    function updateNbVisiteursMaximum(date, elements) {
        const creneauSelectionne = elements.matinRadio.checked ? 'matin' : 'midi';
        const placesReservees = getPlacesReservees(date, creneauSelectionne);
        const placesDisponibles = MAX_PLACES - placesReservees;

        elements.nbVisiteurs.max = Math.max(1, placesDisponibles);

        // Ajuster si la valeur actuelle dépasse le maximum
        if (parseInt(elements.nbVisiteurs.value) > placesDisponibles) {
            elements.nbVisiteurs.value = placesDisponibles;
        }
    }

    // Génère un code de réservation pour le bagne (format: BAYYMMXXXX)
    function generateReservationCode(dateStr) {
        const date = new Date(dateStr);
        const year = date.getFullYear().toString().slice(-2); // Derniers deux chiffres de l'année
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mois avec leading zero

        // Récupérer toutes les réservations existantes du bagne
        const reservations = JSON.parse(localStorage.getItem('bagneReservations')) || {};

        // Convertir les réservations en tableau plat pour faciliter le filtrage
        const allReservations = [];
        for (const [date, creneaux] of Object.entries(reservations)) {
            for (const [creneau, places] of Object.entries(creneaux)) {
                allReservations.push({ date, creneau, places });
            }
        }

        // Récupérer les compteurs de réservation existants
        const reservationCounts = JSON.parse(localStorage.getItem('bagneReservationCounts')) || {};

        // Filtrer pour obtenir toutes les réservations du mois actuel
        const currentMonthPrefix = `BA${year}${month}`;

        // Trouver le dernier numéro utilisé pour ce mois/année
        let maxNumber = 0;

        // Parcourir les compteurs existants pour trouver le maximum
        for (const [dateKey, count] of Object.entries(reservationCounts)) {
            const resDate = new Date(dateKey);
            const resYear = resDate.getFullYear().toString().slice(-2);
            const resMonth = (resDate.getMonth() + 1).toString().padStart(2, '0');

            if (resYear === year && resMonth === month && count > maxNumber) {
                maxNumber = count;
            }
        }

        // Incrémenter le compteur
        const nextNumber = maxNumber + 1;

        // Sauvegarder le compteur mis à jour
        if (!reservationCounts[dateStr]) {
            reservationCounts[dateStr] = 0;
        }
        reservationCounts[dateStr] = nextNumber;
        localStorage.setItem('bagneReservationCounts', JSON.stringify(reservationCounts));

        // Formater le numéro à 4 chiffres avec des zéros devant
        const formattedNumber = nextNumber.toString().padStart(4, '0');

        return `BA${year}${month}${formattedNumber}`;
    }
});
