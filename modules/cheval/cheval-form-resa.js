import {
  validateSejourNumber,
  getSejourNumber,
  setupDateInputForSejour,
  isDateInSejourPeriod,
  formatDate
} from '../../js/utils.js';

document.addEventListener('DOMContentLoaded', function () {
  // Sélection des éléments principaux
  const reservationForm = document.querySelector('.reservation-form');
  const horseSelection = document.querySelector('.horse-selection');
  const validateButton = document.querySelector('.sejour-validation');
  const fullForm = document.querySelector('.fullForm');
  const confirmationDiv = document.querySelector(".confirm-resa");

  // Fonction principale de validation du numéro de réservation
  function handleReservationValidation() {
    //Vider les réservation précédentes 
    if (confirmationDiv) {
      confirmationDiv.innerHTML = "";
    }

    if (!validateSejourNumber()) {
      return false;
    }

    // Si nous arrivons ici, la validation a réussi
    // Récupérer le numéro de séjour validé
    const sejourNumber = getSejourNumber();

    // 1. Déplacer le formulaire vers la droite
    reservationForm.classList.add('slide-right');

    // 2. Afficher la sélection de chevaux
    horseSelection.classList.remove('d-none');
    horseSelection.classList.add('fade-in');

    // 3. Afficher le reste du formulaire
    if (fullForm) {
      fullForm.classList.remove('d-none');

      // Injecter le contenu HTML du formulaire s'il est vide
      if (fullForm.innerHTML.trim() === "") {
        injectFormHTML(fullForm, sejourNumber);
      }
    }

    return true;
  }

  // Attachement des événements pour la validation
  if (validateButton) {
    validateButton.addEventListener('click', function (event) {
      event.preventDefault();
      handleReservationValidation();
    });
  }

  // Permettre la validation avec la touche Entrée
  const reservationNumberInput = document.querySelector('.sejour-resa-input');
  if (reservationNumberInput) {
    reservationNumberInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleReservationValidation();
      }
    });
  }

  // Fonction pour injecter le HTML du formulaire
  function injectFormHTML(container, sejourNumber) {
    container.innerHTML = `
      <form class="cheval-reservation-form mt-4">
        <div class="form-group mb-3">
          <label for="date" class="form-label">Date de la randonnée</label>
          <input type="date" class="form-control" id="date" required>
          <div class="invalid-feedback" id="date-feedback">Veuillez sélectionner une date pendant votre séjour</div>
        </div>
        
        <div class="form-group mb-3">
          <label for="periode" class="form-label">Période</label>
          <select class="form-control" id="periode" required>
            <option value="">Choisissez une période</option>
            <option value="matin">Matin (9h à 11h avec Emma)</option>
            <option value="apres-midi">Après-midi (14h à 16h avec Lucas)</option>
          </select>
          <div class="invalid-feedback">Veuillez sélectionner une période</div>
        </div>
        
        <div class="weather-container mb-3">
          <meteo-widget id="meteoComponent"></meteo-widget>
          <div id="meteo-warning" class="alert alert-danger d-none mt-2">
            <i class="fas fa-exclamation-triangle"></i> Attention: Les randonnées sont annulées en cas de pluie ou d'orage
          </div>
        </div>
        
        <input type="hidden" id="selected-horse" value="">
        <input type="hidden" id="reservation-number" value="${sejourNumber}">
        
        <button type="submit" class="btn btn-primary mt-3 submit-reservation">
          Réserver cette randonnée
        </button>
      </form>
    `;

    // Initialiser le champ de date en fonction du séjour
    const dateInput = document.getElementById('date');
    if (dateInput && sejourNumber) {
      setupDateInputForSejour(dateInput, sejourNumber);
    }

    // Initialiser la sélection des chevaux
    initHorseSelection();

    // Initialiser les écouteurs d'événements pour le formulaire
    initFormEvents(sejourNumber);
  }

  // Initialiser les comportements du formulaire
  function initFormEvents(sejourNumber) {
    const dateInput = document.getElementById('date');
    const periodeSelect = document.getElementById('periode');
    const submitButton = document.querySelector('.submit-reservation');
    const meteoWidget = document.getElementById('meteoComponent');

    // Observer les changements météo
    observeMeteoChanges();

    // Gestionnaire de changement de date
    if (dateInput) {
      dateInput.addEventListener('change', function () {
        // Mettre à jour le widget météo
        if (meteoWidget) {
          meteoWidget.setAttribute('date', this.value);
        }

        // Mettre à jour les disponibilités des chevaux
        updateHorseAvailability();
      });
    }

    // Gestionnaire de changement de période
    if (periodeSelect) {
      periodeSelect.addEventListener('change', function () {
        updateHorseAvailability();
      });
    }

    // Validation finale et soumission
    if (submitButton) {
      submitButton.addEventListener('click', function (e) {
        e.preventDefault();
        validateReservationForm(sejourNumber);
      });
    }
  }

  // Validation du formulaire de réservation
  function validateReservationForm(sejourNumber) {
    const selectedHorseInput = document.getElementById('selected-horse');
    const dateInput = document.getElementById('date');
    const periodeSelect = document.getElementById('periode');
    const meteoWarning = document.getElementById('meteo-warning');

    // Vérifier d'abord les conditions météo
    if (meteoWarning && !meteoWarning.classList.contains('d-none')) {
      alert('Désolé, les randonnées équestres ne sont pas autorisées en cas de pluie ou d\'orage par mesure de sécurité.');
      return;
    }

    // Validation des champs
    if (!selectedHorseInput || !selectedHorseInput.value) {
      alert('Veuillez sélectionner un cheval');
      return;
    }

    if (!dateInput || !dateInput.value) {
      dateInput.classList.add('is-invalid');
      return;
    }

    // Vérifier si la date est dans la période du séjour
    if (!isDateInSejourPeriod(dateInput.value, sejourNumber)) {
      dateInput.classList.add('is-invalid');
      const feedback = document.getElementById('date-feedback');
      if (feedback) {
        feedback.textContent = 'La date doit être pendant votre séjour';
        feedback.style.display = 'block';
      }
      return;
    }

    if (!periodeSelect || !periodeSelect.value) {
      periodeSelect.classList.add('is-invalid');
      return;
    }

    // Vérifier si le cheval est disponible pour la date et période sélectionnées
    const horseName = selectedHorseInput.value;
    const date = dateInput.value;
    const periode = periodeSelect.value;

    if (!isHorseAvailable(horseName, date, periode)) {
      alert(`Désolé, ${horseName} est déjà réservé pour cette date et période.`);
      return;
    }

    // Générer un code de réservation unique
    const codeReservation = generateReservationCode();

    const reservationData = {
      reservationNumber: sejourNumber,
      horse: horseName,
      date: date,
      periode: periode,
      codeReservation: codeReservation,
      timestamp: new Date().toISOString()
    };

    // Enregistrer la réservation dans le localStorage
    saveHorseReservation(reservationData);

    // Afficher la confirmation
    displayConfirmation(reservationData);
  }

  // Initialiser le comportement des cartes de chevaux
  function initHorseSelection() {
    const horseCards = document.querySelectorAll('.horse-card');
    const selectedHorseInput = document.getElementById('selected-horse');

    horseCards.forEach(card => {
      card.addEventListener('click', function () {
        // Ne pas sélectionner les chevaux indisponibles
        if (this.classList.contains('unavailable')) {
          return;
        }

        // Désélectionner tous les chevaux
        horseCards.forEach(c => c.classList.remove('selected'));

        // Sélectionner ce cheval
        this.classList.add('selected');

        // Stocker le nom du cheval sélectionné
        const horseName = this.querySelector('p').textContent;
        if (selectedHorseInput) {
          selectedHorseInput.value = horseName;
        }
      });
    });

    // Initialiser la mise à jour des disponibilités
    updateHorseAvailability();
  }

  // Fonction pour vérifier si un cheval est disponible
  function isHorseAvailable(horseName, date, periode) {
    const reservations = getHorseReservations();
    return !reservations.some(r =>
      r.horse === horseName &&
      r.date === date &&
      r.periode === periode
    );
  }

  // Mettre à jour l'affichage des chevaux disponibles
  function updateHorseAvailability() {
    const dateInput = document.getElementById('date');
    const periodeSelect = document.getElementById('periode');
    const horseCards = document.querySelectorAll('.horse-card');

    if (!dateInput || !dateInput.value || !periodeSelect || !periodeSelect.value) {
      return;
    }

    const selectedDate = dateInput.value;
    const selectedPeriode = periodeSelect.value;

    // Récupérer les réservations existantes
    const reservations = getHorseReservations();

    // Réinitialiser tous les chevaux
    horseCards.forEach(card => {
      card.classList.remove('unavailable', 'selected');
      const existingMsg = card.querySelector('.reservation-message');
      if (existingMsg) existingMsg.remove();
    });

    // Marquer les chevaux déjà réservés
    reservations.forEach(reservation => {
      if (reservation.date === selectedDate && reservation.periode === selectedPeriode) {
        const reservedHorse = reservation.horse;
        const reservedCard = Array.from(horseCards).find(
          card => card.querySelector('p').textContent === reservedHorse
        );

        if (reservedCard) {
          reservedCard.classList.add('unavailable');

          // Ajouter un message
          const reservationMsg = document.createElement('div');
          reservationMsg.classList.add('reservation-message');
          reservationMsg.textContent = 'Déjà réservé';
          reservedCard.appendChild(reservationMsg);
        }
      }
    });

    // Réinitialiser le cheval sélectionné
    document.getElementById('selected-horse').value = '';
  }

  // Observer les changements dans le widget météo
  function observeMeteoChanges() {
    // Utiliser MutationObserver pour détecter les changements dans le widget météo
    const targetNode = document.getElementById('meteoComponent');
    const warningElement = document.getElementById('meteo-warning');

    if (targetNode && warningElement) {
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'weather-condition') {
            const condition = targetNode.getAttribute('weather-condition');

            // Afficher l'alerte si le temps est mauvais
            if (condition === 'Rain' || condition === 'Thunderstorm') {
              warningElement.classList.remove('d-none');
            } else {
              warningElement.classList.add('d-none');
            }
          }
        });
      });

      observer.observe(targetNode, { attributes: true });
    }
  }

  // Générer un code de réservation unique
  /**
 * Génère un code de réservation unique pour les randonnées équestres au format RAYYMMXXXX
 * @returns {string} Le code de réservation formaté
 */
  function generateReservationCode() {
    // Récupérer la date actuelle
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Récupère seulement les 2 derniers chiffres
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // +1 car les mois commencent à 0

    // Récupérer toutes les réservations existantes pour déterminer le prochain numéro
    const existingReservations = getHorseReservations();

    // Filtrer les réservations du mois en cours
    const currentMonthPrefix = `RA${year}${month}`;
    const currentMonthReservations = existingReservations.filter(
      res => res.codeReservation && res.codeReservation.startsWith(currentMonthPrefix)
    );

    // Trouver le nombre le plus élevé et incrémenter
    let maxNumber = 0;

    currentMonthReservations.forEach(res => {
      // Extraire le numéro séquentiel (les 4 derniers chiffres)
      const sequenceStr = res.codeReservation.slice(-4);
      const sequence = parseInt(sequenceStr, 10);

      if (!isNaN(sequence) && sequence > maxNumber) {
        maxNumber = sequence;
      }
    });

    // Incrémenter et formater avec des zéros à gauche
    const nextNumber = (maxNumber + 1).toString().padStart(4, '0');

    // Construire le code de réservation complet
    return `RA${year}${month}${nextNumber}`;
  }

  // Récupérer les réservations de chevaux
  function getHorseReservations() {
    return JSON.parse(localStorage.getItem('horseReservations') || '[]');
  }

  // Sauvegarder une réservation
  function saveHorseReservation(data) {
    const reservations = getHorseReservations();
    reservations.push(data);
    localStorage.setItem('horseReservations', JSON.stringify(reservations));
  }

  // Afficher la confirmation de réservation
  function displayConfirmation(formData) {
    // Cacher le formulaire et la section de sélection des chevaux
    if (fullForm) {
      fullForm.innerHTML = "";
    }

    if (horseSelection) {
      horseSelection.classList.add('d-none');
    }

    // Formater la période pour l'affichage
    let periodeFormatee = formData.periode === "matin" ?
      "Matin (9h à 11h avec Emma)" :
      "Après-midi (14h à 16h avec Lucas)";

    // Afficher la confirmation
    if (confirmationDiv) {
      confirmationDiv.innerHTML = `
        <div class="reservation-confirmation p-4 my-3 text-center border rounded w-100">
            <h1 class="mb-3">Réservation confirmée !</h1>
            
            <div class="details-resa text-start bg-light p-3 rounded mx-auto" style="max-width: 400px;">
                <p><strong>Date de la randonnée :</strong> ${formatDate(formData.date)}</p>
                <p><strong>Période :</strong> ${periodeFormatee}</p>
                <p><strong>Cheval réservé :</strong> ${formData.horse}</p>
                <p><strong>Numéro de chambre :</strong> ${formData.reservationNumber}</p>
            </div>
            
            <hr class="my-3">
            
            <p class="mt-3 fs-3 fw-semibold">Conservez votre code de réservation :</p>
            <div class="row justify-content-center">
                <p class="fw-bold col-5 fs-4 p-2">Code de la randonnée</p>
                <p class="reservation-number fs-4 bg-light p-2 rounded col-5">${formData.codeReservation}</p>
            </div>
        </div>
      `;

      // Rendre la section de confirmation visible
      confirmationDiv.style.display = "block";

      // Faire défiler la page vers la confirmation
      setTimeout(() => {
        confirmationDiv.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }
});
