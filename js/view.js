export const view = {
    searchInput: document.querySelector("#bloc-recherche input"),
    searchButton: document.querySelector("#btn-lancer-recherche"),
    favoriteButton: document.querySelector("#btn-favoris"),
    loadingGif: document.querySelector("#bloc-gif-attente"),
    resultsContainer: document.querySelector("#bloc-resultats"),
    favoritesList: document.querySelector("#liste-favoris"),

    getSearchInputValue() {
        return this.searchInput.value.trim();
    },

    setSearchInputValue(value) {
        this.searchInput.value = value;
    },

    toggleLoading(show) {
        this.loadingGif.style.display = show ? "block" : "none";
    },

    clearResults() {
        this.resultsContainer.innerHTML = "";
    },

    displayResults(data) {
        // Vérifie si les résultats sont vides
        if (
            !data.tracks?.items?.length &&
            !data.artists?.items?.length &&
            !data.albums?.items?.length
        ) {
            this.resultsContainer.innerHTML =
                '<p class="info-vide">(Aucun résultat trouvé)</p>';
            return;
        }

        let html = "";

        // Affiche les chansons
        if (data.tracks?.items?.length) {
            html += "<h3>Chansons</h3>";
            data.tracks.items.forEach((track) => {
                const albumImage =
                    track.album.images[1]?.url || "images/no-image.png";
                html += `
                    <a href="${track.external_urls.spotify}" target="_blank">
                        <div class="res">
                            <img src="${albumImage}" alt="Pochette de ${track.name}" width="100" height="100"/>
                            <div class="track-info">
                                <p class="track-name">${track.name}</p>
                                <p class="track-artist">${track.artists[0].name}</p>
                                <p class="track-album">${track.album.name}</p>
                            </div>
                        </div>
                    </a>
                `;
            });
        }

        // Affiche les artistes
        if (data.artists?.items?.length) {
            html += "<h3>Artistes</h3>";
            data.artists.items.forEach((artist) => {
                const artistImage =
                    artist.images[1]?.url || "images/no-image.png";
                html += `
                    <a href="${artist.external_urls.spotify}" target="_blank">
                        <div class="res">
                            <img class="artist-img" src="${artistImage}" alt="Photo de ${
                    artist.name
                }" width="100" height="100"/>
                            <div class="artist-info">
                                <p class="artist-name">${artist.name}</p>
                                <p class="artist-followers">${artist.followers.total.toLocaleString()} followers</p>
                            </div>
                        </div>
                    </a>
                `;
            });
        }

        // Affiche les albums
        if (data.albums?.items?.length) {
            html += "<h3>Albums</h3>";
            data.albums.items.forEach((album) => {
                const albumImage =
                    album.images[1]?.url || "images/no-image.png";
                html += `
                    <a href="${album.external_urls.spotify}" target="_blank">
                        <div class="res">
                            <img src="${albumImage}" alt="Pochette de ${
                    album.name
                }" width="100" height="100"/>
                            <div class="album-info">
                                <p class="album-name">${album.name}</p>
                                <p class="album-artist">${
                                    album.artists[0].name
                                }</p>
                                <p class="album-release">${
                                    album.release_date.split("-")[0]
                                }</p>
                            </div>
                        </div>
                    </a>
                `;
            });
        }

        // Injecte le HTML généré dans le conteneur des résultats
        this.resultsContainer.innerHTML = html;
    },

    displayError(message) {
        this.resultsContainer.innerHTML = `<p class="info-vide">${message}</p>`;
    },

    updateFavoritesList(favorites, onFavoriteClick, onDeleteClick) {
        const noFavoritesMessage = document.querySelector(
            "#section-favoris .info-vide"
        );

        // Si aucun favori, affiche un message
        if (favorites.length === 0) {
            this.favoritesList.innerHTML = "";
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

            // Ajoute des événements pour relancer une recherche ou supprimer un favori
            this.favoritesList
                .querySelectorAll("li span")
                .forEach((span, index) => {
                    span.addEventListener("click", () =>
                        onFavoriteClick(favorites[index])
                    );
                });

            this.favoritesList
                .querySelectorAll(".delete-favorite")
                .forEach((img, index) => {
                    img.addEventListener("click", (event) => {
                        event.stopPropagation();
                        onDeleteClick(favorites[index]);
                    });
                });
        }
    },

    updateFavoriteButtonState(searchTerm, isFavorite) {
        // Met à jour l'état du bouton favori en fonction du terme recherché
        if (!searchTerm) {
            this.favoriteButton.disabled = true;
            this.favoriteButton.classList.remove("btn_clicable");
            this.favoriteButton.querySelector("img").src =
                "images/etoile-vide.svg";
            return;
        }

        this.favoriteButton.disabled = false;
        this.favoriteButton.classList.add("btn_clicable");
        this.favoriteButton.querySelector("img").src = isFavorite
            ? "images/etoile-pleine.svg"
            : "images/etoile-vide.svg";
    },

    onSearchInputChange(callback) {
        this.searchInput.addEventListener("input", callback);
    },

    onSearchButtonClick(callback) {
        this.searchButton.addEventListener("click", callback);
    },

    onFavoriteButtonClick(callback) {
        this.favoriteButton.addEventListener("click", callback);
    },

    onSearchInputKeyPress(callback) {
        this.searchInput.addEventListener("keypress", callback);
    },
};
