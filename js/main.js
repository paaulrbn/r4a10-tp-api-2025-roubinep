import config from "./config.js";
import { SpotifyModel } from "./modelSearch.js";
import { view } from "./view.js";

const model = new SpotifyModel(config.clientId, config.clientSecret);

function init() {
    view.toggleLoading(false);
    updateFavoritesList();
    addEventListeners();
}

async function performSearch() {
    const searchTerm = view.getSearchInputValue();
    if (!searchTerm) return;

    try {
        view.toggleLoading(true);
        view.clearResults();

        // Récupère le token d'accès et effectue une recherche sur Spotify
        const token = await model.getAccessToken();
        const data = await model.searchSpotify(searchTerm, token);

        // Affiche les résultats dans la vue
        view.displayResults(data);
    } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        view.displayError("Une erreur est survenue lors de la recherche.");
    } finally {
        view.toggleLoading(false);
    }
}

function toggleFavorite() {
    const searchTerm = view.getSearchInputValue();
    if (!searchTerm) return;

    const isFavorite = model.isFavorite(searchTerm);

    // Ajoute ou supprime le favori en fonction de son état actuel
    if (isFavorite) {
        if (
            confirm(
                `Voulez-vous vraiment supprimer "${searchTerm}" des favoris ?`
            )
        ) {
            model.removeFavorite(searchTerm);
        }
    } else {
        model.addFavorite(searchTerm);
    }

    // Met à jour la liste des favoris et l'état du bouton
    updateFavoritesList();
    view.updateFavoriteButtonState(searchTerm, model.isFavorite(searchTerm));
}

function updateFavoritesList() {
    const favorites = model.getFavorites();

    // Met à jour la liste des favoris dans la vue
    view.updateFavoritesList(
        favorites,
        (favorite) => {
            view.setSearchInputValue(favorite);
            performSearch();
        },
        (favorite) => {
            // Ajout d'une alerte de confirmation avant suppression
            if (
                confirm(
                    `Voulez-vous vraiment supprimer "${favorite}" des favoris ?`
                )
            ) {
                model.removeFavorite(favorite);
                updateFavoritesList();
                view.updateFavoriteButtonState(
                    view.getSearchInputValue(),
                    model.isFavorite(view.getSearchInputValue())
                );
            }
        }
    );
}

function addEventListeners() {
    view.onSearchInputChange(() => {
        const searchTerm = view.getSearchInputValue();
        view.updateFavoriteButtonState(
            searchTerm,
            model.isFavorite(searchTerm)
        );
    });

    view.onSearchButtonClick(() => performSearch());

    // Lancer une recherche quand on appuie sur "Entrée"
    view.onSearchInputKeyPress((e) => {
        if (e.key === "Enter" && !view.searchButton.disabled) {
            performSearch();
        }
    });

    view.onFavoriteButtonClick(() => toggleFavorite());
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
    init();
});
