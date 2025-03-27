export class SpotifyModel {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.accessToken = null;
        this.favorites = this.loadFavorites();
    }

    loadFavorites() {
        const stored = localStorage.getItem("spotify-favorites");
        return stored ? JSON.parse(stored) : [];
    }

    saveFavorites() {
        localStorage.setItem(
            "spotify-favorites",
            JSON.stringify(this.favorites)
        );
    }

    async getAccessToken() {
        if (this.accessToken) return this.accessToken;

        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " + btoa(this.clientId + ":" + this.clientSecret),
            },
            body: "grant_type=client_credentials",
        });

        const data = await response.json();
        this.accessToken = data.access_token;
        return this.accessToken;
    }

    async searchSpotify(query, token) {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                query
            )}&type=track,artist,album&limit=10`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.json();
    }

    isFavorite(term) {
        return this.favorites.includes(term);
    }

    addFavorite(term) {
        if (!this.isFavorite(term)) {
            this.favorites.push(term);
            this.saveFavorites();
        }
    }

    removeFavorite(term) {
        const index = this.favorites.indexOf(term);
        if (index !== -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
        }
    }

    getFavorites() {
        return [...this.favorites];
    }
}
