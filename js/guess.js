import { SpotifyModel } from "./modelSearch.js";
import { guessView } from "./guessView.js";
import config from "./config.js";

const model = new SpotifyModel(config.clientId, config.clientSecret);
let targetMusic = null; // Musique à deviner
let attempts = 0; // Compteur d'essais

async function fetchRandomMusic() {
    try {
        const token = await model.getAccessToken();
        let track = null;

        // Réessaye jusqu'à trouver une musique valide
        while (!track) {
            const randomOffset = Math.floor(Math.random() * 1000); // Choisir un offset aléatoire
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=year:2000-2023&type=track&limit=1&offset=${randomOffset}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await response.json();

            if (data.tracks?.items?.length) {
                track = data.tracks.items[0];
            }
        }

        // Configure la musique à deviner
        targetMusic = {
            title: track.name,
            genre: track.album.genres?.[0] || "Inconnu",
            releaseYear: parseInt(track.album.release_date.split("-")[0], 10),
            artist: track.artists[0]?.name || "Inconnu",
            popularity: track.popularity,
            album: track.album.name || "Inconnu",
            duration: Math.round(track.duration_ms / 1000), // Convertir en secondes
        };

        console.log("Musique à deviner :", targetMusic); // Pour déboguer
    } catch (error) {
        console.error(
            "Erreur lors de la récupération de la musique aléatoire :",
            error
        );
    }
}

function init() {
    fetchRandomMusic().then(() => {
        // Assurez-vous que la musique à deviner est chargée avant d'ajouter les événements
        guessView.onGuessInput(async () => {
            const query = guessView.getGuessInputValue();
            if (!query) return;

            try {
                const token = await model.getAccessToken();
                const data = await model.searchSpotify(query, token);

                if (data.tracks?.items?.length) {
                    const suggestions = data.tracks.items.map((track) => ({
                        trackName: track.name || "Inconnu",
                        artist: track.artists[0]?.name || "Inconnu",
                    }));
                    guessView.updateAutocompleteSuggestions(suggestions);
                }
            } catch (error) {
                console.error("Erreur lors de l'autocomplétion :", error);
            }
        });

        guessView.onGuessButtonClick(async () => {
            const guess = guessView.getGuessInputValue();
            if (!guess || !targetMusic) {
                guessView.displayError(
                    "La musique à deviner n'est pas encore chargée. Veuillez réessayer."
                );
                return;
            }

            attempts++; // Incrémente le compteur d'essais

            try {
                const token = await model.getAccessToken();
                const data = await model.searchSpotify(guess, token);

                if (data.tracks?.items?.length) {
                    const track = data.tracks.items[0];
                    const feedback = evaluateGuess(track);

                    // Vérifie si toutes les réponses sont correctes
                    const allCorrect = feedback.every((item) => item.isCorrect);
                    if (allCorrect) {
                        guessView.appendFeedback(
                            feedback,
                            `${track.name || "Inconnu"} - ${
                                track.artists[0]?.name || "Inconnu"
                            }`
                        );
                        guessView.displaySuccessMessage(
                            `Félicitations ! Vous avez trouvé la bonne réponse en ${attempts} essai(s).`
                        );
                        attempts = 0; // Réinitialise le compteur pour une nouvelle partie
                    } else {
                        guessView.appendFeedback(
                            feedback,
                            `${track.name || "Inconnu"} - ${
                                track.artists[0]?.name || "Inconnu"
                            }`
                        );
                    }
                } else {
                    guessView.displayError("Aucune musique trouvée.");
                }
            } catch (error) {
                console.error("Erreur lors de la recherche:", error);
                guessView.displayError("Une erreur est survenue.");
            }
        });
    });
}

function evaluateGuess(track) {
    const feedback = [];

    // Vérifie l'année de sortie
    const trackYear = parseInt(track.album.release_date.split("-")[0], 10);
    feedback.push({
        criterion: "Année de sortie",
        expected: targetMusic.releaseYear,
        actual: trackYear,
        isCorrect: trackYear === targetMusic.releaseYear,
        hint:
            trackYear < targetMusic.releaseYear
                ? "Trop ancienne"
                : "Trop récente",
    });

    // Vérifie l'artiste
    const trackArtist = track.artists[0]?.name || "Inconnu";
    feedback.push({
        criterion: "Artiste",
        expected: targetMusic.artist,
        actual: trackArtist,
        isCorrect:
            trackArtist.toLowerCase() === targetMusic.artist.toLowerCase(),
    });

    // Vérifie la popularité
    const trackPopularity = track.popularity || "Inconnu";
    feedback.push({
        criterion: "Popularité",
        expected: targetMusic.popularity,
        actual: trackPopularity,
        isCorrect: trackPopularity === targetMusic.popularity,
        hint:
            trackPopularity < targetMusic.popularity
                ? "Trop faible"
                : "Trop élevée",
    });

    // Vérifie le nom de l'album
    const trackAlbum = track.album.name || "Inconnu";
    feedback.push({
        criterion: "Album",
        expected: targetMusic.album || "Inconnu",
        actual: trackAlbum,
        isCorrect:
            trackAlbum.toLowerCase() ===
            (targetMusic.album || "").toLowerCase(),
    });

    // Vérifie la durée de la piste
    const trackDuration = Math.round(track.duration_ms / 1000); // Convertit en secondes
    feedback.push({
        criterion: "Durée (en secondes)",
        expected: targetMusic.duration || "Inconnu",
        actual: trackDuration,
        isCorrect: trackDuration === targetMusic.duration,
        hint:
            trackDuration < targetMusic.duration
                ? "Trop courte"
                : "Trop longue",
    });

    return feedback;
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
    init();
});
