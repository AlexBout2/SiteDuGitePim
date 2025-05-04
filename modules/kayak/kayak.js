import { validateSejourNumber, getSejourNumber, formatDate } from '../../js/utils.js';

window.addEventListener("DOMContentLoaded", function () {
	const resaCheckButton = document.querySelector(".sejour-validation");

	resaCheckButton.addEventListener("click", function (event) {
		event.preventDefault();
		const fullFormContainer = document.querySelector(".fullForm");

		if (!validateSejourNumber()) {
			return;
		}
		const sejourNumber = getSejourNumber();

		if (fullFormContainer && fullFormContainer.innerHTML.trim() === "") {
			// Formulaire pour réservation de kayak
			const formHTML = `
 				<div class="col-md-8 mx-auto text-center">
                    <form class="reservation-form">
                        <div class="form-group mb-3">
                            <label for="NbPersonnes" class="fs-4">Nombre de personnes</label>
                            <input class="form-control" id="NbPersonnes" type="number" min="1" max="8" value="1">
                            <div class="invalid-feedback" id="nbpersonnes-feedback">Nombre de personnes invalide</div>
                        </div>
                        <hr class="separator my-3">
                        
                        <div class="form-group mb-3">
                            <label for="DateLocation" class="fs-4">Date de location</label>
                            <input type="date" class="form-control" id="DateLocation" required>
                            <div class="invalid-feedback" id="date-feedback">Veuillez sélectionner une date</div>
                        </div>
                        
                        <div class="form-group mb-3">
                            <label class="fs-4">Type de kayak</label>
                            <div class="d-flex justify-content-between px-5 mt-2">
                                <div class="form-check text-center">
                                    <input class="form-check-input" type="radio" name="typeKayak" id="simpleKayak" value="simple" checked>
                                    <label class="form-check-label" for="simpleKayak">
                                        Kayak simple
                                    </label>
                                    <p class="form-text d-block fs-5 mt-2" id="simples-dispo">2 disponibles</p>
                                </div>
                                <div class="form-check text-center">
                                    <input class="form-check-input" type="radio" name="typeKayak" id="doubleKayak" value="double">
                                    <label class="form-check-label" for="doubleKayak">
                                        Kayak double
                                    </label>
                                    <p class="form-text d-block fs-5 mt-2" id="doubles-dispo">3 disponibles</p>
                                </div>
                            </div>
                            <div class="invalid-feedback" id="type-kayak-feedback">Le kayak double nécessite au moins 2 personnes</div>
                        </div>

                        <div class="form-group mb-3">
                            <label class="fs-4">Sessions (1h chacune, de 9h à 16h)</label>
                            <div class="row mt-2">
                                <div class="col-md-6 mb-3 mx-auto">
                                    <label for="debut-session" class="form-label ">Heure de début</label>
                                    <select class="form-select" id="debut-session" required>
                                        <option value="">Choisir...</option>
                                        <option value="9">9h</option>
                                        <option value="10">10h</option>
                                        <option value="11">11h</option>
                                        <option value="12">12h</option>
                                        <option value="13">13h</option>
                                        <option value="14">14h</option>
                                        <option value="15">15h</option>
                                    </select>
                                </div>
                            </div>
                            <div class="invalid-feedback" id="sessions-feedback">Veuillez sélectionner une heure de début</div>
                            <div id="session-warning" class="text-danger" style="display: none;">Attention: la durée choisie dépasse la plage horaire disponible (9h-16h)</div>
                        </div>
                        
                        <div class="mb-3 mt-3">
                            <meteo-widget></meteo-widget>
                        </div>

                        <div class="d-flex justify-content-center my-4">
						<button type="btn-reservation" class="btn-reservation js-valider-reservation" id="valider-kayak">
                            <span class=btn-text>
							Réserver mon kayak
							</span>
						</button>
                        </div>
                    </form>
                </div>
            `;

			fullFormContainer.innerHTML = formHTML;

			// Gestion des validations et événements après injection du formulaire
			setupFormValidation(sejourNumber);
		}
	});

	function setupFormValidation(sejourNumber) {
		const nbPersonnesInput = document.getElementById("NbPersonnes");
		const dateLocationInput = document.getElementById("DateLocation");
		const debutSessionSelect = document.getElementById("debut-session");
		const simpleKayakRadio = document.getElementById("simpleKayak");
		const doubleKayakRadio = document.getElementById("doubleKayak");
		const validerButton = document.getElementById("valider-kayak");
		const sessionWarning = document.getElementById("session-warning");
		const meteoWidget = document.querySelector("meteo-widget");

		// Vérifier que tous les éléments sont disponibles
		if (!nbPersonnesInput || !dateLocationInput || !debutSessionSelect || !simpleKayakRadio ||
			!doubleKayakRadio || !validerButton || !sessionWarning) {
			console.error("Certains éléments du formulaire sont manquants");
			return;
		}

		// Définir la date minimum à aujourd'hui
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, '0');
		const dd = String(today.getDate()).padStart(2, '0');
		dateLocationInput.min = `${yyyy}-${mm}-${dd}`;

		// Fonction de validation du type de kayak
		function updateKayakTypeValidation() {
			const nbpersonnes = parseInt(nbPersonnesInput.value);
			const typeFeedback = document.getElementById("type-kayak-feedback");

			// Si kayak double sélectionné avec une seule personne
			if (doubleKayakRadio.checked && nbpersonnes < 2) {
				typeFeedback.style.display = "block";
				return false;
			} else {
				typeFeedback.style.display = "none";
				return true;
			}
		}

		// Vérification de la plage horaire
		function checkSessionHours() {
			const sessionsFeedback = document.getElementById("sessions-feedback");

			if (!debutSessionSelect.value) {
				sessionsFeedback.style.display = "block";
				return false;
			}

			// La durée est fixée à 1 heure
			const heureDebut = parseInt(debutSessionSelect.value);
			const heureFin = heureDebut + 1; // Durée fixe de 1h

			if (heureFin > 16) {
				sessionWarning.style.display = "block";
				sessionWarning.textContent = `Attention: la session se terminerait à ${heureFin}h, ce qui dépasse l'horaire de fermeture (16h)`;
				return false;
			} else {
				sessionWarning.style.display = "none";
				sessionsFeedback.style.display = "none";
				return true;
			}
		}

		// Mise à jour des disponibilités
		function updateAvailability() {
			// Vérifier que tous les éléments sont présents
			if (!dateLocationInput.value || !debutSessionSelect.value || isNaN(parseInt(nbPersonnesInput.value))) {
				return null;
			}

			const selectedDate = dateLocationInput.value;
			const heureDebut = parseInt(debutSessionSelect.value);
			const nbPersonnes = parseInt(nbPersonnesInput.value);

			// Récupérer les réservations pour cette date
			const reservationsForDate = getReservationsForDate(selectedDate);

			// Initialiser les compteurs de kayaks
			const kayakLimits = {
				simple: 2,  // 2 kayaks simples disponibles
				double: 3   // 3 kayaks doubles disponibles
			};

			// Initialiser le compteur de personnes pour le créneau sélectionné
			let personnesAuCreneau = 0;
			let kayaksReserves = {
				simple: 0,
				double: 0
			};

			// Compter les réservations existantes pour ce créneau spécifique
			reservationsForDate.forEach(reservation => {
				const debut = parseInt(reservation.heureDebut);

				// Vérifier si la réservation occupe le même créneau horaire
				if (debut === heureDebut) {
					if (reservation.typeKayak === 'simple') {
						kayaksReserves.simple++;
					} else {
						kayaksReserves.double++;
					}
					personnesAuCreneau += parseInt(reservation.nbPersonnes);
				}
			});

			// Vérifier la disponibilité pour le créneau sélectionné
			const isSimpleAvailable = kayaksReserves.simple < kayakLimits.simple;
			const isDoubleAvailable = kayaksReserves.double < kayakLimits.double;

			// Calculer le nombre potentiel de personnes si cette réservation est ajoutée
			const personnesPotentielles = personnesAuCreneau + nbPersonnes;

			// Vérifier si le nombre total de personnes dépasse la capacité maximale (8)
			const maxPersonnesCreneau = 8;
			const isPersonnesLimitExceeded = personnesPotentielles > maxPersonnesCreneau;

			// Mise à jour des affichages de disponibilité
			const simplesDispoText = document.getElementById('simples-dispo');
			const doublesDispoText = document.getElementById('doubles-dispo');
			const dateFeedback = document.getElementById('date-feedback');

			// Mettre à jour les compteurs visuels pour chaque type
			if (simplesDispoText && doublesDispoText) {
				const simplesDisponibles = kayakLimits.simple - kayaksReserves.simple;
				const doublesDisponibles = kayakLimits.double - kayaksReserves.double;

				simplesDispoText.textContent = `${Math.max(0, simplesDisponibles)} disponible${simplesDisponibles !== 1 ? 's' : ''}`;
				doublesDispoText.textContent = `${Math.max(0, doublesDisponibles)} disponible${doublesDisponibles !== 1 ? 's' : ''}`;
			}

			// Si les deux types sont indisponibles ou le nombre max de personnes est atteint
			if ((!isSimpleAvailable && !isDoubleAvailable) || isPersonnesLimitExceeded) {
				// Mettre à jour le message d'erreur
				if (isPersonnesLimitExceeded && dateFeedback) {
					dateFeedback.textContent = `Désolé, nous ne pouvons pas accueillir plus de ${maxPersonnesCreneau} personnes sur ce créneau horaire.`;
					dateLocationInput.classList.add('is-invalid');
				} else if (!isSimpleAvailable && !isDoubleAvailable && dateFeedback) {
					dateFeedback.textContent = "Aucun kayak disponible pour ce créneau horaire.";
					dateLocationInput.classList.add('is-invalid');
				}

				// Désactiver le bouton de validation
				validerButton.disabled = true;
			} else {
				// Tout est disponible
				dateLocationInput.classList.remove('is-invalid');

				// Réactiver le bouton de validation
				validerButton.disabled = false;
			}

			// Désactiver les options de kayak non disponibles
			simpleKayakRadio.disabled = !isSimpleAvailable;
			doubleKayakRadio.disabled = !isDoubleAvailable;

			// Si le type de kayak actuellement sélectionné n'est pas disponible,
			// sélectionner l'autre type s'il est disponible
			if (simpleKayakRadio.checked && !isSimpleAvailable && isDoubleAvailable) {
				doubleKayakRadio.checked = true;
			} else if (doubleKayakRadio.checked && !isDoubleAvailable && isSimpleAvailable) {
				simpleKayakRadio.checked = true;
			}

			// Forcer la mise à jour de la validation du type de kayak
			updateKayakTypeValidation();

			return {
				isSimpleAvailable,
				isDoubleAvailable,
				isPersonnesLimitExceeded
			};
		}

		// Ajout des écouteurs d'événements
		dateLocationInput.addEventListener('change', function () {
			updateAvailability();
			// Mise à jour du widget météo
			if (meteoWidget) {
				meteoWidget.setAttribute('date', dateLocationInput.value);
			}
		});

		debutSessionSelect.addEventListener('change', function () {
			checkSessionHours();
			updateAvailability();
		});

		nbPersonnesInput.addEventListener('input', function () {
			updateKayakTypeValidation();
			updateAvailability();
		});

		doubleKayakRadio.addEventListener('change', updateKayakTypeValidation);
		simpleKayakRadio.addEventListener('change', updateKayakTypeValidation);

		// Validation finale et soumission
		validerButton.addEventListener("click", function () {
			// Valider tous les champs
			if (!dateLocationInput.value) {
				alert("Veuillez sélectionner une date");
				return;
			}

			if (!debutSessionSelect.value) {
				alert("Veuillez sélectionner une heure de début");
				return;
			}

			// Vérifier les disponibilités avant de soumettre
			const availabilityStatus = updateAvailability();
			const isKayakTypeValid = updateKayakTypeValidation();
			const isSessionValid = checkSessionHours();

			if (!isKayakTypeValid || !isSessionValid) {
				return; // Ne pas continuer si validation échouée
			}

			if (!availabilityStatus ||
				availabilityStatus.isPersonnesLimitExceeded ||
				(!availabilityStatus.isSimpleAvailable && !availabilityStatus.isDoubleAvailable)) {
				// Afficher une alerte si la réservation est impossible
				alert("Désolé, cette réservation n'est pas possible à cause des disponibilités.");
				return;
			}

			// Générer un numéro de réservation
			const codeReservation = generateReservationCode(dateLocationInput.value);

			// Collecter les données du formulaire
			const formData = {
				sejourNumber: sejourNumber,
				nbPersonnes: nbPersonnesInput.value,
				dateLocation: dateLocationInput.value,
				typeKayak: doubleKayakRadio.checked ? "double" : "simple",
				heureDebut: debutSessionSelect.value,
				duree: "1", // Durée fixe de 1 heure
				codeReservation: codeReservation,
				timestamp: new Date().toISOString() // Pour traçabilité
			};

			// Enregistrer la réservation
			saveReservation(formData);

			// Afficher la confirmation
			displayConfirmation(formData);
		});

		// Appeler updateAvailability initialement si les champs sont déjà remplis
		if (dateLocationInput.value && debutSessionSelect.value && nbPersonnesInput.value) {
			updateAvailability();
		}
	}

	// Récupérer les réservations pour une date donnée
	function getReservationsForDate(date) {
		const reservations = JSON.parse(localStorage.getItem('kayakReservations')) || [];
		return reservations.filter(reservation => reservation.dateLocation === date);
	}

	// Génère un code de réservation au format KAAAMM000x
	function generateReservationCode(dateStr) {
		const date = new Date(dateStr);
		const year = date.getFullYear().toString().slice(2); // Derniers deux chiffres de l'année
		const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mois avec leading zero

		// Récupérer le dernier numéro pour ce mois/année depuis localStorage
		const storageKey = `kayak_counter_${year}${month}`;
		let counter = localStorage.getItem(storageKey);

		if (!counter) {
			counter = 0;
		}

		// Incrémenter le compteur
		counter = parseInt(counter) + 1;
		localStorage.setItem(storageKey, counter);

		// Formater le numéro à 4 chiffres avec des zéros devant
		const formattedCounter = counter.toString().padStart(4, '0');

		return `KA${year}${month}${formattedCounter}`;
	}

	function saveReservation(reservationData) {
		// Récupérer les réservations existantes ou initialiser un tableau vide
		let reservations = JSON.parse(localStorage.getItem('kayakReservations')) || [];

		// Ajouter la nouvelle réservation
		reservations.push(reservationData);

		// Sauvegarder dans localStorage
		localStorage.setItem('kayakReservations', JSON.stringify(reservations));

		return true; // Succès de l'enregistrement
	}

	// Afficher la confirmation de réservation
	function displayConfirmation(formData) {
		const confirmationDiv = document.querySelector(".confirm-resa");
		const fullFormContainer = document.querySelector(".fullForm");

		// Calculer les heures de début et fin
		const heureDebut = parseInt(formData.heureDebut);
		const heureFin = heureDebut + parseInt(formData.duree);

		// Cacher le formulaire
		fullFormContainer.innerHTML = "";

		// Afficher la confirmation
		confirmationDiv.innerHTML = `
            <div class="confirmation-box p-4 my-4 border rounded bg-light w-100">
                <h2 class="text-center mb-3">Réservation confirmée !</h2>
                
                <div class="details-resa">
                    <p><strong>Date de location:</strong> ${formatDate(formData.dateLocation)}</p>
                    <p><strong>Type de kayak:</strong> ${formData.typeKayak === "double" ? "Kayak double" : "Kayak simple"}</p>
                    <p><strong>Nombre de personnes:</strong> ${formData.nbPersonnes}</p>
                    <p><strong>Horaire:</strong> ${heureDebut}h à ${heureFin}h</p>
                    <p><strong>Durée totale:</strong> ${formData.duree} heure(s)</p>
                </div>
                
                <hr class="my-3">
                
                <p class="text-center">Conservez votre code de réservation.</p>
                <div class="row justify-content-center">
                    <p class="fw-bold col-5 fs-4 p-2">Code de réservation:</p>
                    <p class="reservation-number fs-4 bg-white p-2 rounded col-5">${formData.codeReservation}</p>
                </div>
            </div>
        `;

		// Faire défiler la page vers la confirmation
		confirmationDiv.scrollIntoView({ behavior: 'smooth' });
	}
});