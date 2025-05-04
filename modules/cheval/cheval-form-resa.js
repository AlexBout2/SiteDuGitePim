import { validateSejourNumber, getSejourNumber } from '../../js/utils.js';

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
    const confirmationDiv = document.querySelector(".confirm-resa");
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

  // Initialiser le comportement des cartes de chevaux
  function initHorseSelection() {
    const horseCards = document.querySelectorAll('.horse-card');
    const selectedHorseInput = document.getElementById('selected-horse');
    const dateInput = document.getElementById('date');
    const periodeSelect = document.getElementById('periode');

    // Désactiver les chevaux déjà réservés pour la date sélectionnée
    function updateHorseAvailability() {
      const selectedDate = dateInput.value;
      const selectedPeriode = periodeSelect.value;

      if (!selectedDate) return;

      // Obtenir toutes les réservations existantes
      const reservations = getHorseReservations();

      // Réinitialiser tous les chevaux comme disponibles
      horseCards.forEach(card => {
        card.classList.remove('unavailable');
        // Supprimer le message de réservation s'il existe
        const existingMsg = card.querySelector('.reservation-message');
        if (existingMsg) {
          existingMsg.remove();
        }
      });

      // Marquer les chevaux qui sont déjà réservés pour cette date et période
      reservations.forEach(reservation => {
        if (reservation.date === selectedDate && reservation.periode === selectedPeriode) {
          const horseName = reservation.horse;
          const reservedHorseCard = Array.from(horseCards).find(
            card => card.querySelector('p').textContent === horseName
          );

          if (reservedHorseCard) {
            reservedHorseCard.classList.add('unavailable');

            // Ajouter un message indiquant que le cheval est déjà réservé
            const reservationMsg = document.createElement('div');
            reservationMsg.classList.add('reservation-message');
            reservationMsg.textContent = 'Déjà réservé';
            reservedHorseCard.appendChild(reservationMsg);
          }
        }
      });
    }

    // Mettre à jour la disponibilité des chevaux lorsque la date ou la période change
    if (dateInput) {
      dateInput.addEventListener('change', updateHorseAvailability);
    }

    if (periodeSelect) {
      periodeSelect.addEventListener('change', updateHorseAvailability);
    }

    horseCards.forEach(card => {
      card.addEventListener('click', function () {
        // Vérifier si le cheval est disponible
        if (this.classList.contains('unavailable')) {
          alert('Ce cheval est déjà réservé pour cette date et période');
          return;
        }

        document.querySelector('.horse-card.selected')?.classList.remove('selected');
        this.classList.add('selected');

        if (selectedHorseInput) {
          const horseName = this.querySelector('p').textContent;
          selectedHorseInput.value = horseName;

          // Faire défiler vers le formulaire si nécessaire
          reservationForm.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      });
    });

    // Actualiser l'état des chevaux au chargement
    if (dateInput.value && periodeSelect.value) {
      updateHorseAvailability();
    }
  }

  // Observer l'apparition de la sélection de chevaux
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.target.classList.contains('fade-in') &&
        !mutation.target.classList.contains('d-none')) {
        initHorseSelection();
        observer.disconnect(); // Arrêter d'observer une fois initialisé
      }
    });
  });

  // Observer les changements de classe sur le conteneur de sélection de chevaux
  if (horseSelection) {
    observer.observe(horseSelection, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  // Fonction pour injecter le HTML du formulaire
  function injectFormHTML(container, sejourNumber) {
    const formHTML = `
      <div class="col-md-8 mx-auto text-center">
          <form class="horse-reservation-form">
              <!-- Numéro de séjour (caché, préservé de l'input original) -->
              <input type="hidden" id="reservation-number" value="${sejourNumber || ''}">
              
              <!-- Sélection du cheval -->
              <div class="form-group mb-3">
                  <label for="selected-horse" class="fs-4">Cheval sélectionné</label>
                  <input
                      type="text"
                      class="form-control"
                      id="selected-horse"
                      readonly
                      placeholder="Sélectionniez votre cheval en cliquant sur sa photo"
                  />
              </div>
              
              <hr class="separator my-3">

              <div class="form-group mb-3">
                  <label for="date" class="fs-4">Date de la randonnée</label>
                  <input type="date" class="form-control" id="date" required />
              </div>
              
              <!-- Intégration du composant météo -->
              <div class="mb-3 mt-3">
                  <meteo-widget id="meteoComponent"></meteo-widget>
              </div>

              <!-- Message d'alerte pour conditions météo -->
              <div id="meteo-warning" class="alert alert-danger d-none">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  <span>Les randonnées équestres ne sont pas autorisées en cas de pluie ou d'orage par mesure de sécurité.</span>
              </div>
              
              <hr class="separator my-3">

              <div class="form-group mb-3">
                  <label for="periode" class="fs-4">Matinée ou Après-midi</label>
                  <select class="form-control" id="periode" required>
                      <option value="matin">Matin de 9h à 11h avec Emma</option>
                      <option value="aprem">Après-midi de 14h à 16h avec Lucas</option>
                  </select>
              </div>
              <div class="d-flex justify-content-center mb-3">
                    <div class="btn-reservation submit-reservation">
                        <span class="btn-text">
                            Réserver
                        </span>
                    </div>
                </div>
          </form>
      </div>
    `;

    container.innerHTML = formHTML;
    console.log("Formulaire injecté avec succès");
    initFormDetails();
  }

  // Fonction pour initialiser les détails spécifiques du formulaire
  function initFormDetails() {
    const dateInput = document.getElementById('date');
    const meteoWarning = document.getElementById('meteo-warning');
    const submitButton = document.querySelector('.submit-reservation');
    const periodeSelect = document.getElementById('periode');

    // Configuration de la date minimum (aujourd'hui)
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
      dateInput.min = today;

      // Ajouter un gestionnaire pour mettre à jour la météo quand la date change
      dateInput.addEventListener('change', function () {
        // Réinitialiser l'alerte météo à chaque changement de date
        if (meteoWarning) {
          meteoWarning.classList.add('d-none');
        }

        // Déclencher manuellement la mise à jour météo
        const meteoWidget = document.getElementById('meteoComponent');
        if (meteoWidget) {
          meteoWidget.setAttribute('date', this.value);

          // Forcer un rafraîchissement des données météo
          if (typeof meteoWidget.fetchMeteoData === 'function') {
            meteoWidget.fetchMeteoData(this.value);
          }
        }

        // Mettre à jour la disponibilité des chevaux
        const event = new Event('change');
        if (periodeSelect) {
          periodeSelect.dispatchEvent(event);
        }
      });
    }

    observeMeteoChanges();

    // Validation du formulaire
    if (submitButton) {
      submitButton.addEventListener('click', function (e) {
        e.preventDefault();
        validateReservationForm();
      });
    }
  }

  // Observer les changements météo
  function observeMeteoChanges() {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'childList') {
          checkWeatherConditions();
        }
      });
    });

    const meteoWidget = document.getElementById('meteoComponent');
    if (meteoWidget) {
      observer.observe(meteoWidget, { childList: true, subtree: true });
    }
  }

  // Vérifier les conditions météo
  function checkWeatherConditions() {
    const meteoWidget = document.getElementById('meteoComponent');
    if (!meteoWidget) return;

    // Chercher le texte de description météo
    const descriptionElement = meteoWidget.querySelector('.card-text');
    if (!descriptionElement) return;

    const weatherDescription = descriptionElement.textContent.toLowerCase();

    // Liste des conditions météo défavorables
    const badWeatherConditions = [
      'pluie', 'pluvieux', 'averse',
      'orage', 'orageux',
      'grêle', 'grêlons',
      'neige', 'neigeux',
      'tempête'
    ];

    // Vérifier si une des conditions défavorables est présente
    const isWeatherSafe = !badWeatherConditions.some(condition =>
      weatherDescription.includes(condition)
    );

    // Afficher l'alerte si les conditions sont mauvaises
    const meteoWarning = document.getElementById('meteo-warning');
    const submitButton = document.querySelector('.submit-reservation');

    if (!isWeatherSafe) {
      if (meteoWarning) {
        meteoWarning.classList.remove('d-none');
      }
      if (submitButton) {
        submitButton.classList.add('disabled');
        submitButton.title = "Réservation impossible en raison des conditions météorologiques";
      }
    } else {
      if (meteoWarning) {
        meteoWarning.classList.add('d-none');
      }
      if (submitButton) {
        submitButton.classList.remove('disabled');
        submitButton.title = "";
      }
    }
  }

  // Fonctions pour gérer les réservations dans le localStorage

  // Générer un code de réservation unique
  function generateReservationCode() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); // Derniers 2 chiffres de l'année
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Récupérer le numéro incrémental depuis les réservations existantes
    const reservations = getHorseReservations();

    // Filtrer les réservations du mois en cours
    const currentMonthReservations = reservations.filter(r => {
      return r.codeReservation &&
        r.codeReservation.startsWith(`RA${year}${month}`);
    });

    // Déterminer le numéro incrémental
    const nextNumber = currentMonthReservations.length + 1;

    // Formatter le numéro incrémental avec des zéros devant
    const formattedNumber = nextNumber.toString().padStart(4, '0');

    return `RA${year}${month}${formattedNumber}`;
  }

  // Récupérer les réservations existantes
  function getHorseReservations() {
    const reservationsJSON = localStorage.getItem('horseReservations');
    return reservationsJSON ? JSON.parse(reservationsJSON) : [];
  }

  // Enregistrer une réservation
  function saveHorseReservation(reservation) {
    // Récupérer les réservations existantes
    const reservations = getHorseReservations();

    // Ajouter la nouvelle réservation
    reservations.push(reservation);

    // Enregistrer dans le localStorage
    localStorage.setItem('horseReservations', JSON.stringify(reservations));
  }

  // Vérifier si un cheval est disponible pour une date et période donnée
  function isHorseAvailable(horseName, date, periode) {
    const reservations = getHorseReservations();

    return !reservations.some(reservation =>
      reservation.horse === horseName &&
      reservation.date === date &&
      reservation.periode === periode
    );
  }

  // Formatage de la date pour l'affichage
  function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', options);
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

  // Validation du formulaire de réservation
  function validateReservationForm() {
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
      alert('Veuillez sélectionner une date');
      dateInput.focus();
      return;
    }

    if (!periodeSelect || !periodeSelect.value) {
      alert('Veuillez sélectionner une période');
      periodeSelect.focus();
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

    // Récupérer le numéro de séjour
    const sejour = document.querySelector('.sejour-resa-input')?.value || "Non spécifié";

    // Générer un code de réservation unique
    const codeReservation = generateReservationCode();

    const reservationData = {
      reservationNumber: sejour,
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
});
