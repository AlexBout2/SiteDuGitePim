class Meteo extends HTMLElement {
  constructor() {
    super();
    this.apiKey = "e7d991c522e1541969196e891ec1e65b";
    this.latitude = "-20.23";
    this.longitude = "164.01";
    this.render();
  }

  static get observedAttributes() {
    return ['date', 'end-date'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'date' && newValue && oldValue !== newValue) {
      // Si nous avons également une date de fin, récupérez-la
      const endDateAttr = this.getAttribute('end-date');

      if (endDateAttr) {
        // Afficher les prévisions pour la période
        this.fetchMultiDayMeteoData(newValue, endDateAttr);
      } else {
        // Comportement original - une seule date
        this.fetchMeteoData(newValue);
      }
    } else if (name === 'end-date' && newValue && oldValue !== newValue && this.getAttribute('date')) {
      // Si la date de fin change et que nous avons déjà une date de début
      this.fetchMultiDayMeteoData(this.getAttribute('date'), newValue);
    }
  }

  render() {
    this.innerHTML = `
        <div class="meteo-container p-3 bg-light rounded border">
          <h5 class="text-center mb-3">Prévisions météo</h5>
          
          <div id="meteo-initial" class="text-center py-4">
            <i class="bi bi-cloud-sun fs-1 text-info mb-3"></i>
            <p>Veuillez sélectionner une date pour afficher la météo</p>
          </div>
          
          <div id="meteo-loading" class="text-center py-4 d-none">
            <div class="spinner-border text-info" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
            <p>Récupération des prévisions météo...</p>
          </div>
          
          <div id="meteo-content" class="d-none">
            <div id="meteo-forecast-container" class="row justify-content-center"></div>
          </div>
          
          <div id="meteo-error" class="d-none text-danger text-center py-4">
            <i class="bi bi-exclamation-triangle fs-3 mb-2"></i>
            <p>Erreur : Impossible de récupérer les prévisions météo.</p>
          </div>
        </div>
      `;

    this.meteoInitial = this.querySelector("#meteo-initial");
    this.meteoLoading = this.querySelector("#meteo-loading");
    this.meteoContent = this.querySelector("#meteo-content");
    this.meteoError = this.querySelector("#meteo-error");
    this.meteoForecastContainer = this.querySelector("#meteo-forecast-container");
  }

  connectedCallback() {
    // Si le composant est dans le formulaire cheval
    const dateInput = document.getElementById("date");
    if (dateInput && dateInput.value) {
      this.fetchMeteoData(dateInput.value);
    }
  }

  // Méthode originale pour une seule date
  fetchMeteoData(selectedDate) {
    // Masquer le message initial
    this.meteoInitial.classList.add("d-none");

    // Afficher l'indicateur de chargement
    this.meteoLoading.classList.remove("d-none");
    this.meteoContent.classList.add("d-none");
    this.meteoError.classList.add("d-none");

    const startDate = new Date(selectedDate);

    // Limiter la date à 7 jours dans le futur
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);

    // Si la date est trop éloignée, afficher un message d'erreur
    if (startDate > maxDate) {
      this.showError("Les prévisions ne sont disponibles que pour les 7 prochains jours.");
      return;
    }

    // Récupérer les prévisions météo pour la journée spécifiée
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${this.latitude}&lon=${this.longitude}&appid=${this.apiKey}&units=metric&lang=fr`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données météo");
        }
        return response.json();
      })
      .then(data => {
        // Nettoyer l'ancien contenu
        this.meteoForecastContainer.innerHTML = "";

        // Filtrer les prévisions pour la date spécifiée
        const forecastsForDay = data.list.filter(item => {
          const itemDate = new Date(item.dt * 1000);
          return itemDate.toDateString() === startDate.toDateString();
        });

        if (forecastsForDay.length === 0) {
          this.showError("Aucune prévision disponible pour cette date.");
          return;
        }

        // Prendre la prévision de midi ou la première disponible
        let mainForecast = forecastsForDay.find(f => {
          const hour = new Date(f.dt * 1000).getHours();
          return hour >= 12 && hour <= 14;
        }) || forecastsForDay[0];

        // Créer la carte de météo
        const dayCard = this.createDayCard(mainForecast, startDate);
        this.meteoForecastContainer.appendChild(dayCard);

        // Afficher le conteneur de contenu
        this.meteoLoading.classList.add("d-none");
        this.meteoContent.classList.remove("d-none");
      })
      .catch(error => {
        console.error(error);
        this.showError("Une erreur est survenue lors de la récupération des prévisions météo.");
      });
  }

  // Nouvelle méthode pour plusieurs jours
  fetchMultiDayMeteoData(startDateStr, endDateStr) {
    // Masquer le message initial
    this.meteoInitial.classList.add("d-none");

    // Afficher l'indicateur de chargement
    this.meteoLoading.classList.remove("d-none");
    this.meteoContent.classList.add("d-none");
    this.meteoError.classList.add("d-none");

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Limiter la date à 7 jours dans le futur pour respecter les limites de l'API
    const maxForecastDate = new Date();
    maxForecastDate.setDate(maxForecastDate.getDate() + 7);

    // Si la date de début est trop éloignée, afficher un message d'erreur
    if (startDate > maxForecastDate) {
      this.showError("Les prévisions ne sont disponibles que pour les 7 prochains jours.");
      return;
    }

    // Récupérer les prévisions météo
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${this.latitude}&lon=${this.longitude}&appid=${this.apiKey}&units=metric&lang=fr`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données météo");
        }
        return response.json();
      })
      .then(data => {
        // Nettoyer l'ancien contenu
        this.meteoForecastContainer.innerHTML = "";

        // Calculer les jours entre la date de début et de fin (max 7 jours)
        const days = Math.min(
          Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1,
          7
        );

        // Pour chaque jour
        for (let i = 0; i < days; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(currentDate.getDate() + i);

          // Ne pas dépasser la date maximale de prévision
          if (currentDate > maxForecastDate) break;

          // Trouver les prévisions pour ce jour dans les données
          this.displayForecastForDay(data, currentDate);
        }

        // Afficher le conteneur de contenu
        this.meteoLoading.classList.add("d-none");
        this.meteoContent.classList.remove("d-none");
      })
      .catch(error => {
        console.error(error);
        this.showError("Une erreur est survenue lors de la récupération des prévisions météo.");
      });
  }

  // Méthode pour afficher les prévisions pour un jour spécifique
  displayForecastForDay(data, date) {
    // Filtrer les prévisions pour le jour spécifié
    const forecastsForDay = data.list.filter(item => {
      const itemDate = new Date(item.dt * 1000);
      return itemDate.toDateString() === date.toDateString();
    });

    if (forecastsForDay.length === 0) {
      console.warn(`Aucune prévision disponible pour ${date.toDateString()}`);
      return;
    }

    // Prendre la prévision de midi ou la première disponible
    let mainForecast = forecastsForDay.find(f => {
      const hour = new Date(f.dt * 1000).getHours();
      return hour >= 12 && hour <= 14;
    }) || forecastsForDay[0];

    // Créer la carte de météo
    const dayCard = this.createDayCard(mainForecast, date);
    this.meteoForecastContainer.appendChild(dayCard);
  }

  // Créer une carte de météo pour un jour donné
  createDayCard(forecast, date) {
    const temp = Math.round(forecast.main.temp);
    const weatherIcon = forecast.weather[0].icon;
    const weatherDesc = this.capitalizeFirstLetter(forecast.weather[0].description);
    const options = { weekday: 'short', day: 'numeric', month: 'long' };
    const formattedDay = date.toLocaleDateString('fr-FR', options);

    const card = document.createElement('div');
    card.className = 'col-md-4 col-lg-3 mb-3';
    card.innerHTML = `
      <div class="card h-100 text-center">
        <div class="card-header bg-primary text-white">
          ${formattedDay}
        </div>
        <div class="card-body d-flex flex-column justify-content-center">
          <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${weatherDesc}" class="mx-auto mb-2" style="width: 70px;">
          <h5 class="card-title mb-0">${temp}°C</h5>
          <p class="card-text text-muted small mb-2">${weatherDesc}</p>
        </div>
      </div>
    `;
    return card;
  }

  showError(message) {
    this.meteoInitial.classList.add("d-none");
    this.meteoLoading.classList.add("d-none");
    this.meteoContent.classList.add("d-none");
    this.meteoError.classList.remove("d-none");
    this.meteoError.innerHTML = `
        <i class="bi bi-exclamation-triangle fs-3 mb-2"></i>
        <p>${message}</p>
      `;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

// Définir le nouvel élément
customElements.define("meteo-widget", Meteo);
