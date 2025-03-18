import config from "./config.js";
import { SpotifyModel } from "./modelSearch.js";
import { view } from "./view.js";

const model = new SpotifyModel(config.clientId, config.clientSecret);

function init() {
    view.toggleLoading(false); // Ensure the loading GIF is hidden initially
    updateFavoritesList();
    addEventListeners();
}

async function performSearch() {
    const searchTerm = view.searchInput.value.trim();
    if (!searchTerm) return;

    try {
        view.toggleLoading(true);
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
        view.toggleLoading(false);
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
                <div class="res">
                    <img src="${albumImage}" alt="Pochette de ${track.name}" width="100" height="100"/>
                    <div class="track-info">
                        <p class="track-name">${track.name}</p>
                        <p class="track-artist">${track.artists[0].name}</p>
                        <p class="track-album">${track.album.name}</p>
                    </div>
                </div>
            `;
        });
    }

    // Afficher les artistes
    if (data.artists?.items?.length) {
        html += "<h3>Artistes</h3>";
        data.artists.items.forEach((artist) => {
            const artistImage = artist.images[1]?.url || "images/no-image.png";
            html += `
                <div class="res">
                    <img src="${artistImage}" alt="Photo de ${
                artist.name
            }" width="100" height="100"/>
                    <div class="artist-info">
                        <p class="artist-name">${artist.name}</p>
                        <p class="artist-followers">${artist.followers.total.toLocaleString()} followers</p>
                        <a href="${
                            artist.external_urls.spotify
                        }" target="_blank" class="spotify-link">👉 Voir sur Spotify</a>
                    </div>
                </div>
            `;
        });
    }

    // Afficher les albums
    if (data.albums?.items?.length) {
        html += "<h3>Albums</h3>";
        data.albums.items.forEach((album) => {
            const albumImage = album.images[1]?.url || "images/no-image.png";
            html += `
                <div class="res">
                    <img src="${albumImage}" alt="Pochette de ${
                album.name
            }" width="100" height="100"/>
                    <div class="album-info">
                        <p>💿 ${album.name}</p>
                        <p>👤 ${album.artists[0].name}</p>
                        <p>📅 ${album.release_date.split("-")[0]}</p>
                        <a href="${
                            album.external_urls.spotify
                        }" target="_blank" class="spotify-link">👉 Voir sur Spotify</a>
                    </div>
                </div>
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
        model.favorites.push(searchTerm);
    } else {
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
    updateFavoritesList(); // Update the favorites list dynamically
    updateFavoriteButtonState();
}

function updateFavoritesList() {
    view.updateFavoritesList(model.favorites);

    view.favoritesList.querySelectorAll("li span").forEach((span, index) => {
        span.addEventListener("click", () => {
            view.searchInput.value = model.favorites[index];
            updateFavoriteButtonState();
            performSearch();
        });
    });

    view.favoritesList
        .querySelectorAll(".delete-favorite")
        .forEach((img, index) => {
            img.addEventListener("click", () => {
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

function addEventListeners() {
    view.searchInput.addEventListener("input", () => {
        const isEmpty = !view.searchInput.value.trim();
        view.searchButton.disabled = isEmpty;
        view.searchButton.classList.toggle("btn_clicable", !isEmpty);
        view.favoriteButton.disabled = isEmpty;
        updateFavoriteButtonState();
    });

    view.searchButton.addEventListener("click", () => performSearch());
    view.searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !view.searchButton.disabled) {
            performSearch();
        }
    });

    view.favoriteButton.addEventListener("click", () => toggleFavorite());
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
    init();
});
