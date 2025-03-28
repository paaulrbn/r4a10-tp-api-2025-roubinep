export const guessView = {
    guessInput: document.querySelector("#guess-input"),
    guessButton: document.querySelector("#btn-deviner"),
    feedbackContainer: document.querySelector("#feedback"),
    autocompleteList: document.createElement("ul"),

    initAutocomplete() {
        this.autocompleteList.classList.add("autocomplete-list");
        this.guessInput.parentNode.appendChild(this.autocompleteList);

        // Désactive le bouton "Deviner" si le champ est vide
        this.guessInput.addEventListener("input", () => {
            this.guessButton.disabled = !this.getGuessInputValue();
        });

        // Initialisation de l'état du bouton
        this.guessButton.disabled = true;
    },

    getGuessInputValue() {
        return this.guessInput.value.trim();
    },

    updateAutocompleteSuggestions(suggestions) {
        this.autocompleteList.innerHTML = suggestions
            .map(
                (suggestion) =>
                    `<li>${suggestion.trackName} - ${suggestion.artist}</li>`
            )
            .join("");

        this.autocompleteList.querySelectorAll("li").forEach((item) => {
            item.addEventListener("click", () => {
                this.guessInput.value = item.textContent;
                this.autocompleteList.innerHTML = "";
            });
        });
    },

    appendFeedback(feedback, trackName) {
        const table = document.createElement("table");
        table.innerHTML = `
            <caption>Résultats pour "${trackName}"</caption>
            <thead>
                <tr>
                    <th>Critère</th>
                    <th>Obtenu</th>
                    <th>État</th>
                </tr>
            </thead>
            <tbody>
                ${feedback
                    .map(
                        (item) => `
                    <tr>
                        <td>${item.criterion}</td>
                        <td>${
                            item.criterion === "Popularité"
                                ? `${item.actual}/100`
                                : item.actual
                        }</td>
                        <td style="color: ${item.isCorrect ? "green" : "red"};">
                            ${
                                item.isCorrect
                                    ? "Correct"
                                    : item.hint || "Incorrect"
                            }
                        </td>
                    </tr>
                `
                    )
                    .join("")}
            </tbody>
        `;
        // Ajoute le tableau au début du conteneur des feedbacks
        this.feedbackContainer.prepend(table);
    },

    displayError(message) {
        this.feedbackContainer.innerHTML = `<p style="color: red;">${message}</p>`;
    },

    displaySuccessMessage(message) {
        const successMessage = document.createElement("p");
        successMessage.style.color = "green";
        successMessage.style.fontWeight = "bold";
        successMessage.textContent = message;

        // Ajoute le message de succès au début du conteneur des feedbacks
        this.feedbackContainer.prepend(successMessage);
    },

    onGuessInput(callback) {
        this.guessInput.addEventListener("input", callback);
    },

    onGuessButtonClick(callback) {
        this.guessButton.addEventListener("click", callback);
    },
};

guessView.initAutocomplete();
