// js/meteo.js
class Meteo extends HTMLElement {
    constructor() {
        super();
        this.apiKey = "e7d991c522e1541969196e891ec1e65b";
        this.latitude = "-20.23";
        this.longitude = "164.01";
    }

    connectedCallback() {
        this.innerHTML = `
        <div class="meteo-container p-3 bg-light rounded border">
          <h5 class="text-center mb-3">Prévisions météo</h5>
          
          <div id="meteo-initial" class="text-center py-4">
            <i class="bi bi-cloud-sun fs-1 text-info mb-3"></i>
            <p>Veuillez sélectionner les dates de votre séjour pour afficher la météo</p>
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

        // Ajouter des écouteurs d'événements pour les champs de date
        const startDateInput = document.getElementById("date-start");
        const endDateInput = document.getElementById("date-end");

        if (startDateInput && endDateInput) {
            startDateInput.addEventListener("change", () => this.checkDatesAndFetchMeteo());
            endDateInput.addEventListener("change", () => this.checkDatesAndFetchMeteo());
        }
    }

    checkDatesAndFetchMeteo() {
        const startDateInput = document.getElementById("date-start");
        const endDateInput = document.getElementById("date-end");

        if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
            this.fetchMeteo();
        }
    }

    fetchMeteo() {
        // Masquer le message initial
        this.meteoInitial.classList.add("d-none");

        // Afficher l'indicateur de chargement
        this.meteoLoading.classList.remove("d-none");
        this.meteoContent.classList.add("d-none");
        this.meteoError.classList.add("d-none");

        // Récupérer les dates du formulaire
        const startDateInput = document.getElementById("date-start");
        const endDateInput = document.getElementById("date-end");

        if (!startDateInput || !endDateInput || !startDateInput.value || !endDateInput.value) {
            this.showError("Veuillez sélectionner les dates de votre séjour avant de consulter la météo.");
            return;
        }

        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        // Vérifier si les dates sont dans le futur
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
            this.showError("Impossible d'afficher la météo pour des dates passées.");
            return;
        }

        // Vérifier si la date de début est dans les 7 prochains jours (limite de l'API gratuite)
        const maxForecastDate = new Date();
        maxForecastDate.setDate(maxForecastDate.getDate() + 7);

        if (startDate > maxForecastDate) {
            this.showError("Les prévisions météo ne sont disponibles que pour les 7 prochains jours.");
            return;
        }

        // Utiliser l'API de prévision à 5 jours d'OpenWeatherMap
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${this.latitude}&lon=${this.longitude}&appid=${this.apiKey}&units=metric&lang=fr`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des données météo");
                }
                return response.json();
            })
            .then(data => {
                this.displayForecast(data, startDate, endDate);
            })
            .catch(error => {
                console.error(error);
                this.showError("Une erreur est survenue lors de la récupération des prévisions météo.");
            });
    }

    displayForecast(data, startDate, endDate) {
        // Vider le conteneur
        this.meteoForecastContainer.innerHTML = "";

        // Filtrer les prévisions pour les dates de séjour (limité à 5 jours par l'API gratuite)
        const forecastItems = data.list;
        const forecastByDay = {};

        // Organiser les prévisions par jour
        forecastItems.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateString = date.toISOString().split('T')[0];

            if (!forecastByDay[dateString]) {
                forecastByDay[dateString] = [];
            }

            forecastByDay[dateString].push(item);
        });

        // Parcourir chaque jour de séjour (limité aux jours disponibles)
        const maxDays = 5; // Limitation de l'API gratuite
        let dayCount = 0;
        let currentDate = new Date(startDate);

        while (currentDate <= endDate && dayCount < maxDays) {
            const dateString = currentDate.toISOString().split('T')[0];
            const dayForecasts = forecastByDay[dateString];

            if (dayForecasts) {
                // Prendre la prévision de midi ou la première disponible
                let dayForecast = dayForecasts.find(f => {
                    const hour = new Date(f.dt * 1000).getHours();
                    return hour >= 12 && hour <= 14;
                }) || dayForecasts[0];

                // Créer une carte pour ce jour
                const dayCard = this.createDayCard(dayForecast, currentDate);
                this.meteoForecastContainer.appendChild(dayCard);
                dayCount++;
            }

            // Passer au jour suivant
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Si aucune prévision n'est disponible
        if (dayCount === 0) {
            this.showError("Aucune prévision météo n'est disponible pour les dates sélectionnées.");
            return;
        }

        // Afficher les prévisions
        this.meteoLoading.classList.add("d-none");
        this.meteoContent.classList.remove("d-none");
        this.meteoError.classList.add("d-none");
    }

    createDayCard(forecast, date) {
        const card = document.createElement('div');
        card.className = 'col-12 col-md-4 mb-3';

        const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };
        const formattedDate = date.toLocaleDateString('fr-FR', dateOptions);
        const temp = Math.round(forecast.main.temp);
        const description = forecast.weather[0].description;
        const iconCode = forecast.weather[0].icon;
        const humidity = forecast.main.humidity;
        const windSpeed = forecast.wind.speed;

        card.innerHTML = `
        <div class="card h-100">
          <div class="card-header bg-info bg-opacity-25 text-center">
            ${this.capitalizeFirstLetter(formattedDate)}
          </div>
          <div class="card-body text-center">
            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Icône météo">
            <h2 class="card-title">${temp}°C</h2>
            <p class="card-text">${this.capitalizeFirstLetter(description)}</p>
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
