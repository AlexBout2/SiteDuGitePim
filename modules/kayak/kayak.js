// modules\kayak\kayak.js
window.addEventListener("DOMContentLoaded", function () {
	const resaCheckButton = document.querySelector(".sejour-validation");

	resaCheckButton.addEventListener("click", function (event) {
		event.preventDefault();
		const fullFormContainer = document.querySelector(".fullForm");
		const sejourNumber = document.getElementById("reservation-number").value.trim();

		// Vérification du numéro de séjour (simple validation)
		if (!sejourNumber) {
			alert("Veuillez entrer votre numéro de séjour.");
			return;
		}

		if (fullFormContainer && fullFormContainer.innerHTML.trim() === "") {
			// Formulaire pour réservation de kayak
			const formHTML = `
                <div class="col-md-8 mx-auto text-center">
                    <form class="reservation-form">
                        <div class="form-group mb-3">
                            <label for="NbPersonnes" class="fs-4">Nombre de personnes</label>
                            <input class="form-control" id="NbPersonnes" type="number" min="1" max="4" value="1">
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
                                <div class="col-md-6 mb-3">
                                    <label for="debut-session" class="form-label">Heure de début</label>
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
                                <div class="col-md-6 mb-3">
                                    <label for="duree-session" class="form-label">Durée (heures)</label>
                                    <select class="form-select" id="duree-session" required>
                                        <option value="1">1 heure</option>
                                        <option value="2">2 heures</option>
                                        <option value="3">3 heures</option>
                                        <option value="4">4 heures</option>
                                        <option value="5">5 heures</option>
                                        <option value="6">6 heures</option>
                                        <option value="7">7 heures</option>
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
                            <button type="button" id="valider-kayak" class="btn btn-primary btn-lg">
                                Réserver mon kayak
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

	// Configuration des validations et interactions du formulaire
	function setupFormValidation(sejourNumber) {
		const nbPersonnesInput = document.getElementById("NbPersonnes");
		const dateLocationInput = document.getElementById("DateLocation");
		const simpleKayakRadio = document.getElementById("simpleKayak");
		const doubleKayakRadio = document.getElementById("doubleKayak");
		const debutSessionSelect = document.getElementById("debut-session");
		const dureeSessionSelect = document.getElementById("duree-session");
		const validerButton = document.getElementById("valider-kayak");
		const sessionWarning = document.getElementById("session-warning");
		const meteoWidget = document.querySelector("meteo-widget");

		// Définir la date minimum à aujourd'hui
		const today = new Date();
		dateLocationInput.min = today.toISOString().split('T')[0];

		// Mise à jour des disponibilités
		const updateAvailability = function () {
			if (!dateLocationInput.value || !debutSessionSelect.value) return;

			const dateKey = dateLocationInput.value;
			const heureDebut = parseInt(debutSessionSelect.value);
			const duree = parseInt(dureeSessionSelect.value);

			// Récupérer les réservations existantes
			const reservations = getReservationsForDate(dateKey);

			// Compter les kayaks disponibles
			let simplesReserves = 0;
			let doublesReserves = 0;
			let groupesTotal = 0;

			// Vérifier les chevauchements avec les réservations existantes
			for (const reservation of reservations) {
				const debutResa = parseInt(reservation.heureDebut);
				const finResa = debutResa + parseInt(reservation.duree);
				const finNouvelle = heureDebut + duree;

				// Si les plages se chevauchent
				if ((heureDebut < finResa) && (debutResa < finNouvelle)) {
					groupesTotal++;
					if (reservation.typeKayak === "simple") {
						simplesReserves++;
					} else {
						doublesReserves++;
					}
				}
			}

			// Mettre à jour l'affichage des disponibilités
			document.getElementById("simples-dispo").textContent = `${2 - simplesReserves} disponible${2 - simplesReserves > 1 ? 's' : ''}`;
			document.getElementById("doubles-dispo").textContent = `${3 - doublesReserves} disponible${3 - doublesReserves > 1 ? 's' : ''}`;

			// Désactiver les options si plus de disponibilité
			if (simplesReserves >= 2) {
				simpleKayakRadio.disabled = true;
				if (doubleKayakRadio.disabled) {
					validerButton.disabled = true;
					validerButton.textContent = "Plus de kayaks disponibles";
				} else if (simpleKayakRadio.checked) {
					doubleKayakRadio.checked = true;
				}
			} else {
				simpleKayakRadio.disabled = false;
			}

			if (doublesReserves >= 3) {
				doubleKayakRadio.disabled = true;
				if (simpleKayakRadio.disabled) {
					validerButton.disabled = true;
					validerButton.textContent = "Plus de kayaks disponibles";
				} else if (doubleKayakRadio.checked) {
					simpleKayakRadio.checked = true;
				}
			} else {
				doubleKayakRadio.disabled = false;
			}

			// Vérifier le nombre total de groupes
			if (groupesTotal >= 8) {
				validerButton.disabled = true;
				validerButton.textContent = "Maximum de 8 groupes atteint";
			} else {
				if (!validerButton.disabled) {
					validerButton.textContent = "Réserver mon kayak";
				}
			}
		};

		// Gestion du nombre de personnes et validation kayak double
		function updateKayakTypeValidation() {
			const nbPersonnes = parseInt(nbPersonnesInput.value);
			const isDouble = doubleKayakRadio.checked;

			if (isDouble && nbPersonnes < 2) {
				doubleKayakRadio.setCustomValidity("Minimum 2 personnes pour kayak double");
				document.getElementById("type-kayak-feedback").style.display = "block";
				return false;
			} else {
				doubleKayakRadio.setCustomValidity("");
				simpleKayakRadio.setCustomValidity("");
				document.getElementById("type-kayak-feedback").style.display = "none";
				return true;
			}
		}

		// Vérification de la durée et plage horaire
		function checkSessionDuration() {
			if (!debutSessionSelect.value) {
				document.getElementById("sessions-feedback").style.display = "block";
				return false;
			}

			const heureDebut = parseInt(debutSessionSelect.value);
			const duree = parseInt(dureeSessionSelect.value);
			const heureFin = heureDebut + duree;

			if (heureFin > 16) {
				sessionWarning.style.display = "block";
				sessionWarning.textContent = `Attention: la session se terminerait à ${heureFin}h, ce qui dépasse l'horaire de fermeture (16h)`;
				return false;
			} else {
				sessionWarning.style.display = "none";
				document.getElementById("sessions-feedback").style.display = "none";
				return true;
			}
		}

		// Mettre à jour les vérifications à chaque changement
		debutSessionSelect.addEventListener("change", function () {
			checkSessionDuration();
			updateAvailability();
		});

		dureeSessionSelect.addEventListener("change", function () {
			checkSessionDuration();
			updateAvailability();
		});

		// Mise à jour de la météo lors du changement de date
		dateLocationInput.addEventListener("change", function () {
			updateAvailability();

			// Mise à jour du widget météo
			if (meteoWidget && dateLocationInput.value) {
				meteoWidget.setAttribute('date', dateLocationInput.value);
			}
		});

		// Gestion du nombre de personnes et validation kayak double
		nbPersonnesInput.addEventListener("change", updateKayakTypeValidation);
		doubleKayakRadio.addEventListener("change", updateKayakTypeValidation);
		simpleKayakRadio.addEventListener("change", updateKayakTypeValidation);

		// Validation finale et soumission
		validerButton.addEventListener("click", function () {
			// Valider tous les champs
			if (!dateLocationInput.value) {
				alert("Veuillez sélectionner une date");
				return;
			}

			const isKayakTypeValid = updateKayakTypeValidation();
			const isSessionValid = checkSessionDuration();

			if (!isKayakTypeValid || !isSessionValid) {
				return; // Ne pas continuer si validation échouée
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
				duree: dureeSessionSelect.value,
				codeReservation: codeReservation
			};

			// Enregistrer la réservation
			saveReservation(formData);

			// Afficher la confirmation
			displayConfirmation(formData);
		});
	}

	// Récupérer les réservations pour une date donnée
	function getReservationsForDate(dateKey) {
		const allReservations = JSON.parse(localStorage.getItem('kayak_reservations') || '[]');
		return allReservations.filter(r => r.dateLocation === dateKey);
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

	// Enregistrer la réservation dans le localStorage
	function saveReservation(formData) {
		// Récupérer les réservations existantes ou initialiser un tableau vide
		let reservations = JSON.parse(localStorage.getItem('kayak_reservations') || '[]');

		// Ajouter cette réservation
		reservations.push(formData);

		// Sauvegarder dans localStorage
		localStorage.setItem('kayak_reservations', JSON.stringify(reservations));
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
            <div class="confirmation-box p-4 my-4 border rounded bg-light">
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

	// Fonction pour formater les dates
	function formatDate(dateString) {
		const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
		return new Date(dateString).toLocaleDateString('fr-FR', options);
	}
});
