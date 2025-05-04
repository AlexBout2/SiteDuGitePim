import { formatDate, calculateDays } from '../../js/utils.js';
document.addEventListener('DOMContentLoaded', function () {
  const startDateInput = document.getElementById('date-start');
  const endDateInput = document.getElementById('date-end');
  const confirmButton = document.querySelector('.sejour-validation');
  const personSelect = document.getElementById('personCount');
  const meteoWidget = document.querySelector('meteo-widget');
  updateBungalowAvailability();

  // Définir la date minimale (aujourd'hui) pour les champs de date
  const today = new Date().toISOString().split('T')[0];
  startDateInput.min = today;
  endDateInput.min = today;

  function updateBungalowAvailability() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (!startDate || !endDate) return;

    // Récupérer les réservations existantes
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];

    // Pour les bungalows Mer
    const merOptions = document.querySelectorAll('#bungalowMerSelect option:not([disabled="disabled"])');
    merOptions.forEach(option => {
      if (option.value === '') return; // Ignorer l'option par défaut

      const isBooked = reservations.some(reservation => {
        return reservation.bungalowId === option.value &&
          ((new Date(startDate) <= new Date(reservation.endDate)) &&
            (new Date(endDate) >= new Date(reservation.startDate)));
      });

      if (isBooked) {
        option.disabled = true;
        if (!option.textContent.includes('(Non disponible)')) {
          option.textContent = `${option.textContent} (Non disponible)`;
        }
      } else {
        option.disabled = false;
        // Rétablir le texte d'origine sans "(Non disponible)"
        option.textContent = option.textContent.replace(' (Non disponible)', '');
      }
    });

    // Pour les bungalows Jardin
    const jardinOptions = document.querySelectorAll('#bungalowJardinSelect option:not([disabled="disabled"])');
    jardinOptions.forEach(option => {
      if (option.value === '') return; // Ignorer l'option par défaut

      const isBooked = reservations.some(reservation => {
        return reservation.bungalowId === option.value &&
          ((new Date(startDate) <= new Date(reservation.endDate)) &&
            (new Date(endDate) >= new Date(reservation.startDate)));
      });

      if (isBooked) {
        option.disabled = true;
        if (!option.textContent.includes('(Non disponible)')) {
          option.textContent = `${option.textContent} (Non disponible)`;
        }
      } else {
        option.disabled = false;
        // Rétablir le texte d'origine sans "(Non disponible)"
        option.textContent = option.textContent.replace(' (Non disponible)', '');
      }
    });

    // Vérification si tous les bungalows sont indisponibles
    const merAvailable = Array.from(merOptions).some(option => !option.disabled && option.value !== '');
    const jardinAvailable = Array.from(jardinOptions).some(option => !option.disabled && option.value !== '');

    // Éléments pour afficher les messages de disponibilité
    let merMessageElement = document.getElementById('mer-availability-message');
    if (!merMessageElement) {
      merMessageElement = document.createElement('p');
      merMessageElement.id = 'mer-availability-message';
      merMessageElement.className = 'text-danger mt-2 text-center';
      document.getElementById('bungalowMerContainer').appendChild(merMessageElement);
    }

    let jardinMessageElement = document.getElementById('jardin-availability-message');
    if (!jardinMessageElement) {
      jardinMessageElement = document.createElement('p');
      jardinMessageElement.id = 'jardin-availability-message';
      jardinMessageElement.className = 'text-danger mt-2 text-center';
      document.getElementById('bungalowJardinContainer').appendChild(jardinMessageElement);
    }

    // Mettre à jour les messages
    merMessageElement.textContent = !merAvailable ? 'Aucun bungalow Mer disponible pour ces dates.' : '';
    jardinMessageElement.textContent = !jardinAvailable ? 'Aucun bungalow Jardin disponible pour ces dates.' : '';

    // Réinitialiser les sélections si l'option sélectionnée est maintenant désactivée
    const merSelect = document.getElementById('bungalowMerSelect');
    const jardinSelect = document.getElementById('bungalowJardinSelect');

    if (merSelect.selectedIndex > 0 && merSelect.options[merSelect.selectedIndex].disabled) {
      merSelect.selectedIndex = 0;
    }

    if (jardinSelect.selectedIndex > 0 && jardinSelect.options[jardinSelect.selectedIndex].disabled) {
      jardinSelect.selectedIndex = 0;
    }
  }

  // Modifiez vos écouteurs d'événements existants pour inclure l'appel à updateBungalowAvailability
  startDateInput.addEventListener('change', function () {
    const dateString = startDateInput.value;
    endDateInput.min = dateString;

    if (endDateInput.value && endDateInput.value < startDateInput.value) {
      endDateInput.value = startDateInput.value;
    }

    const formattedDate = formatDate(dateString);
    const numberOfDays = calculateDays(dateString, endDateInput.value);
    updateMeteoForecasts();
    updateBungalowAvailability(); // Ajout de cette ligne
  });

  endDateInput.addEventListener('change', function () {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (startDate && endDate) {
      const numberOfDays = calculateDays(startDate, endDate);
    }
    updateMeteoForecasts();
    updateBungalowAvailability(); // Ajout de cette ligne
  });

  // Dans votre initialisation
  document.querySelectorAll('input[name="bungalowType"]').forEach(input => {
    input.addEventListener('change', function () {
      updateBungalowOptions();
      updatePersonCount();
      updateBungalowAvailability(); // Ajout de cette ligne
    });
  });

  // Appel initial pour initialiser les disponibilités
  updateBungalowAvailability();


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

  // Fonction pour l'affichage dynamique du nombre de personnes
  function updatePersonCount() {
    const isTerre = document.getElementById('bungalowJardin').checked;
    const terreOptions = document.querySelectorAll('.terre-option');

    terreOptions.forEach(option => {
      option.style.display = isTerre ? 'block' : 'none';
    });

    const personSelect = document.getElementById('personCount');
    if (!isTerre && personSelect.value > 2) {
      personSelect.value = '2';
    }
  }

  function updateBungalowOptions() {
    const bungalowMer = document.getElementById('bungalowMer');
    const bungalowJardin = document.getElementById('bungalowJardin');

    const bungalowMerContainer = document.getElementById('bungalowMerContainer');
    const bungalowJardinContainer = document.getElementById('bungalowJardinContainer');

    if (bungalowMer.checked) {
      bungalowMerContainer.classList.remove('d-none');
      bungalowJardinContainer.classList.add('d-none');
    } else if (bungalowJardin.checked) {
      bungalowMerContainer.classList.add('d-none');
      bungalowJardinContainer.classList.remove('d-none');
    } else {
      bungalowMerContainer.classList.add('d-none');
      bungalowJardinContainer.classList.add('d-none');
    }
    updatePersonCount();
  }

  // Fonction pour générer un numéro de réservation
  function generateReservationNumber() {
    let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const year = new Date(startDateInput.value).getFullYear().toString().slice(-2); // AA
    const month = (new Date(startDateInput.value).getMonth() + 1).toString().padStart(2, '0'); // MM
    const count = reservations.length + 1; // Incrément pour le numéro

    return `CH${year}${month}${count.toString().padStart(3, '0')}`;
  }



  confirmButton.addEventListener('click', function () {
    // Récupération des données
    const dateStart = startDateInput.value;
    const dateEnd = endDateInput.value;
    const personCount = personSelect.value;


    // Vérification des bungalow **************************************
    let bungalowSelected;
    // Vérifiez quelle option est sélectionnée
    if (document.getElementById('bungalowMer').checked) {
      bungalowSelected = bungalowMerSelect.value;
    } else if (document.getElementById('bungalowJardin').checked) {
      bungalowSelected = bungalowJardinSelect.value;
    }

    // Vérification des champs obligatoires
    if (!dateStart || !dateEnd || !bungalowSelected) {
      alert('Veuillez remplir tous les champs nécessaires.');
      return;
    }

    // Vérification de la capacité
    if ((bungalowSelected.startsWith('ME') && personCount > 2) ||
      (bungalowSelected.startsWith('JA') && personCount > 4)) {
      alert('Le nombre de personnes ne peut pas dépasser la limite pour ce type de bungalow.');
      return;
    }

    // Vérifier si le bungalow a déjà été réservé dans les dates données
    let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const overlap = reservations.some(reservation => {
      return reservation.bungalowId === bungalowSelected &&
        ((new Date(dateStart) <= new Date(reservation.endDate)) &&
          (new Date(dateEnd) >= new Date(reservation.startDate)));
    });
    if (overlap) {
      alert('Ce bungalow est déjà réservé pour les dates sélectionnées. Veuillez choisir d\'autres dates ou un autre bungalow.');
      return;
    }

    let typeBungalow = '';
    if (document.getElementById('bungalowMer').checked) {
      typeBungalow = 'mer';
    } else if (document.getElementById('bungalowJardin').checked) {
      typeBungalow = 'jardin';
    }

    // Vérification des bungalow end **************************************
    const reservationNumber = generateReservationNumber();

    // Afficher la confirmation
    const confirmationDiv = document.querySelector('.confirm-resa');
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

    reservations.push({
      reservationNumber,
      bungalowId: bungalowSelected,
      startDate: dateStart,
      endDate: dateEnd
    });
    localStorage.setItem('reservations', JSON.stringify(reservations));
    confirmationDiv.scrollIntoView({ behavior: 'smooth' });

  });


  // Initialiser l'état d'affichage
  updateBungalowOptions();
  document.querySelectorAll('input[name="bungalowType"]').forEach(input => {
    input.addEventListener('change', updateBungalowOptions);
    updatePersonCount();
    updateBungalowOptions();
    updateBungalowAvailability();
  });
});

updateBungalowAvailability();
