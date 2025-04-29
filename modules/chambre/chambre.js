document.addEventListener('DOMContentLoaded', function () {
  // Éléments du DOM
  const confirmButton = document.querySelector('.sejour-validation');
  const confirmationDiv = document.querySelector('.confirm-reas');
  const startDateInput = document.getElementById('date-start');
  const endDateInput = document.getElementById('date-end');
  const personSelect = document.getElementById('personCount');
  const meteoWidget = document.querySelector('meteo-widget');

  // Définir la date minimale (aujourd'hui) pour les champs de date
  const today = new Date().toISOString().split('T')[0];
  startDateInput.min = today;
  endDateInput.min = today;

  // Fonction pour mettre à jour les prévisions météo
  function updateMeteoForecasts() {
    if (!startDateInput.value || !endDateInput.value || !meteoWidget) return;

    // Calcul des dates du séjour
    const start = new Date(startDateInput.value);
    const end = new Date(endDateInput.value);

    // Nettoyer les prévisions actuelles
    const forecastContainer = meteoWidget.querySelector('#meteo-forecast-container');
    if (forecastContainer) {
      forecastContainer.innerHTML = '';
    }

    // Informer le composant météo de la date de début
    meteoWidget.setAttribute('date', startDateInput.value);

    // Ajouter un attribut data pour la date de fin
    meteoWidget.setAttribute('end-date', endDateInput.value);
  }

  // Événement lorsqu'on change la date de début
  startDateInput.addEventListener('change', function () {
    // La date de fin minimum doit être au moins égale à la date de début
    endDateInput.min = startDateInput.value;

    // Si la date de fin est antérieure à la date de début, on la réinitialise
    if (endDateInput.value && endDateInput.value < startDateInput.value) {
      endDateInput.value = startDateInput.value;
    }

    updateMeteoForecasts();
  });

  // Événement lorsqu'on change la date de fin
  endDateInput.addEventListener('change', function () {
    updateMeteoForecasts();
  });

  // Événement au clic sur le bouton de confirmation
  confirmButton.addEventListener('click', function () {
    // Récupération des données
    const dateStart = startDateInput.value;
    const dateEnd = endDateInput.value;
    const personCount = personSelect.value;
    const typeBungalow = document.querySelector('input[name="typeBungalow"]:checked').value;

    // Vérification des dates
    if (!dateStart || !dateEnd) {
      alert('Veuillez sélectionner les dates de votre séjour.');
      return;
    }

    // Création d'un numéro de réservation simplifié
    const typePart = typeBungalow === 'mer' ? 'M' : 'T';
    const randomPart = Math.floor(1000 + Math.random() * 9000); // Nombre à 4 chiffres (1000-9999)
    const reservationNumber = `PIM-${typePart}${randomPart}`;

    // Afficher la confirmation
    confirmationDiv.innerHTML = `
      <div class="reservation-confirmation p-4 my-3 text-center border rounded">
        <h1 class="mb-3">Réservation confirmée !</h1>
        <div class="reservation-details text-start bg-light p-3 rounded mx-auto" style="max-width: 400px;">
          <p><strong>Type :</strong> Bungalow ${typeBungalow === 'mer' ? 'mer' : 'Terre'}</p>
          <p><strong>Dates :</strong> Du ${formatDate(dateStart)} au ${formatDate(dateEnd)}</p>
          <p><strong>Personnes :</strong> ${personCount}</p>
          <p class="mb-0"><strong>Durée :</strong> ${calculateDays(dateStart, dateEnd)} jour(s)</p>
        </div>
        <p class="mt-3 fs-3 fw-semibold">Conservez votre numéro de réservation. Vous en aurez besoin pour réserver des activités.</p>
        <div class="row justify-content-center">
          <p class="fw-bold col-5 fs-4 p-2">Numéro de réservation :</p>
          <p class="reservation-number fs-4 bg-light p-2 rounded col-5">${reservationNumber}</p>
        </div>
      </div>
    `;

    // Scroller vers la confirmation
    confirmationDiv.scrollIntoView({ behavior: 'smooth' });
  });

  // Initialiser l'état d'affichage
  updatePersonCount();
});

// Fonction pour formater les dates
function formatDate(dateString) {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Calculer le nombre de jours
function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Fonction pour l'affichage dynamique du nombre de personnes
function updatePersonCount() {
  const isTerre = document.getElementById('bungalowTerre').checked;
  const terreOptions = document.querySelectorAll('.terre-option');

  terreOptions.forEach(option => {
    option.style.display = isTerre ? 'block' : 'none';
  });

  const personSelect = document.getElementById('personCount');
  if (!isTerre && personSelect.value > 2) {
    personSelect.value = '2';
  }
}
