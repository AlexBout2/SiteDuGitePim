// modules\bagne\form-bagne.js
window.addEventListener("DOMContentLoaded", function () {
    const resaCheckButton = document.querySelector(".sejour-validation");

    const confirmationDiv = document.querySelector(".confirm-resa");
    if (confirmationDiv) {
        confirmationDiv.innerHTML = "";
    }
    resaCheckButton.addEventListener("click", function (event) {
        event.preventDefault();
        const fullFormContainer = document.querySelector(".fullForm");

        if (fullFormContainer && fullFormContainer.innerHTML.trim() === "") {
            // Formulaire pour réservation de visite du bagne (sans commentaires)
            const formHTML = `
                <div class="col-md-8 mx-auto text-center">
                    <form class="reservation-form">
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

                        <!-- Intégration du composant météo comme composant webcomponent -->
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

            fullFormContainer.innerHTML = formHTML;

            // Initialisation des fonctionnalités du formulaire
            initFormFunctionality();
        }
    });

    // Fonction pour initialiser les fonctionnalités du formulaire après injection
    function initFormFunctionality() {
        // Récupérer les éléments du formulaire
        const form = document.querySelector(".reservation-form");
        const nbVisiteursInput = document.getElementById("NbVisiteurs");
        const dateInput = document.getElementById("DateVisite");
        const matinRadio = document.getElementById("matinCreneau");
        const midiRadio = document.getElementById("midiCreneau");
        const placesMatinElement = document.getElementById("places-matin");
        const placesMidiElement = document.getElementById("places-midi");
        const creneauFeedback = document.getElementById("creneau-feedback");
        const meteoWidget = document.querySelector("meteo-widget");
        const submitButton = document.querySelector(".submit-reservation-btn");
        const reservationNumberInput = document.getElementById("reservation-number");

        // Configuration de la date minimum (aujourd'hui)
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;

        // Capacité maximale par créneau
        const CAPACITE_MAX = 10;

        // Vérifier que la date est un weekend (samedi=6 ou dimanche=0)
        function isWeekend(dateStr) {
            const date = new Date(dateStr);
            const day = date.getDay();
            return day === 0 || day === 6; // 0 est dimanche, 6 est samedi
        }

        // Vérifier la validité de la date (weekend uniquement)
        function checkDate() {
            if (dateInput.value) {
                if (!isWeekend(dateInput.value)) {
                    dateInput.classList.add("is-invalid");
                    document.getElementById("date-feedback").style.display = "block";
                    return false;
                } else {
                    dateInput.classList.remove("is-invalid");
                    document.getElementById("date-feedback").style.display = "none";
                    updatePlacesDisponibles(dateInput.value);
                    return true;
                }
            }
            return false; // Si pas de date, c'est invalide
        }

        // Mettre à jour la météo et les places disponibles lorsque la date change
        dateInput.addEventListener("change", function () {
            checkDate(); // Vérifier si c'est un weekend

            // Mettre à jour l'attribut date du composant météo
            if (dateInput.value && meteoWidget) {
                meteoWidget.setAttribute('date', dateInput.value);
            }
        });

        // Mettre à jour l'affichage des places disponibles quand on change de créneau
        matinRadio.addEventListener("change", function () {
            if (dateInput.value) {
                updateNbVisiteursMaximum(dateInput.value);
            }
        });

        midiRadio.addEventListener("change", function () {
            if (dateInput.value) {
                updateNbVisiteursMaximum(dateInput.value);
            }
        });

        // Obtenir le nombre de places réservées pour une date et un créneau
        function getPlacesReservees(date, creneau) {
            const key = `bagne_places_${date}_${creneau}`;
            const places = localStorage.getItem(key);
            return places ? parseInt(places) : 0;
        }

        // Sauvegarder le nombre de places réservées
        function saveReservation(date, creneau, nbPersonnes) {
            const key = `bagne_places_${date}_${creneau}`;
            const placesActuelles = getPlacesReservees(date, creneau);
            const nouvellePlaces = placesActuelles + parseInt(nbPersonnes);
            localStorage.setItem(key, nouvellePlaces);
        }

        // Mettre à jour l'affichage des places disponibles
        function updatePlacesDisponibles(date) {
            const placesMatinReservees = getPlacesReservees(date, 'matin');
            const placesMidiReservees = getPlacesReservees(date, 'midi');

            const placesMatinDisponibles = CAPACITE_MAX - placesMatinReservees;
            const placesMidiDisponibles = CAPACITE_MAX - placesMidiReservees;

            placesMatinElement.textContent = `${placesMatinDisponibles} place(s) disponible(s)`;
            placesMidiElement.textContent = `${placesMidiDisponibles} place(s) disponible(s)`;

            // Désactiver les créneaux complets
            if (placesMatinDisponibles <= 0) {
                matinRadio.disabled = true;
                placesMatinElement.classList.add('text-danger');
                placesMatinElement.textContent = "Complet";

                // Si le créneau du matin est complet, sélectionner celui de l'après-midi
                if (!midiRadio.disabled) {
                    midiRadio.checked = true;
                }
            } else {
                matinRadio.disabled = false;
                placesMatinElement.classList.remove('text-danger');
            }

            if (placesMidiDisponibles <= 0) {
                midiRadio.disabled = true;
                placesMidiElement.classList.add('text-danger');
                placesMidiElement.textContent = "Complet";

                // Si le créneau de l'après-midi est complet, sélectionner celui du matin
                if (!matinRadio.disabled) {
                    matinRadio.checked = true;
                }
            } else {
                midiRadio.disabled = false;
                placesMidiElement.classList.remove('text-danger');
            }

            // Si les deux créneaux sont complets, afficher un message
            if (placesMatinDisponibles <= 0 && placesMidiDisponibles <= 0) {
                creneauFeedback.style.display = "block";
                creneauFeedback.textContent = "Tous les créneaux sont complets pour cette date.";
            } else {
                creneauFeedback.style.display = "none";
            }

            // Mettre à jour le max du champ nombre de visiteurs
            updateNbVisiteursMaximum(date);
        }

        // Mettre à jour le maximum de visiteurs en fonction du créneau sélectionné
        function updateNbVisiteursMaximum(date) {
            const creneauSelectionne = document.querySelector('input[name="creneau"]:checked').value;
            const placesDisponibles = CAPACITE_MAX - getPlacesReservees(date, creneauSelectionne);

            nbVisiteursInput.max = placesDisponibles;
            nbVisiteursInput.setAttribute('max', placesDisponibles);

            const nbVisiteursFeedback = document.getElementById("nbvisiteurs-feedback");
            nbVisiteursFeedback.textContent = `Maximum ${placesDisponibles} visiteur(s) pour ce créneau`;
        }

        // Vérifier le nombre de visiteurs
        nbVisiteursInput.addEventListener("input", function () {
            if (dateInput.value) {
                const creneauSelectionne = document.querySelector('input[name="creneau"]:checked').value;
                const placesDisponibles = CAPACITE_MAX - getPlacesReservees(dateInput.value, creneauSelectionne);

                if (parseInt(nbVisiteursInput.value) > placesDisponibles) {
                    nbVisiteursInput.classList.add("is-invalid");
                    document.getElementById("nbvisiteurs-feedback").style.display = "block";
                } else {
                    nbVisiteursInput.classList.remove("is-invalid");
                    document.getElementById("nbvisiteurs-feedback").style.display = "none";
                }
            }
        });

        // Obtenir un numéro de réservation incrémental pour une date spécifique
        function getNextReservationNumber(dateStr) {
            // Format: clé de stockage = "bagne_reservations_YYYY-MM-DD"
            const storageKey = `bagne_reservations_${dateStr}`;

            // Récupérer les réservations existantes pour cette date
            let reservations = localStorage.getItem(storageKey);
            let count = 1;

            if (reservations) {
                // Convertir la chaîne en nombre et incrémenter
                count = parseInt(reservations) + 1;
            }

            // Stocker le nouveau compteur pour cette date
            localStorage.setItem(storageKey, count);

            // Retourner le compteur formaté sur 3 chiffres (ex: "001", "023", etc.)
            return count.toString().padStart(3, '0');
        }

        // Validation du formulaire avec le bouton stylisé
        submitButton.addEventListener("click", function (event) {
            // Vérifier le nombre de visiteurs
            const creneauSelectionne = document.querySelector('input[name="creneau"]:checked').value;
            const nbVisiteurs = parseInt(nbVisiteursInput.value);
            const placesDisponibles = CAPACITE_MAX - getPlacesReservees(dateInput.value, creneauSelectionne);

            // Vérifier que le nombre de visiteurs est valide
            if (!nbVisiteursInput.value || nbVisiteurs < 1 || nbVisiteurs > placesDisponibles) {
                nbVisiteursInput.classList.add("is-invalid");
                document.getElementById("nbvisiteurs-feedback").style.display = "block";
                return;
            } else {
                nbVisiteursInput.classList.remove("is-invalid");
                document.getElementById("nbvisiteurs-feedback").style.display = "none";
            }

            // Vérifier que la date est valide (weekend)
            if (!checkDate()) {
                return;
            }

            // Vérifier que le créneau n'est pas complet
            if ((creneauSelectionne === 'matin' && matinRadio.disabled) ||
                (creneauSelectionne === 'midi' && midiRadio.disabled)) {
                creneauFeedback.style.display = "block";
                return;
            }

            // Récupérer le numéro de séjour
            const reservationNumber = reservationNumberInput.value;
            if (!reservationNumber) {
                alert("Le numéro de séjour est requis");
                return;
            }

            // Générer un code de réservation bagne
            const selectedDate = new Date(dateInput.value);
            const year = selectedDate.getFullYear().toString().slice(-2);
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');

            // Obtenir le numéro de réservation incrémental pour la date sélectionnée
            const increment = getNextReservationNumber(dateInput.value);

            // Format du code: BA + YY + MM + XXX (XXX = numéro incrémental)
            const codeReservation = `BA${year}${month}${increment}`;

            // Si tout est valide, préparer les données
            const formData = {
                numeroSejour: reservationNumber,
                codeReservation: codeReservation,
                nbVisiteurs: nbVisiteurs,
                date: dateInput.value,
                creneau: creneauSelectionne
            };

            // Enregistrer la réservation dans le localStorage
            saveReservation(dateInput.value, creneauSelectionne, nbVisiteurs);

            // Mettre à jour l'affichage des places disponibles
            updatePlacesDisponibles(dateInput.value);

            // Créer le texte du créneau
            const creneauText = formData.creneau === 'matin' ? '10h - 11h30' : '14h - 15h30';

            // Afficher la confirmation
            const confirmationDiv = document.querySelector('.confirm-resa');
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
        });
    }

    // Fonction pour formater les dates
    function formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    }
});
