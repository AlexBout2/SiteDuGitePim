document.addEventListener('DOMContentLoaded', function () {
  // CODE #1: Gestion du bouton de validation du numéro de séjour et affichage du formulaire
  const resaCheckButton = document.querySelector(".sejour-validation");
  if (resaCheckButton) {
    resaCheckButton.addEventListener("click", function (event) {
      event.preventDefault();
      const fullFormContainer = document.querySelector(".fullForm");
      if (fullFormContainer && fullFormContainer.innerHTML.trim() === "") {
        console.log("Container trouvé et vide");
        const formHTML = `
              <div class="col-md-8 mx-auto text-center col-">
                  <form class="reservation-form">
                      <!-- Sélection du cheval -->
                      <div class="form-group mb-3">
                          <label for="selected-horse" class="fs-4">Cheval sélectionné</label>
                          <input
                              type="text"
                              class="form-control"
                              id="selected-horse"
                              readonly
                              placeholder="Cliquez sur un cheval ci-dessous"
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
                            <div class="btn-reservation">
                                <span class="btn-text">
                                    Réserver
                                </span>
                            </div>
                        </div>
                  </form>
              </div>
              `;
        fullFormContainer.innerHTML = formHTML;
        console.log("Formulaire injecté avec succès");

        // Initialiser les fonctionnalités du formulaire après l'avoir injecté
        initFormFunctionality();
      }
    });
  } else {
  }

  // CODE #2: Fonction pour initialiser les fonctionnalités du formulaire
  function initFormFunctionality() {
    // Sélection des éléments (après qu'ils soient injectés dans le DOM)
    const horseCards = document.querySelectorAll('.horse-card');
    const selectedHorseInput = document.getElementById('selected-horse');
    const reservationForm = document.querySelector('.reservation-form');
    const dateInput = document.getElementById('date');
    const reservationNumber = document.getElementById('reservation-number');
    const periodeSelect = document.getElementById('periode');
    const submitButton = document.getElementById('submit-reservation');
    const meteoWarning = document.getElementById('meteo-warning');

    // Variable pour stocker l'état météo actuel
    let isWeatherSafe = true;

    // Configuration de la date minimum (aujourd'hui)
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
      dateInput.min = today;

      // Ajouter un gestionnaire pour mettre à jour la météo quand la date change
      dateInput.addEventListener('change', function () {
        // Réinitialiser l'alerte météo à chaque changement de date
        hideMeteoWarning();

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

    // Observer les changements dans le composant météo pour détecter les mauvaises conditions
    function observeMeteoChanges() {
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'childList') {
            // Vérifier si les conditions météo sont mauvaises
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
      isWeatherSafe = !badWeatherConditions.some(condition =>
        weatherDescription.includes(condition)
      );

      // Afficher l'alerte si les conditions sont mauvaises
      if (!isWeatherSafe) {
        showMeteoWarning();
      } else {
        hideMeteoWarning();
      }
    }

    function showMeteoWarning() {
      if (meteoWarning) {
        meteoWarning.classList.remove('d-none');
        // Désactiver le bouton de soumission
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.title = "Réservation impossible en raison des conditions météorologiques";
        }
      }
    }

    function hideMeteoWarning() {
      if (meteoWarning) {
        meteoWarning.classList.add('d-none');
        // Réactiver le bouton de soumission
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.title = "";
        }
      }
    }

    // Démarrer l'observation du composant météo après un court délai
    setTimeout(observeMeteoChanges, 1000);

    // Gestion de la sélection des chevaux
    if (horseCards && horseCards.length > 0) {
      horseCards.forEach(card => {
        card.addEventListener('click', function () {
          document.querySelector('.horse-card.selected')?.classList.remove('selected');
          this.classList.add('selected');
          const horseName = this.querySelector('p').textContent;
          selectedHorseInput.value = horseName;
          reservationForm.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        });
      });
    }

    // Validation du formulaire
    if (reservationForm) {
      reservationForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Vérifier d'abord les conditions météo
        if (!isWeatherSafe) {
          alert('Désolé, les randonnées équestres ne sont pas autorisées en cas de pluie ou d\'orage par mesure de sécurité.');
          return;
        }

        if (reservationNumber && !reservationNumber.value) {
          alert('Veuillez entrer votre numéro de réservation du gîte');
          reservationNumber.focus();
          return;
        }

        if (!selectedHorseInput.value) {
          alert('Veuillez sélectionner un cheval');
          return;
        }

        if (!dateInput.value) {
          alert('Veuillez sélectionner une date');
          dateInput.focus();
          return;
        }

        if (!periodeSelect.value) {
          alert('Veuillez sélectionner une période');
          periodeSelect.focus();
          return;
        }

        const reservationData = {
          reservationNumber: reservationNumber ? reservationNumber.value : "Non spécifié",
          horse: selectedHorseInput.value,
          date: dateInput.value,
          periode: periodeSelect.value
        };

        console.log('Données de réservation:', reservationData);
        alert('Réservation enregistrée avec succès !');
      });
    }
  }

  // Vérifier si le formulaire est déjà affiché par défaut (sans clic sur le bouton)
  const reservationForm = document.querySelector('.reservation-form');
  if (reservationForm) {
    initFormFunctionality();
  }
});
