import { validateSejourNumber, getSejourNumber, formatDate } from '../../js/utils.js';

window.addEventListener("DOMContentLoaded", function () {
	const resaCheckButton = document.querySelector(".sejour-validation");

	resaCheckButton.addEventListener("click", function (event) {
		event.preventDefault();
		const fullFormContainer = document.querySelector(".fullForm");

		//Vider les réservation précédentes 
		const confirmationDiv = document.querySelector(".confirm-resa");
		if (confirmationDiv) {
			confirmationDiv.innerHTML = "";
		}


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

						<hr class="separator my-3">

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
                            <div id="session-warning" class="text-danger" style="display: none;"></div>
                        </div>

                        <hr class="separator my-3">
                        <div class="form-group mb-3">
                            <label class="fs-4">Sélection des kayaks</label>
                            <div class="row px-3 mt-2">
                                <div class="col-md-6 text-center">
                                    <label for="nbKayakSimple" class="form-label">Kayaks simples</label>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <input type="number" class="form-control w-50 mx-2" id="nbKayakSimple" min="0" max="2" value="0">
                                    </div>
                                    <p class="form-text d-block mt-2" id="simples-dispo">2 disponibles</p>
                                </div>
                                <div class="col-md-6 text-center">
                                    <label for="nbKayakDouble" class="form-label">Kayaks doubles</label>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <input type="number" class="form-control w-50 mx-2" id="nbKayakDouble" min="0" max="3" value="0">
                                    </div>
                                    <p class="form-text d-block mt-2" id="doubles-dispo">3 disponibles</p>
                                </div>
                            </div>
                            <div class="invalid-feedback" id="kayak-distribution-feedback">La répartition des kayaks ne correspond pas au nombre de personnes</div>
                            <div class="alert alert-info mt-2" id="kayak-suggestion" style="display:none;"></div>
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
		const nbKayakSimpleInput = document.getElementById("nbKayakSimple");
		const nbKayakDoubleInput = document.getElementById("nbKayakDouble");
		const validerButton = document.getElementById("valider-kayak");
		const sessionWarning = document.getElementById("session-warning");
		const kayakDistributionFeedback = document.getElementById("kayak-distribution-feedback");
		const meteoWidget = document.querySelector("meteo-widget");

		// Vérifier que tous les éléments sont disponibles
		if (!nbPersonnesInput || !dateLocationInput || !debutSessionSelect ||
			!nbKayakSimpleInput || !nbKayakDoubleInput || !validerButton || !sessionWarning) {
			console.error("Certains éléments du formulaire sont manquants");
			return;
		}

		// Définir la date minimum à aujourd'hui
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, '0');
		const dd = String(today.getDate()).padStart(2, '0');
		dateLocationInput.min = `${yyyy}-${mm}-${dd}`;


		function validateKayakDistribution() {
			const nbPersonnes = parseInt(nbPersonnesInput.value);
			const nbKayakSimple = parseInt(nbKayakSimpleInput.value);
			const nbKayakDouble = parseInt(nbKayakDoubleInput.value);

			// Capacité totale des kayaks sélectionnés
			const capaciteSimple = nbKayakSimple * 1;  // 1 personne par kayak simple
			const capaciteDouble = nbKayakDouble * 2;  // 2 personnes par kayak double
			const capaciteTotale = capaciteSimple + capaciteDouble;

			// Aucun kayak sélectionné
			if (nbKayakSimple === 0 && nbKayakDouble === 0) {
				kayakDistributionFeedback.textContent = "Veuillez sélectionner au moins un kayak";
				kayakDistributionFeedback.style.display = "block";
				return false;
			}

			// Vérifier si la capacité correspond au nombre de personnes
			if (capaciteTotale < nbPersonnes) {
				kayakDistributionFeedback.textContent = `Les kayaks sélectionnés ne peuvent accueillir que ${capaciteTotale} personnes`;
				kayakDistributionFeedback.style.display = "block";
				return false;
			}

			// Vérifier s'il y a des places vides dans les kayaks doubles
			if (capaciteTotale > nbPersonnes && nbKayakDouble > 0) {
				const placesVides = capaciteTotale - nbPersonnes;
				// Si on a plus de places vides que de kayaks doubles, c'est inefficace
				if (placesVides > 0 && placesVides >= nbKayakDouble) {
					kayakDistributionFeedback.textContent = "Distribution inefficace: des kayaks doubles sont sous-utilisés";
					kayakDistributionFeedback.style.display = "block";
					return false;
				}
			}

			kayakDistributionFeedback.style.display = "none";
			return true;
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
			if (!dateLocationInput.value || !debutSessionSelect.value) {
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
					// Si l'ancienne version utilisait un seul kayak par réservation
					if (reservation.hasOwnProperty('typeKayak')) {
						if (reservation.typeKayak === 'simple') {
							kayaksReserves.simple++;
						} else {
							kayaksReserves.double++;
						}
					}
					// Si la nouvelle version utilise plusieurs kayaks par réservation
					else if (reservation.hasOwnProperty('kayaks')) {
						kayaksReserves.simple += reservation.kayaks.simple || 0;
						kayaksReserves.double += reservation.kayaks.double || 0;
					}

					personnesAuCreneau += parseInt(reservation.nbPersonnes);
				}
			});
			// Vérifier la disponibilité pour le créneau sélectionné
			const simplesDisponibles = Math.max(0, kayakLimits.simple - kayaksReserves.simple);
			const doublesDisponibles = Math.max(0, kayakLimits.double - kayaksReserves.double);

			// Mise à jour des valeurs max des sélecteurs de kayak
			nbKayakSimpleInput.max = simplesDisponibles;
			nbKayakDoubleInput.max = doublesDisponibles;

			// Mise à jour des affichages de disponibilité
			const simplesDispoText = document.getElementById('simples-dispo');
			const doublesDispoText = document.getElementById('doubles-dispo');
			const dateFeedback = document.getElementById('date-feedback');

			// Mettre à jour les compteurs visuels pour chaque type
			if (simplesDispoText && doublesDispoText) {
				simplesDispoText.textContent = `${simplesDisponibles} disponible${simplesDisponibles !== 1 ? 's' : ''}`;
				doublesDispoText.textContent = `${doublesDisponibles} disponible${doublesDisponibles !== 1 ? 's' : ''}`;
			}

			// Si tous les kayaks sont réservés pour ce créneau
			if (simplesDisponibles === 0 && doublesDisponibles === 0) {
				if (dateFeedback) {
					dateFeedback.textContent = "Aucun kayak disponible pour ce créneau horaire.";
					dateLocationInput.classList.add('is-invalid');
				}

				// Désactiver le bouton de validation
				validerButton.disabled = true;
				return null;
			}

			// Vérifier si le nombre total de personnes dépasse la capacité maximale (8)
			const maxPersonnesCreneau = 8;
			const personnesPotentielles = personnesAuCreneau + nbPersonnes;

			if (personnesPotentielles > maxPersonnesCreneau) {
				if (dateFeedback) {
					dateFeedback.textContent = `Désolé, nous ne pouvons pas accueillir plus de ${maxPersonnesCreneau} personnes sur ce créneau horaire.`;
					dateLocationInput.classList.add('is-invalid');
				}

				// Désactiver le bouton de validation
				validerButton.disabled = true;
				return null;
			}

			// Tout est disponible
			dateLocationInput.classList.remove('is-invalid');

			// Réactiver le bouton de validation si la distribution des kayaks est valide
			validerButton.disabled = !validateKayakDistribution();

			return {
				simplesDisponibles,
				doublesDisponibles,
				personnesMaxRestantes: maxPersonnesCreneau - personnesAuCreneau
			};
		}

		// Ajout des écouteurs d'événements
		dateLocationInput.addEventListener('change', function () {
			// Réinitialiser les sélections de kayaks
			nbKayakSimpleInput.value = 0;
			nbKayakDoubleInput.value = 0;

			updateAvailability();

			// Mise à jour du widget météo
			if (meteoWidget) {
				meteoWidget.setAttribute('date', dateLocationInput.value);
			}
		});

		debutSessionSelect.addEventListener('change', function () {
			// Réinitialiser les sélections de kayaks
			nbKayakSimpleInput.value = 0;
			nbKayakDoubleInput.value = 0;

			checkSessionHours();
			updateAvailability();
		});

		nbPersonnesInput.addEventListener('input', function () {
			updateAvailability();
		});

		nbKayakSimpleInput.addEventListener('input', function () {
			validateKayakDistribution();
			updateAvailability();
		});

		nbKayakDoubleInput.addEventListener('input', function () {
			validateKayakDistribution();
			updateAvailability();
		});

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

			// Vérifier la validité de la distribution de kayaks
			if (!validateKayakDistribution()) {
				alert("Veuillez corriger la distribution des kayaks");
				return;
			}

			// Vérifier les disponibilités avant de soumettre
			const availabilityStatus = updateAvailability();
			if (!availabilityStatus) {
				alert("Désolé, cette réservation n'est pas possible à cause des disponibilités.");
				return;
			}

			const nbKayakSimple = parseInt(nbKayakSimpleInput.value);
			const nbKayakDouble = parseInt(nbKayakDoubleInput.value);
			const nbPersonnes = parseInt(nbPersonnesInput.value);

			// Générer un numéro de réservation
			const codeReservation = generateReservationCode(dateLocationInput.value);

			// Collecter les données du formulaire
			const formData = {
				sejourNumber: sejourNumber,
				nbPersonnes: nbPersonnes,
				dateLocation: dateLocationInput.value,
				kayaks: {
					simple: nbKayakSimple,
					double: nbKayakDouble
				},
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
		if (dateLocationInput.value && debutSessionSelect.value) {
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

		// Détails des kayaks
		const kayakDetails = [];
		if (formData.kayaks.simple > 0) {
			kayakDetails.push(`${formData.kayaks.simple} kayak${formData.kayaks.simple > 1 ? 's' : ''} simple${formData.kayaks.simple > 1 ? 's' : ''}`);
		}
		if (formData.kayaks.double > 0) {
			kayakDetails.push(`${formData.kayaks.double} kayak${formData.kayaks.double > 1 ? 's' : ''} double${formData.kayaks.double > 1 ? 's' : ''}`);
		}
		const kayakDetailsText = kayakDetails.join(' et ');

		// Cacher le formulaire
		fullFormContainer.innerHTML = "";

		// Afficher la confirmation
		confirmationDiv.innerHTML = `
            <div class="confirmation-box p-4 my-4 border rounded bg-light w-100">
                <h2 class="text-center mb-3">Réservation confirmée !</h2>
                
               <div class="details-resa">
                    <p><strong>Date de location:</strong> ${formatDate(formData.dateLocation)}</p>
                    <p><strong>Kayaks réservés:</strong> ${kayakDetailsText}</p>
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