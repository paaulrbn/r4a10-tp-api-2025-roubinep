export const view = {
    searchInput: document.querySelector("#bloc-recherche input"),
    searchButton: document.querySelector("#btn-lancer-recherche"),
    favoriteButton: document.querySelector("#btn-favoris"),
    loadingGif: document.querySelector("#bloc-gif-attente"),
    resultsContainer: document.querySelector("#bloc-resultats"),
    favoritesList: document.querySelector("#liste-favoris"),

    toggleLoading(show) {
        this.loadingGif.style.display = show ? "block" : "none";
    },

    updateFavoritesList(favorites) {
        const noFavoritesMessage = document.querySelector(
            "#section-favoris .info-vide"
        );

        if (favorites.length === 0) {
            this.favoritesList.innerHTML = "Aucune recherche favorite";
            noFavoritesMessage.style.display = "block";
        } else {
            noFavoritesMessage.style.display = "none";
            this.favoritesList.innerHTML = favorites
                .map(
                    (term) => `
                        <li>
                            <span title="Cliquer pour relancer la recherche">${term}</span>
                            <img
                                src="images/croix.svg"
                                alt="Icone pour supprimer le favori"
                                width="15"
                                title="Cliquer pour supprimer le favori"
                                class="delete-favorite"
                            />
                        </li>
                    `
                )
                .join("");
        }
    },
};
