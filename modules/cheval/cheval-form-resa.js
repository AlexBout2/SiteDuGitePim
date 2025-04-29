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
                  <h2>Réservation de randonnée équestre</h2>
                  <hr class="separator my-3">
                  <form class="reservation-form">
                      <!-- Sélection du cheval -->
                      <div class="form-group mb-3">
                          <label for="selected-horse">Cheval sélectionné</label>
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
                          <label for="date">Date de la randonnée</label>
                          <input type="date" class="form-control" id="date" required />
                      </div>
                      
                      <!-- Intégration du composant météo -->
                      <div class="mb-3 mt-3">
                          <meteo-widget id="meteoComponent"></meteo-widget>
                      </div>
                      
                      <hr class="separator my-3">

                      <div class="form-group mb-3">
                          <label for="periode">Période</label>
                          <select class="form-control" id="periode" required>
                              <option value="">Sélectionnez une période</option>
                              <option value="matin">Matin de 9h à 11h avec Emma</option>
                              <option value="aprem">Après-midi de 14h à 16h avec Lucas</option>
                          </select>
                      </div>

                      <button type="submit" class="btn btn-secondary-custom">Réserver</button>
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
    console.log("Bouton non trouvé");
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

    // Configuration de la date minimum (aujourd'hui)
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
      dateInput.min = today;

      // Ajouter un gestionnaire pour mettre à jour la météo quand la date change
      dateInput.addEventListener('change', function () {
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
