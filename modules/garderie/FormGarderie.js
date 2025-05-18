import { validateSejourNumber, getSejourNumber, formatDate, setupDateInputForSejour, isDateInSejourPeriod } from '../../js/utils.js';

window.addEventListener("DOMContentLoaded", function () {
    const resaCheckButton = document.querySelector(".sejour-validation");
    const fullFormContainer = document.querySelector(".fullForm");
    const confirmationDiv = document.querySelector(".confirm-resa");

    // Constantes de configuration
    const MAX_CAPACITY = 15;
    const MAX_HOURS = 4;

    if (!resaCheckButton) {
        console.error("Bouton de validation du séjour non trouvé!");
        return;
    }

    resaCheckButton.addEventListener("click", function (event) {
        event.preventDefault();

        // Vider les réservations précédentes
        if (confirmationDiv) {
            confirmationDiv.innerHTML = "";
        }

        console.log("Bouton de réservation cliqué");

        // Validation du numéro de séjour
        if (!validateSejourNumber("Ce numéro de séjour n'existe pas.")) {
            return;
        }

        // Récupérer le numéro de séjour
        const reservationNumber = getSejourNumber();
        if (!reservationNumber) {
            alert("Le numéro de séjour est requis");
            return;
        }

        // Vérifier si le conteneur existe
        if (!fullFormContainer) {
            console.error("Conteneur de formulaire non trouvé!");
            return;
        }

        // Afficher le formulaire
        fullFormContainer.innerHTML = `
            <div class="col-md-8 mx-auto text-center" aria-live="polite" aria-atomic="true">
                <form class="reservation-form"  aria-live="polite" aria-atomic="true">
                    <div class="form-group mb-3">
                        <label for="NbKidGa" class="fs-4">Nombre d'enfants</label>
                        <input class="form-control" id="NbKidGa" type="number" min="1" max="${MAX_CAPACITY}" required>
                        <div class="invalid-feedback" id="nbkids-feedback">Maximum ${MAX_CAPACITY} enfants autorisé</div>
                    </div>
                    <hr class="separator my-3">
                    <div class="form-group mb-3">
                        <label for="DateGa" class="fs-4">Date de la garderie</label>
                        <input type="date" class="form-control" id="DateGa" required>
                        <div class="invalid-feedback" id="date-feedback">Veuillez sélectionner une date pendant votre séjour</div>
                        <div class="availability-info mt-2 text-info" id="date-availability-info"></div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="StartTimeGa" class="fs-4">Heure de début</label>
                                <input type="time" class="form-control" id="StartTimeGa" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="EndTimeGa" class="fs-4">Heure de fin</label>
                                <input type="time" class="form-control" id="EndTimeGa" required>
                                <div class="invalid-feedback" id="duration-feedback">Maximum ${MAX_HOURS} heures de garde</div>
                            </div>
                        </div>
                    </div>
                    <hr class="separator my-3">
                    <meteo-widget date=""></meteo-widget>
                    <hr class="separator my-3">
                    <div class="form-group mb-3">
                        <label for="ReasonGa" class="fs-4">Raison de la garde</label>
                        <textarea class="form-control" id="ReasonGa" rows="3" placeholder="Indiquez la raison de votre demande de garde" required></textarea>
                        <div class="invalid-feedback">Veuillez indiquer une raison pour la garde</div>
                    </div>

                    <hr class="separator my-3">
                    <button type="button" class="btn-reservation btn-lg mt-3 submit-reservation-btn">
                     <span class="btn-text">Réserver la garderie</span>
                    </button>
                </form>
            </div>
        `;

        // Initialiser le formulaire
        initializeForm(reservationNumber);
    });

    function initializeForm(reservationNumber) {
        // Récupérer les éléments du formulaire
        const dateInput = document.getElementById("DateGa");
        const startTimeInput = document.getElementById("StartTimeGa");
        const endTimeInput = document.getElementById("EndTimeGa");
        const nbKidsInput = document.getElementById("NbKidGa");
        const dateFeedback = document.getElementById("date-feedback");

        if (!dateInput) {
            console.error("Champ de date non trouvé!");
            return;
        }

        // Configurer les limites du champ de date selon la période du séjour
        setupDateInputForSejour(dateInput, reservationNumber);

        // Définir la valeur par défaut à aujourd'hui si dans la période du séjour
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        if (isDateInSejourPeriod(todayStr, reservationNumber)) {
            dateInput.value = todayStr;
        } else {
            // Si aujourd'hui n'est pas dans la période du séjour, utiliser la date de début du séjour
            dateInput.value = dateInput.min;
        }

        // Ajouter l'écouteur d'événements pour la date et vérifier disponibilité
        dateInput.addEventListener('change', function () {
            // Vérifier si la date est dans la période du séjour
            if (!isDateInSejourPeriod(this.value, reservationNumber)) {
                this.classList.add("is-invalid");
                if (dateFeedback) {
                    dateFeedback.style.display = "block";
                }
                return;
            } else {
                this.classList.remove("is-invalid");
                if (dateFeedback) {
                    dateFeedback.style.display = "none";
                }
            }

            // Mise à jour du widget météo
            const meteoWidget = document.querySelector("meteo-widget");
            if (meteoWidget) {
                meteoWidget.setAttribute("date", this.value);
            }

            // Vérifier la disponibilité pour cette date
            updateAvailabilityInfo();
        });

        // Vérifier disponibilité initiale
        updateAvailabilityInfo();

        // Initialiser le widget météo
        const meteoWidget = document.querySelector("meteo-widget");
        if (meteoWidget) {
            meteoWidget.setAttribute("date", dateInput.value);
        } else {
            console.error("Widget météo non trouvé!");
        }

        // Initialiser les heures par défaut
        if (startTimeInput) startTimeInput.value = "09:00";
        if (endTimeInput) endTimeInput.value = "12:00";

        // Ajouter l'écouteur d'événements au bouton de soumission
        const submitButton = document.querySelector('.submit-reservation-btn');
        if (submitButton) {
            submitButton.addEventListener('click', function (e) {
                e.preventDefault();
                validateAndSubmitForm(reservationNumber);
            });
        } else {
            console.error("Bouton de soumission non trouvé!");
        }

        // Écouteur pour le champ de nombre d'enfants
        if (nbKidsInput) {
            nbKidsInput.addEventListener('input', function () {
                updateAvailabilityInfo();
            });
        }

        // Ajouter des écouteurs pour valider la durée de garde
        const durationFeedback = document.getElementById("duration-feedback");

        if (startTimeInput && endTimeInput) {
            const checkDuration = function () {
                if (startTimeInput.value && endTimeInput.value) {
                    const start = new Date(`2000-01-01T${startTimeInput.value}`);
                    const end = new Date(`2000-01-01T${endTimeInput.value}`);
                    const duration = (end - start) / (1000 * 60 * 60); // durée en heures

                    if (duration <= 0 || duration > MAX_HOURS) {
                        endTimeInput.classList.add("is-invalid");
                        if (durationFeedback) durationFeedback.style.display = "block";
                        return false;
                    } else {
                        endTimeInput.classList.remove("is-invalid");
                        if (durationFeedback) durationFeedback.style.display = "none";
                        return true;
                    }
                }
                return false;
            };

            startTimeInput.addEventListener('change', function () {
                checkDuration();
                updateAvailabilityInfo();
            });

            endTimeInput.addEventListener('change', function () {
                checkDuration();
                updateAvailabilityInfo();
            });
        } else {
            console.error("Champs d'heure non trouvés!");
        }
    }

    function updateAvailabilityInfo() {
        const dateInput = document.getElementById("DateGa");
        const startTimeInput = document.getElementById("StartTimeGa");
        const endTimeInput = document.getElementById("EndTimeGa");
        const nbKidsInput = document.getElementById("NbKidGa");
        const availabilityInfo = document.getElementById("date-availability-info");

        if (!dateInput || !startTimeInput || !endTimeInput || !nbKidsInput || !availabilityInfo) {
            return;
        }

        const selectedDate = dateInput.value;
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;
        const nbKidsRequested = parseInt(nbKidsInput.value) || 0;

        if (!selectedDate || !startTime || !endTime) {
            availabilityInfo.textContent = "";
            return;
        }

        // Calculer les places déjà réservées pour cette période
        const placesReservees = getReservedPlaces(selectedDate, startTime, endTime);
        const placesDisponibles = MAX_CAPACITY - placesReservees;

        // Mettre à jour le message de disponibilité
        if (placesDisponibles <= 0) {
            availabilityInfo.textContent = "Aucune place disponible pour cette période.";
            availabilityInfo.className = "availability-info mt-2 text-danger fw-bold";

            // Désactiver le bouton de réservation
            const submitButton = document.querySelector('.submit-reservation-btn');
            if (submitButton) submitButton.disabled = true;
        } else {
            availabilityInfo.textContent = `${placesDisponibles} places disponibles pour cette période.`;
            availabilityInfo.className = "availability-info mt-2 text-success";

            // Vérifier si le nombre d'enfants demandé est disponible
            if (nbKidsRequested > placesDisponibles) {
                nbKidsInput.classList.add("is-invalid");
                document.getElementById("nbkids-feedback").textContent = `Seulement ${placesDisponibles} places disponibles.`;

                // Désactiver le bouton de réservation
                const submitButton = document.querySelector('.submit-reservation-btn');
                if (submitButton) submitButton.disabled = true;
            } else if (nbKidsRequested > 0) {
                nbKidsInput.classList.remove("is-invalid");

                // Réactiver le bouton de réservation
                const submitButton = document.querySelector('.submit-reservation-btn');
                if (submitButton) submitButton.disabled = false;
            }
        }

        // Ajuster le maximum autorisé
        nbKidsInput.max = Math.min(MAX_CAPACITY, placesDisponibles);
    }

    function getReservedPlaces(date, startTime, endTime) {
        // Si les paramètres ne sont pas valides, retourner 0
        if (!date || !startTime || !endTime) return 0;

        const reservations = JSON.parse(localStorage.getItem('garderieReservations')) || [];
        let totalPlacesReservees = 0;

        // Convertir les heures en objets Date pour comparaison
        const requestStart = new Date(`${date}T${startTime}`);
        const requestEnd = new Date(`${date}T${endTime}`);

        // Ne prendre en compte que les réservations pour la date sélectionnée
        // qui chevauchent la période demandée
        reservations.forEach(reservation => {
            if (reservation.date === date) {
                const reservationStart = new Date(`${date}T${reservation.startTime}`);
                const reservationEnd = new Date(`${date}T${reservation.endTime}`);

                // Vérifier si la réservation chevauche la période demandée
                if ((reservationStart < requestEnd) && (reservationEnd > requestStart)) {
                    totalPlacesReservees += parseInt(reservation.nbKids);
                }
            }
        });

        return totalPlacesReservees;
    }

    function validateAndSubmitForm(reservationNumber) {
        // Récupérer les valeurs du formulaire
        const nbKids = document.getElementById("NbKidGa");
        const dateInput = document.getElementById("DateGa");
        const startTimeInput = document.getElementById("StartTimeGa");
        const endTimeInput = document.getElementById("EndTimeGa");
        const reasonTextarea = document.getElementById("ReasonGa");

        // Vérifier que tous les éléments existent
        if (!nbKids || !dateInput || !startTimeInput || !endTimeInput || !reasonTextarea) {
            console.error("Certains éléments du formulaire n'ont pas été trouvés!");
            return;
        }

        // Valider que la date est dans la période du séjour
        if (!isDateInSejourPeriod(dateInput.value, reservationNumber)) {
            dateInput.classList.add("is-invalid");
            document.getElementById("date-feedback").style.display = "block";
            return;
        } else {
            dateInput.classList.remove("is-invalid");
        }

        // Valider le nombre d'enfants
        if (!nbKids.value || nbKids.value < 1 || nbKids.value > MAX_CAPACITY) {
            nbKids.classList.add("is-invalid");
            return;
        } else {
            nbKids.classList.remove("is-invalid");
        }

        // Valider la date
        if (!dateInput.value) {
            dateInput.classList.add("is-invalid");
            return;
        } else {
            dateInput.classList.remove("is-invalid");
        }

        // Valider l'heure de début
        if (!startTimeInput.value) {
            startTimeInput.classList.add("is-invalid");
            return;
        } else {
            startTimeInput.classList.remove("is-invalid");
        }

        // Valider l'heure de fin
        if (!endTimeInput.value) {
            endTimeInput.classList.add("is-invalid");
            return;
        }

        // Valider la raison de garde
        if (!reasonTextarea.value.trim()) {
            reasonTextarea.classList.add("is-invalid");
            return;
        } else {
            reasonTextarea.classList.remove("is-invalid");
        }

        // Valider la durée
        const start = new Date(`2000-01-01T${startTimeInput.value}`);
        const end = new Date(`2000-01-01T${endTimeInput.value}`);
        const duration = (end - start) / (1000 * 60 * 60); // durée en heures

        if (duration <= 0 || duration > MAX_HOURS) {
            endTimeInput.classList.add("is-invalid");
            document.getElementById("duration-feedback").style.display = "block";
            return;
        } else {
            endTimeInput.classList.remove("is-invalid");
            document.getElementById("duration-feedback").style.display = "none";
        }

        // Vérifier la disponibilité
        const nbKidsRequested = parseInt(nbKids.value);
        const placesReservees = getReservedPlaces(dateInput.value, startTimeInput.value, endTimeInput.value);
        const placesDisponibles = MAX_CAPACITY - placesReservees;

        if (nbKidsRequested > placesDisponibles) {
            nbKids.classList.add("is-invalid");
            document.getElementById("nbkids-feedback").textContent = `Seulement ${placesDisponibles} places disponibles.`;
            return;
        }

        // Créer le code de réservation
        const codeReservation = generateReservationCode(dateInput.value);

        // Créer l'objet de réservation
        const reservation = {
            sejourNumber: reservationNumber,
            codeReservation: codeReservation,
            nbKids: nbKidsRequested,
            date: dateInput.value,
            startTime: startTimeInput.value,
            endTime: endTimeInput.value,
            reason: reasonTextarea.value.trim(),
        };

        // Sauvegarder la réservation
        saveGarderieReservation(reservation);

        // Afficher la confirmation
        showConfirmation(reservation);
    }

    // Génère un code de réservation au format GAYYMMXXXX
    function generateReservationCode(dateStr) {
        const date = new Date(dateStr);
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        // Récupérer les compteurs de réservation existants
        const reservationCounts = JSON.parse(localStorage.getItem('garderieReservationCounts')) || {};

        // Filtrer pour obtenir toutes les réservations du mois actuel
        const currentMonthPrefix = `GA${year}${month}`;

        // Parcourir toutes les dates pour trouver des réservations du même mois/année
        let maxNumber = 0;
        for (const [dateKey, count] of Object.entries(reservationCounts)) {
            // Extraire année et mois de la date de chaque réservation
            const resDate = new Date(dateKey);
            const resYear = resDate.getFullYear().toString().slice(-2);
            const resMonth = (resDate.getMonth() + 1).toString().padStart(2, '0');

            // Si même année et même mois, comparer le compteur
            if (resYear === year && resMonth === month && count > maxNumber) {
                maxNumber = count;
            }
        }

        // Incrémenter le compteur pour ce mois
        const nextNumber = maxNumber + 1;

        // Stocker le nouveau compteur
        if (!reservationCounts[dateStr]) {
            reservationCounts[dateStr] = 0;
        }
        reservationCounts[dateStr] = nextNumber;
        localStorage.setItem('garderieReservationCounts', JSON.stringify(reservationCounts));

        // Formater le numéro à 4 chiffres
        const formattedNumber = nextNumber.toString().padStart(4, '0');

        return `GA${year}${month}${formattedNumber}`;
    }

    function saveGarderieReservation(reservation) {
        // Récupérer les réservations existantes
        const garderieReservations = JSON.parse(localStorage.getItem('garderieReservations')) || [];

        // Ajouter la nouvelle réservation
        garderieReservations.push(reservation);

        // Enregistrer dans localStorage
        localStorage.setItem('garderieReservations', JSON.stringify(garderieReservations));
    }

    function showConfirmation(reservation) {
        if (!confirmationDiv) {
            console.error("Div de confirmation non trouvé!");
            return;
        }

        // Formater pour l'affichage
        const startTime = reservation.startTime;
        const endTime = reservation.endTime;

        // Réinitialiser le champ de numéro de séjour
        const sejourInput = document.querySelector(".sejour-resa-input");
        if (sejourInput) sejourInput.value = "";

        // Afficher la confirmation
        confirmationDiv.innerHTML = `
            <div class="reservation-confirmation p-4 my-3 text-center border rounded">
                <h1 class="mb-3">Réservation de garderie confirmée !</h1>
                <div class="reservation-details text-start bg-light p-3 rounded mx-auto" style="max-width: 400px;">
                    <p><strong>Date :</strong> ${formatDate(reservation.date)}</p>
                    <p><strong>Horaires :</strong> ${startTime} - ${endTime}</p>
                    <p><strong>Nombre d'enfants :</strong> ${reservation.nbKids}</p>
                    <p><strong>Raison de la garde :</strong> ${reservation.reason}</p>
                </div>
                <p class="mt-3 fs-3 fw-semibold">Conservez votre code de réservation pour la garderie.</p>
                <div class="row justify-content-center">
                    <p class="fw-bold col-5 fs-4 p-2">Code de réservation :</p>
                    <p class="reservation-number fs-4 bg-light p-2 rounded col-5">${reservation.codeReservation}</p>
                </div>
            </div>
        `;

        // Vider le formulaire
        fullFormContainer.innerHTML = "";

        // Faire défiler vers la confirmation
        confirmationDiv.scrollIntoView({ behavior: 'smooth' });
    }
});
