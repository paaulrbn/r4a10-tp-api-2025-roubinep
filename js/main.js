import config from "./config.js";
import { SpotifyModel } from "./modelSearch.js";
import { view } from "./view.js";

const model = new SpotifyModel(config.clientId, config.clientSecret);

function init() {
    toggleLoading(false);
    updateFavoritesList();
    addEventListeners();
}

async function performSearch() {
    const searchTerm = view.searchInput.value.trim();
    if (!searchTerm) return;

    try {
        toggleLoading(true);
        view.resultsContainer.innerHTML = "";

        const token = await model.getAccessToken();
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                searchTerm
            )}&type=track,artist,album&limit=10`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        view.resultsContainer.innerHTML =
            '<p class="info-vide">Une erreur est survenue lors de la recherche.</p>';
    } finally {
        toggleLoading(false);
    }
}

function displayResults(data) {
    if (
        !data.tracks?.items?.length &&
        !data.artists?.items?.length &&
        !data.albums?.items?.length
    ) {
        view.resultsContainer.innerHTML =
            '<p class="info-vide">(Aucun résultat trouvé)</p>';
        return;
    }

    let html = "";

    // Afficher les pistes
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

    // Afficher les artistes
    if (data.artists?.items?.length) {
        html += "<h3>Artistes</h3>";
        data.artists.items.forEach((artist) => {
            const artistImage = artist.images[1]?.url || "images/no-image.png";
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

    // Afficher les albums
    if (data.albums?.items?.length) {
        html += "<h3>Albums</h3>";
        data.albums.items.forEach((album) => {
            const albumImage = album.images[1]?.url || "images/no-image.png";
            html += `
                <a href="${album.external_urls.spotify}" target="_blank">
                    <div class="res">
                        <img src="${albumImage}" alt="Pochette de ${
                album.name
            }" width="100" height="100"/>
                        <div class="album-info">
                            <p class="album-name">${album.name}</p>
                            <p class="album-artist">${album.artists[0].name}</p>
                            <p class="album-release">${
                                album.release_date.split("-")[0]
                            }</p>
                        </div>
                    </div>
                </a>
            `;
        });
    }

    view.resultsContainer.innerHTML = html;
}

function toggleFavorite() {
    const searchTerm = view.searchInput.value.trim();
    if (!searchTerm) return;

    const index = model.favorites.indexOf(searchTerm);

    if (index === -1) {
        // Add to favorites
        model.favorites.push(searchTerm);
    } else {
        // Confirm before removing from favorites
        if (
            confirm(
                `Voulez-vous vraiment supprimer "${searchTerm}" des favoris ?`
            )
        ) {
            model.favorites.splice(index, 1);
        } else {
            return;
        }
    }

    model.saveFavorites();
    updateFavoritesList();
    updateFavoriteButtonState();
}

function updateFavoritesList() {
    displayFavoritesList(model.favorites);

    view.favoritesList.querySelectorAll("li").forEach((span, index) => {
        span.addEventListener("click", () => {
            view.searchInput.value = model.favorites[index];
            updateFavoriteButtonState();
            performSearch();
        });
    });

    view.favoritesList
        .querySelectorAll(".delete-favorite")
        .forEach((img, index) => {
            img.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent triggering the click on the favorite span
                if (
                    confirm(
                        `Voulez-vous vraiment supprimer "${model.favorites[index]}" des favoris ?`
                    )
                ) {
                    model.favorites.splice(index, 1);
                    model.saveFavorites();
                    updateFavoritesList(); // Update the favorites list dynamically
                    updateFavoriteButtonState();
                }
            });
        });
}

function updateFavoriteButtonState() {
    const searchTerm = view.searchInput.value.trim();

    if (!searchTerm) {
        // If the input is empty, disable the button and set it to default (gray background)
        view.favoriteButton.disabled = true;
        view.favoriteButton.classList.remove("btn_clicable");
        view.favoriteButton.querySelector("img").src = "images/etoile-vide.svg";
        return;
    }

    const isFavorite = model.favorites.includes(searchTerm);

    // Enable the button and set the background to green
    view.favoriteButton.disabled = false;
    view.favoriteButton.classList.add("btn_clicable");
    view.favoriteButton.querySelector("img").src = isFavorite
        ? "images/etoile-pleine.svg" // Full star for existing favorite
        : "images/etoile-vide.svg"; // Empty star for non-favorite
}

function addEventListeners() {
    view.searchInput.addEventListener("input", () => {
        const isEmpty = !view.searchInput.value.trim();
        view.searchButton.disabled = isEmpty;
        view.searchButton.classList.toggle("btn_clicable", !isEmpty);
        updateFavoriteButtonState();
    });

    view.searchButton.addEventListener("click", () => performSearch());
    view.searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !view.searchButton.disabled) {
            performSearch();
        }
    });

    view.favoriteButton.addEventListener("click", () => {
        if (!view.favoriteButton.disabled) {
            toggleFavorite();
        }
    });
}

function toggleLoading(show) {
    view.loadingGif.style.display = show ? "block" : "none";
}

function displayFavoritesList(favorites) {
    const noFavoritesMessage = document.querySelector(
        "#section-favoris .info-vide"
    );

    if (!noFavoritesMessage) {
        console.error("Element '.info-vide' not found in #section-favoris");
        return;
    }

    if (favorites.length === 0) {
        view.favoritesList.innerHTML = "";
        noFavoritesMessage.style.display = "block";
    } else {
        noFavoritesMessage.style.display = "none";
        view.favoritesList.innerHTML = favorites
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
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
    init();
});
