window.addEventListener("DOMContentLoaded", function () {
    const resaCheckButton = document.querySelector(".sejour-validation");

    resaCheckButton.addEventListener("click", function (event) {
        event.preventDefault();
        const fullFormContainer = document.querySelector(".fullForm");

        if (fullFormContainer && fullFormContainer.innerHTML.trim() === "") {
            // Adaptation du formulaire pour utiliser une seule date
            const formHTML = `
                <div class="col-md-8 mx-auto text-center">
                    <form class="reservation-form">
                        <div class="form-group mb-3">
                            <label for="NbKidGa" class="fs-4">Nombre d'enfants</label>
                            <input class="form-control" id="NbKidGa" type="number" min="1" max="15">
                            <div class="invalid-feedback">Maximum 15 enfants autorisé</div>
                        </div>
                        
                        <hr class="separator my-3">
                        
                        <div class="form-group mb-3">
                            <label for="DateGa" class="fs-4">Date de la garderie</label>
                            <input type="date" class="form-control" id="DateGa" required>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="StartTimeGa" class="fs-4">Heure de début</label>
                                    <input type="time" class="form-control" id="StartTimeGa" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="EndTimeGa" class="fs-4">Heure de fin</label>
                                    <input type="time" class="form-control" id="EndTimeGa" required>
                                    <div class="invalid-feedback" id="duration-feedback">La durée de garde ne peut pas dépasser 4 heures</div>
                                </div>
                            </div>
                        </div>

                        <!-- Intégration du composant météo comme composant webcomponent -->
                        <div class="mb-3 mt-3">
                            <meteo-widget></meteo-widget>
                        </div>
                        
                        <hr class="separator my-3">

                        <div class="form-group mb-3">
                            <label for="Raison" class="fs-4">Raison de garde</label>
                            <textarea class="form-control" id="Raison" placeholder="Ex: Nous souhaitons profiter de la journée pour faire notre randonnée à cheval" rows="3"></textarea>
                        </div>

                        <div class="d-flex justify-content-center mb-3">
                            <div class="btn-reservation">
                                <span class="btn-text">
                                    Réserver ma garderie
                                </span>
                            </div>
                        </div>
                    </form>
                </div>
            `;

            fullFormContainer.innerHTML = formHTML;

            // Initialisation des fonctionnalités du formulaire
            initFormFunctionality();
        }
    });

    // Fonction pour initialiser les fonctionnalités du formulaire après injection
    function initFormFunctionality() {
        // Récupérer les éléments du formulaire
        const form = document.querySelector(".reservation-form");
        const nbKidInput = document.getElementById("NbKidGa");
        const dateInput = document.getElementById("DateGa");
        const startTimeInput = document.getElementById("StartTimeGa");
        const endTimeInput = document.getElementById("EndTimeGa");
        const meteoWidget = document.querySelector("meteo-widget");
        const submitButton = form.querySelector(".btn-reservation");

        // Configuration de la date minimum (aujourd'hui)
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;

        // Vérifier la durée maximale de garde (4 heures)
        function checkDuration() {
            if (startTimeInput.value && endTimeInput.value) {
                // Créer des objets Date pour le jour sélectionné avec les heures de début et de fin
                const startDateTime = new Date(`${dateInput.value || today}T${startTimeInput.value}`);
                const endDateTime = new Date(`${dateInput.value || today}T${endTimeInput.value}`);

                // Si l'heure de fin est avant l'heure de début, on suppose que c'est le jour suivant
                if (endDateTime < startDateTime) {
                    endDateTime.setDate(endDateTime.getDate() + 1);
                }

                const durationMs = endDateTime - startDateTime;
                const durationHours = durationMs / (1000 * 60 * 60);

                if (durationHours > 4) {
                    endTimeInput.classList.add("is-invalid");
                    document.getElementById("duration-feedback").style.display = "block";
                    return false;
                } else {
                    endTimeInput.classList.remove("is-invalid");
                    document.getElementById("duration-feedback").style.display = "none";
                    return true;
                }
            }
            return true;
        }

        // Mettre à jour la météo lorsque la date change
        dateInput.addEventListener("change", function () {
            // Mettre à jour l'attribut date du composant météo
            if (dateInput.value && meteoWidget) {
                meteoWidget.setAttribute('date', dateInput.value);
            }
        });

        // Vérifier le nombre maximum d'enfants (15)
        nbKidInput.addEventListener("input", function () {
            if (parseInt(nbKidInput.value) > 15) {
                nbKidInput.classList.add("is-invalid");
            } else {
                nbKidInput.classList.remove("is-invalid");
            }
        });

        // Ajouter des événements pour vérifier la durée
        [startTimeInput, endTimeInput].forEach(input => {
            input.addEventListener("change", checkDuration);
        });

        // Validation du formulaire avec le bouton stylisé
        submitButton.addEventListener("click", function (event) {
            event.preventDefault();

            // Vérifier le nombre d'enfants
            if (!nbKidInput.value || parseInt(nbKidInput.value) > 15 || parseInt(nbKidInput.value) < 1) {
                nbKidInput.classList.add("is-invalid");
                return false;
            }

            // Vérifier la durée
            if (!checkDuration()) {
                return false;
            }

            // Vérifier les champs obligatoires
            const requiredFields = [dateInput, startTimeInput, endTimeInput];
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value) {
                    field.classList.add("is-invalid");
                    isValid = false;
                } else {
                    field.classList.remove("is-invalid");
                }
            });

            if (!isValid) {
                return false;
            }

            // Récupérer le numéro de séjour
            const reservationNumber = document.getElementById("reservation-number").value;
            if (!reservationNumber) {
                alert("Le numéro de séjour est requis");
                return false;
            }

            // Si tout est valide, soumettre le formulaire
            const formData = {
                numeroSejour: reservationNumber,
                nbEnfants: nbKidInput.value,
                date: dateInput.value,
                heureDebut: startTimeInput.value,
                heureFin: endTimeInput.value,
                raison: document.getElementById("Raison").value
            };

            console.log("Données de réservation:", formData);
            alert("Réservation de garderie enregistrée avec succès!");
        });
    }
});
