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

                      <div class="form-group mb-3">
                          <label for="date">Date de la randonnée</label>
                          <input type="date" class="form-control" id="date" required />
                      </div>

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

                  <!-- Calendrier des disponibilités -->

              </div>
              `;
        fullFormContainer.innerHTML = formHTML;
        console.log("Formulaire injecté avec succès");

        // IMPORTANT: Initialiser les fonctionnalités du formulaire après l'avoir injecté
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

    // Vérification que l'élément meteoToast existe avant de l'initialiser
    const meteoToastElement = document.getElementById('meteoToast');
    let meteoToast = null;
    if (meteoToastElement) {
      meteoToast = new bootstrap.Toast(meteoToastElement, {
        autohide: false
      });
    }

    // Configuration de la date minimum (aujourd'hui)
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
      dateInput.min = today;

      // Écouteur d'événement pour le changement de date
      dateInput.addEventListener('change', function () {
        if (this.value && typeof updateMeteo === 'function') {
          updateMeteo(this.value);
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

        // Vérification des conditions météo
        const meteoAlert = document.querySelector('.alert-warning');
        if (meteoAlert) {
          if (!confirm('Les conditions météo ne sont pas optimales pour cette date. Souhaitez-vous tout de même continuer ?')) {
            return;
          }
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

  // Définition de la fonction updateMeteo 
  // (Je remarque qu'elle semble incomplète dans votre code original)
  function updateMeteo(dateStr) {
    // Conversion de la chaîne de date en objet Date
    const date = new Date(dateStr);

    // Formater la date
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const formattedDate = date.toLocaleDateString('fr-FR', options);

    // Simuler différentes conditions météo
    const conditions = [
      { icon: '☀️', desc: 'Ensoleillé', temp: '22°C' },
      { icon: '⛅', desc: 'Partiellement nuageux', temp: '18°C' },
      { icon: '☁️', desc: 'Nuageux', temp: '16°C' },
      { icon: '🌧️', desc: 'Pluvieux', temp: '14°C' },
      { icon: '⛈️', desc: 'Orageux', temp: '15°C' }
    ];

    // Utiliser la date pour sélectionner une condition (simulation)
    const dayIndex = date.getDate() % conditions.length;
    const condition = conditions[dayIndex];

    // Mettre à jour le contenu du toast
    const meteoBody = document.querySelector('#meteoToast .toast-body');
    if (meteoBody) {
      meteoBody.innerHTML = `
              <div class="meteo-content">
                  <h5 class="mb-2">Prévisions pour le ${formattedDate}</h5>
                  <div class="d-flex align-items-center">
                      <span class="meteo-icon me-3">${condition.icon}</span>
                      <div>
                          <p class="mb-1">${condition.desc}</p>
                          <p class="mb-0">Température: ${condition.temp}</p>
                      </div>
                  </div>
                  ${condition.desc === 'Pluvieux' || condition.desc === 'Orageux' ?
          '<div class="alert alert-warning mt-2 mb-0">⚠️ Conditions défavorables pour la randonnée</div>' :
          '<div class="alert alert-success mt-2 mb-0">✅ Conditions favorables pour la randonnée</div>'}
              </div>
          `;

      // Afficher le toast
      const meteoToastElement = document.getElementById('meteoToast');
      if (meteoToastElement) {
        const meteoToast = bootstrap.Toast.getInstance(meteoToastElement) ||
          new bootstrap.Toast(meteoToastElement, { autohide: false });
        meteoToast.show();
      }
    }
  }

  // Vérifier si le formulaire est déjà affiché par défaut (sans clic sur le bouton)
  const reservationForm = document.querySelector('.reservation-form');
  if (reservationForm) {
    initFormFunctionality();
  }
});
