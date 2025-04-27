document.addEventListener('DOMContentLoaded', function () {
    // Sélection des éléments
    const horseCards = document.querySelectorAll('.horse-card');
    const selectedHorseInput = document.getElementById('selected-horse');
    const reservationForm = document.querySelector('.reservation-form');
    const dateInput = document.getElementById('date');
    const reservationNumber = document.getElementById('reservation-number');
    const periodeSelect = document.getElementById('periode');
    const meteoToast = new bootstrap.Toast(document.getElementById('meteoToast'), {
        autohide: false
    });

    // Configuration de la date minimum (aujourd'hui)
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Fonction pour mettre à jour la météo selon la date
    function updateMeteo(selectedDate) {
        const meteoBody = document.querySelector('.toast-body');
        const date = new Date(selectedDate);
        const options = { weekda& y: 'long', year: 'numeric', month: 'long', day: 'numeric'
    };
    const formattedDate = date.toLocaleDateString('fr-FR', options);

    // Simuler différentes conditions météo selon la date
    // En réalité, vous utiliseriez une API météo ici
    const conditions = [
        { icon: '☀️', desc: 'Ensoleillé', temp: '22°C' },
        { icon: '⛅', desc: 'Partiellement nuageux', temp: '19°C' },
        { icon: '🌧️', desc: 'Pluvieux', temp: '15°C' },
        { icon: '⛈️', desc: 'Orageux', temp: '17°C' },
        { icon: '☁️', desc: 'Nuageux', temp: '18°C' }
    ];

    // Utiliser la date pour sélectionner une condition (simulation)
    const dayIndex = date.getDate() % conditions.length;
    const condition = conditions[dayIndex];

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

    meteoToast.show();
}

    // Écouteur d'événement pour le changement de date
    dateInput.addEventListener('change', function () {
    if (this.value) {
        updateMeteo(this.value);
    }
});

// Gestion de la sélection des chevaux
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

// Validation du formulaire
reservationForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!reservationNumber.value) {
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
        reservationNumber: reservationNumber.value,
        horse: selectedHorseInput.value,
        date: dateInput.value,
        periode: periodeSelect.value
    };

    console.log('Données de réservation:', reservationData);
    alert('Réservation enregistrée avec succès !');
});
});