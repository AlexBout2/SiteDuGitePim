import {
    validateSejourNumber, getSejourNumber, formatDate, setupDateInputForSejour, isDateInSejourPeriod,
} from '../../js/utils.js';

window.addEventListener("DOMContentLoaded", function () {
    window.formSejourNumber = null;
    const resaCheckButton = document.querySelector(".sejour-validation");

    resaCheckButton.addEventListener("click", function (event) {
        event.preventDefault();
        const fullFormContainer = document.querySelector(".fullForm");

        //Vider les réservation précédentes 
        const confirmationDiv = document.querySelector(".confirm-resa");
        if (confirmationDiv) {
            confirmationDiv.innerHTML = "";
        }

        // Appel sans paramètres, comme défini dans utils.js
        if (!validateSejourNumber()) {
            return;
        }

        // Utiliser getSejourNumber() pour récupérer la valeur
        window.formSejourNumber = getSejourNumber();

        let sejourNumber = getSejourNumber();

        if (fullFormContainer && fullFormContainer.innerHTML.trim() === "") {



            // Formulaire pour réservation au restaurant
            const formHTML = `
                <div class="col-md-8 mx-auto text-center">
                    <form class="reservation-form" aria-live="polite" aria-atomic="true">
                        <div class="form-group mb-3">
                            <label for="NbPersonnes" class="fs-4">Nombre de personnes</label>
                            <input class="form-control" id="NbPersonnes" type="number" min="1" max="8">
                            <div class="invalid-feedback" id="nbpersonnes-feedback">Nombre de personnes invalide (maximum 8 par table)</div>
                        </div>
                        
                        <hr class="separator my-3">
                        
                        <div class="form-group mb-3">
                            <label for="DateReservation" class="fs-4">Date de réservation</label>
                            <input type="date" class="form-control date-reservation" id="DateReservation" required>
                            <div class="invalid-feedback" id="date-feedback">Veuillez sélectionner une date</div>
                        </div>
                        
                        <div class="mb-3 mt-3">
                            <meteo-widget></meteo-widget>
                        </div>
                        
                        <div class="form-group mb-3">
                            <label class="fs-4">Service</label>
                            <div class="d-flex justify-content-between px-5 mt-2">
                                <div class="form-check text-center">
                                    <input class="form-check-input" type="radio" name="typeService" id="serviceMidi" value="midi" checked>
                                    <label class="form-check-label" for="serviceMidi">
                                        Déjeuner
                                    </label>
                                </div>
                                <div class="form-check text-center">
                                    <input class="form-check-input" type="radio" name="typeService" id="serviceSoir" value="soir">
                                    <label class="form-check-label" for="serviceSoir">
                                        Dîner
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group mb-3" id="creneauxContainer">
                            <label class="fs-4">Heure d'arrivée</label>
                            <div id="midi-creneaux" class="d-flex justify-content-around px-4 mt-2">
                                <button type="button" class="btn btn-outline-primary creneau-btn" data-heure="12:00">12h00</button>
                                <button type="button" class="btn btn-outline-primary creneau-btn" data-heure="12:30">12h30</button>
                                <button type="button" class="btn btn-outline-primary creneau-btn" data-heure="13:00">13h00</button>
                            </div>
                            <div id="soir-creneaux" class="d-flex justify-content-around px-4 mt-2 d-none">
                                <button type="button" class="btn btn-outline-primary creneau-btn" data-heure="19:00">19h00</button>
                                <button type="button" class="btn btn-outline-primary creneau-btn" data-heure="19:30">19h30</button>
                                <button type="button" class="btn btn-outline-primary creneau-btn" data-heure="20:00">20h00</button>
                            </div>
                            <input type="hidden" id="HeureArrivee" value="">
                            <div class="invalid-feedback" id="heure-feedback">Veuillez sélectionner une heure d'arrivée</div>
                        </div>
                        
                        <div id="session-warning" class="alert alert-warning d-none mt-3">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            Attention : Plus que <span id="places-restantes">7</span> places disponibles pour ce créneau !
                        </div>
                        
                        <div class="d-flex justify-content-center my-4">
                            <button type="btn-reservation" class="btn-reservation js-valider-reservation">
                            <span class=btn-text>
                                Valider la réservation
                            </span>
                            </button>
                        </div>
                    </form>
                </div>
            `;

            fullFormContainer.innerHTML = formHTML;

            // Gestion des validations et événements après injection du formulaire
            setupFormValidation(window.formSejourNumber);
        }
    });

    // Configuration des validations et interactions du formulaire
    function setupFormValidation(sejourNumber) {
        const nbPersonnesInput = document.getElementById("NbPersonnes");
        const dateReservationInput = document.getElementById("DateReservation");
        const serviceMidiRadio = document.getElementById("serviceMidi");
        const serviceSoirRadio = document.getElementById("serviceSoir");
        const midiCreneaux = document.getElementById("midi-creneaux");
        const soirCreneaux = document.getElementById("soir-creneaux");
        const validerButton = document.querySelector(".js-valider-reservation");
        const sessionWarning = document.getElementById("session-warning");
        const meteoWidget = document.querySelector("meteo-widget");
        setupDateInputForSejour(dateReservationInput, sejourNumber);


        // Définir la date minimum à aujourd'hui
        const today = new Date();
        dateReservationInput.min = today.toISOString().split('T')[0];

        // Mise à jour des disponibilités lors du changement de date
        dateReservationInput.addEventListener("change", function () {
            if (this.value) {
                const service = serviceMidiRadio.checked ? "midi" : "soir";
                checkAvailability(this.value, service);

                // Mise à jour du widget météo
                if (meteoWidget) {
                    meteoWidget.setAttribute("date", this.value);
                }
            }
        });

        // Gestion des services (déjeuner/dîner)
        serviceMidiRadio.addEventListener("change", function () {
            if (this.checked) {
                midiCreneaux.classList.remove("d-none");
                soirCreneaux.classList.add("d-none");
                document.getElementById("HeureArrivee").value = "";

                // Réinitialiser la sélection des créneaux
                resetCreneauxSelection();

                // Vérifier les disponibilités
                const dateValue = dateReservationInput.value;
                if (dateValue) {
                    checkAvailability(dateValue, "midi");
                }
            }
        });

        serviceSoirRadio.addEventListener("change", function () {
            if (this.checked) {
                midiCreneaux.classList.add("d-none");
                soirCreneaux.classList.remove("d-none");
                document.getElementById("HeureArrivee").value = "";

                // Réinitialiser la sélection des créneaux
                resetCreneauxSelection();

                // Vérifier les disponibilités
                const dateValue = dateReservationInput.value;
                if (dateValue) {
                    checkAvailability(dateValue, "soir");
                }
            }
        });

        // Gestion des créneaux horaires
        const creneauxButtons = document.querySelectorAll(".creneau-btn");
        creneauxButtons.forEach(button => {
            button.addEventListener("click", function () {
                // Désélectionner tous les autres boutons
                creneauxButtons.forEach(btn => {
                    btn.classList.remove("btn-primary");
                    btn.classList.add("btn-outline-primary");
                });

                // Sélectionner ce bouton
                this.classList.remove("btn-outline-primary");
                this.classList.add("btn-primary");

                // Mettre à jour la valeur de l'heure
                document.getElementById("HeureArrivee").value = this.dataset.heure;

                // Vérifier si le créneau est presque complet
                if (this.dataset.placesRestantes && parseInt(this.dataset.placesRestantes) < 8) {
                    sessionWarning.classList.remove("d-none");
                    document.getElementById("places-restantes").textContent = this.dataset.placesRestantes;
                } else {
                    sessionWarning.classList.add("d-none");
                }

                // Mettre à jour l'état du bouton
                updateFormValidState();
            });
        });

        // Validation du nombre de personnes
        nbPersonnesInput.addEventListener("input", function () {
            updateFormValidState();
        });

        // Validation finale et soumission
        validerButton.addEventListener("click", function () {
            // Valider tous les champs
            if (!validateForm(sejourNumber)) { // Passez sejourNumber en paramètre
                return;
            }

            const codeReservation = generateReservationCode();

            // Collecter les données du formulaire
            const formData = {
                numeroSejour: sejourNumber,
                nbPersonnes: nbPersonnesInput.value,
                dateReservation: dateReservationInput.value,
                service: serviceMidiRadio.checked ? "midi" : "soir",
                heureArrivee: document.getElementById("HeureArrivee").value,
                codeReservation: codeReservation
            };

            // Enregistrer la réservation
            saveReservation(formData);

            // Afficher la confirmation
            displayConfirmation(formData);
        });
    }

    // Réinitialiser la sélection des créneaux
    function resetCreneauxSelection() {
        const creneauxButtons = document.querySelectorAll(".creneau-btn");
        creneauxButtons.forEach(button => {
            button.classList.remove("btn-primary");
            button.classList.add("btn-outline-primary");
        });

        document.getElementById("session-warning").classList.add("d-none");
    }

    const dateInputs = document.getElementsByClassName("date-reservation");
    if (dateInputs && dateInputs.length > 0) {
        for (let i = 0; i < dateInputs.length; i++) {
            setupDateInputForSejour(dateInputs[i], sejourNumber);
        }
    }

    // Vérifier et mettre à jour l'état de validité du formulaire
    function updateFormValidState() {
        const nbPersonnes = document.getElementById("NbPersonnes").value;
        const dateReservation = document.getElementById("DateReservation").value;
        const heureArrivee = document.getElementById("HeureArrivee").value;
        const validerButton = document.querySelector(".js-valider-reservation");

        if (validerButton) {
            const originalClickHandler = validerButton.onclick;

            validerButton.onclick = function (e) {
                e.preventDefault();


                let isValid = true;

                // Vérifier toutes les dates du formulaire
                const dateFields = document.getElementsByClassName("date-reservation");
                if (dateFields && dateFields.length > 0) {
                    for (let i = 0; i < dateFields.length; i++) {
                        const dateField = dateFields[i];
                        const dateValue = dateField.value;

                        // Chercher l'élément de feedback le plus proche
                        const feedbackElement = dateField.nextElementSibling?.classList.contains("invalid-feedback")
                            ? dateField.nextElementSibling
                            : document.querySelector(`[data-for="${dateField.id}"]`);

                        if (!dateValue) {
                            if (feedbackElement) {
                                dateField.classList.add("is-invalid");
                                feedbackElement.textContent = "Veuillez sélectionner une date";
                                feedbackElement.style.display = "block";
                            }
                            isValid = false;
                            continue;
                        }

                        if (!isDateInSejourPeriod(dateValue, sejourNumber)) {
                            if (feedbackElement) {
                                dateField.classList.add("is-invalid");
                                feedbackElement.textContent = "La date doit être pendant votre séjour";
                                feedbackElement.style.display = "block";
                            }
                            isValid = false;
                            continue;
                        }

                        // Si la date est valide, retirer la classe d'erreur
                        dateField.classList.remove("is-invalid");
                    }
                }

                // Si toutes les dates sont valides et qu'il y avait un gestionnaire d'origine
                if (isValid && typeof originalClickHandler === 'function') {
                    return originalClickHandler.call(this, e);
                }

                return isValid;
            };

            const isFormValid =
                nbPersonnes &&
                parseInt(nbPersonnes) >= 1 &&
                parseInt(nbPersonnes) <= 8 &&
                dateReservation &&
                heureArrivee;

            validerButton.disabled = !isFormValid;

            // Mise à jour visuelle des états de validation
            document.getElementById("NbPersonnes").classList.toggle("is-invalid",
                nbPersonnes && (parseInt(nbPersonnes) < 1 || parseInt(nbPersonnes) > 8));

            document.getElementById("DateReservation").classList.toggle("is-invalid", !dateReservation);
        }
    }

    // Validation complète du formulaire avant soumission
    function validateForm(sejourNumber) {
        let isValid = true;

        // Valider le nombre de personnes
        const nbPersonnes = document.getElementById("NbPersonnes");
        if (!nbPersonnes.value || parseInt(nbPersonnes.value) < 1 || parseInt(nbPersonnes.value) > 8) {
            nbPersonnes.classList.add("is-invalid");
            document.getElementById("nbpersonnes-feedback").style.display = "block";
            isValid = false;
        } else {
            nbPersonnes.classList.remove("is-invalid");
            document.getElementById("nbpersonnes-feedback").style.display = "none";
        }

        // Valider la date avec le sejourNumber passé en paramètre
        const dateField = document.getElementById("DateReservation");
        const dateValue = dateField.value;
        const dateFeedback = document.getElementById("date-feedback");

        if (!dateValue) {
            dateField.classList.add("is-invalid");
            dateFeedback.textContent = "Veuillez sélectionner une date";
            dateFeedback.style.display = "block";
            isValid = false;
        } else if (!isDateInSejourPeriod(dateValue, sejourNumber)) {
            dateField.classList.add("is-invalid");
            dateFeedback.textContent = "La date doit être pendant votre séjour";
            dateFeedback.style.display = "block";
            isValid = false;
        } else {
            dateField.classList.remove("is-invalid");
            dateFeedback.style.display = "none";
        }

        // Valider l'heure
        const heureArrivee = document.getElementById("HeureArrivee").value;
        if (!heureArrivee) {
            document.getElementById("creneauxContainer").classList.add("is-invalid");
            document.getElementById("heure-feedback").style.display = "block";
            isValid = false;
        } else {
            document.getElementById("creneauxContainer").classList.remove("is-invalid");
            document.getElementById("heure-feedback").style.display = "none";
        }
        return isValid;
    }


    // Vérifier les disponibilités des créneaux
    function checkAvailability(date, service) {
        // Récupérer les réservations existantes
        const existingReservations = getReservations();

        // Récupérer les conteneurs de créneaux
        const creneauxContainer = service === "midi" ?
            document.getElementById("midi-creneaux") :
            document.getElementById("soir-creneaux");

        // Pour chaque créneau
        const creneauxButtons = creneauxContainer.querySelectorAll(".creneau-btn");

        creneauxButtons.forEach(button => {
            const heure = button.dataset.heure;
            const originalText = heure.replace(":00", "h00").replace(":30", "h30"); // Format original (12h00, etc.)

            // Compter les personnes déjà réservées pour ce créneau
            let personnesReservees = 0;

            existingReservations.forEach(resa => {
                if (resa.dateReservation === date &&
                    resa.service === service &&
                    resa.heureArrivee === heure) {
                    personnesReservees += parseInt(resa.nbPersonnes);
                }
            });

            const placesRestantes = 30 - personnesReservees;

            // Mettre à jour l'état et le texte du bouton
            if (placesRestantes <= 0) {
                // Créneau complet
                button.disabled = true;
                button.classList.remove("btn-outline-primary", "btn-primary");
                button.classList.add("btn-secondary");
                button.dataset.placesRestantes = 0;
                button.innerHTML = `${originalText} (Complet)`;
            } else {
                // Créneau disponible
                button.disabled = false;
                button.innerHTML = `${originalText} (${placesRestantes} places)`;
                button.dataset.placesRestantes = placesRestantes;
            }
        });

        // Mettre à jour l'état du bouton de validation
        updateFormValidState();
    }

    // Générer un code de réservation au format REAAMM000x
    function generateReservationCode() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2); // Derniers 2 chiffres de l'année
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        // Récupérer le numéro incrémental depuis les réservations existantes
        const reservations = getReservations();

        // Filtrer les réservations du mois en cours
        const currentMonthReservations = reservations.filter(r => {
            return r.codeReservation &&
                r.codeReservation.startsWith(`RE${year}${month}`);
        });

        // Déterminer le numéro incrémental
        const nextNumber = currentMonthReservations.length + 1;

        // Formatter le numéro incrémental avec des zéros devant
        const formattedNumber = nextNumber.toString().padStart(4, '0');

        return `RE${year}${month}${formattedNumber}`;
    }

    // Récupérer les réservations existantes
    function getReservations() {
        const reservationsJSON = localStorage.getItem('restaurantReservations');
        return reservationsJSON ? JSON.parse(reservationsJSON) : [];
    }

    // Enregistrer une réservation
    function saveReservation(reservation) {
        // Récupérer les réservations existantes
        const reservations = getReservations();

        // Ajouter la nouvelle réservation
        reservations.push(reservation);

        // Enregistrer dans le localStorage
        localStorage.setItem('restaurantReservations', JSON.stringify(reservations));
    }



    // Afficher la confirmation de réservation
    function displayConfirmation(formData) {
        const confirmationDiv = document.querySelector(".confirm-resa");
        const fullFormContainer = document.querySelector(".fullForm");

        // Cacher le formulaire
        fullFormContainer.innerHTML = "";
        const heureFormatee = formData.heureArrivee.replace(":00", "h00").replace(":30", "h30");

        // Afficher la confirmation
        confirmationDiv.innerHTML = `
        <div class="reservation-confirmation p-4 my-3 text-center border rounded w-100">
            <h1 class="mb-3">Réservation confirmée !</h1>
            
            <div class="details-resa" text-start bg-light p-3 rounded mx-auto" style="max-width: 400px;">
                <p><strong>Date de réservation :</strong> ${formatDate(formData.dateReservation)}</p>
                <p><strong>Service :</strong> ${formData.service === "midi" ? "Déjeuner" : "Dîner"}</p>
                <p><strong>Nombre de personnes :</strong> ${formData.nbPersonnes}</p>
                <p><strong>Heure d'arrivée :</strong> ${heureFormatee}</p>
            </div>
            
            <hr class="my-3">
            
            <p class="mt-3 fs-3 fw-semibold">Conservez votre code de réservation :</p>
            <div class="row justify-content-center">
                <p class="fw-bold col-5 fs-4 p-2">Code de réservation:</p>
                <p class="reservation-number fs-4 bg-light p-2 rounded col-5">${formData.codeReservation}</p>
            </div>
        </div>
        `;

        confirmationDiv.style.display = "block";
        // Faire défiler la page vers la confirmation
        setTimeout(() => {
            confirmationDiv.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

});
