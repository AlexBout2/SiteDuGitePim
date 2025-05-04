'import { validateSejourNumber, getSejourNumber } from '../../ js / utils.js';

document.addEventListener('DOMContentLoaded', function () {
  // Sélection des éléments principaux
  const reservationForm = document.querySelector('.reservation-form');
  const horseSelection = document.querySelector('.horse-selection');
  const validateButton = document.querySelector('.sejour-validation');
  const fullForm = document.querySelector('.fullForm');

  // Fonction principale de validation du numéro de réservation
  function handleReservationValidation() {

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

  // Permettre la validation avec la touche Entré
  // Initialiser le comportement des cartes de chevaux
  function initHorseSelection() {
    const horseCards = document.querySelectorAll('.horse-card');
    const selectedHorseInput = document.getElementById('selected-horse');

    horseCards.forEach(card => {
      card.addEventListener('click', function () {
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
                      placeholder="Sélectionniez votre compagnon à droite"
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

    // Récupérer le numéro de séjour
    const sejour = document.querySelector('.sejour-resa-input')?.value || "Non spécifié";

    const reservationData = {
      reservationNumber: sejour,
      horse: selectedHorseInput.value,
      date: dateInput.value,
      periode: periodeSelect.value
    };

    console.log('Données de réservation:', reservationData);
    alert('Réservation enregistrée avec succès !');
  }
});