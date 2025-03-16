import config from './config.js';

class SpotifyView {
  constructor() {
    // Éléments du DOM
    this.searchInput = document.querySelector('#bloc-recherche input');
    this.searchButton = document.querySelector('#btn-lancer-recherche');
    this.favoriteButton = document.querySelector('#btn-favoris');
    this.loadingGif = document.querySelector('#bloc-gif-attente');
    this.resultsContainer = document.querySelector('#bloc-resultats');
    this.favoritesList = document.querySelector('#liste-favoris');

    // État initial
    this.favorites = this.loadFavorites();
    this.updateFavoritesList();
    this.setupEventListeners();

    // Utilisation des credentials depuis le fichier de configuration
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.accessToken = null;
  }

  setupEventListeners() {
    // Désactiver/activer le bouton de recherche selon le contenu de l'input
    this.searchInput.addEventListener('input', () => {
      const isEmpty = !this.searchInput.value.trim();
      this.searchButton.disabled = isEmpty;
      this.searchButton.classList.toggle('btn_clicable', !isEmpty);
      this.favoriteButton.disabled = isEmpty;
      this.updateFavoriteButtonState();
    });

    // Lancer la recherche au clic ou avec la touche Entrée
    this.searchButton.addEventListener('click', () => this.performSearch());
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !this.searchButton.disabled) {
        this.performSearch();
      }
    });

    // Gérer les favoris
    this.favoriteButton.addEventListener('click', () => this.toggleFavorite());
  }

  // Méthodes pour la gestion des favoris
  loadFavorites() {
    const stored = localStorage.getItem('spotify-favorites');
    return stored ? JSON.parse(stored) : [];
  }

  saveFavorites() {
    localStorage.setItem('spotify-favorites', JSON.stringify(this.favorites));
    this.updateFavoritesList();
  }

  updateFavoriteButtonState() {
    const searchTerm = this.searchInput.value.trim();
    const isFavorite = this.favorites.includes(searchTerm);
    
    this.favoriteButton.classList.toggle('btn_clicable', searchTerm !== '');
    this.favoriteButton.querySelector('img').src = 
      isFavorite ? 'images/etoile-pleine.svg' : 'images/etoile-vide.svg';
  }

  // Méthode pour obtenir le token d'accès Spotify
  async getAccessToken() {
    if (this.accessToken) return this.accessToken;

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken;
  }

  // Méthode pour effectuer la recherche
  async performSearch() {
    const searchTerm = this.searchInput.value.trim();
    if (!searchTerm) return;

    try {
      // Afficher le gif de chargement
      this.loadingGif.style.display = 'block';
      this.resultsContainer.innerHTML = '';

      // Obtenir le token et faire la recherche
      const token = await this.getAccessToken();
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track,artist,album&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      this.displayResults(data);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      this.resultsContainer.innerHTML = '<p class="info-vide">Une erreur est survenue lors de la recherche.</p>';
    } finally {
      this.loadingGif.style.display = 'none';
    }
  }

  // Méthode pour afficher les résultats
  displayResults(data) {
    if (!data.tracks?.items?.length && !data.artists?.items?.length && !data.albums?.items?.length) {
      this.resultsContainer.innerHTML = '<p class="info-vide">(Aucun résultat trouvé)</p>';
      return;
    }

    let html = '';

    // Afficher les pistes
    if (data.tracks?.items?.length) {
      html += '<h3>Chansons</h3>';
      data.tracks.items.forEach(track => {
        const albumImage = track.album.images[1]?.url || 'images/no-image.png';
        html += `
          <div class="res">
            <img src="${albumImage}" alt="Pochette de ${track.name}" width="100" height="100"/>
            <div class="track-info">
              <p>🎵 ${track.name}</p>
              <p>👤 ${track.artists[0].name}</p>
              <p>💿 ${track.album.name}</p>
              <a href="${track.external_urls.spotify}" target="_blank" class="spotify-link">▶️ Écouter sur Spotify</a>
            </div>
          </div>
        `;
      });
    }

    // Afficher les artistes
    if (data.artists?.items?.length) {
      html += '<h3>Artistes</h3>';
      data.artists.items.forEach(artist => {
        const artistImage = artist.images[1]?.url || 'images/no-image.png';
        html += `
          <div class="res">
            <img src="${artistImage}" alt="Photo de ${artist.name}" width="100" height="100"/>
            <div class="artist-info">
              <p>👤 ${artist.name}</p>
              <p>Followers: ${artist.followers.total.toLocaleString()}</p>
              <a href="${artist.external_urls.spotify}" target="_blank" class="spotify-link">👉 Voir sur Spotify</a>
            </div>
          </div>
        `;
      });
    }

    // Afficher les albums
    if (data.albums?.items?.length) {
      html += '<h3>Albums</h3>';
      data.albums.items.forEach(album => {
        const albumImage = album.images[1]?.url || 'images/no-image.png';
        html += `
          <div class="res">
            <img src="${albumImage}" alt="Pochette de ${album.name}" width="100" height="100"/>
            <div class="album-info">
              <p>💿 ${album.name}</p>
              <p>👤 ${album.artists[0].name}</p>
              <p>📅 ${album.release_date.split('-')[0]}</p>
              <a href="${album.external_urls.spotify}" target="_blank" class="spotify-link">👉 Voir sur Spotify</a>
            </div>
          </div>
        `;
      });
    }

    this.resultsContainer.innerHTML = html;
  }

  // Méthode pour basculer l'état favori
  toggleFavorite() {
    const searchTerm = this.searchInput.value.trim();
    if (!searchTerm) return;

    const index = this.favorites.indexOf(searchTerm);
    if (index === -1) {
      // Ajouter aux favoris
      this.favorites.push(searchTerm);
    } else {
      // Demander confirmation avant de supprimer
      if (confirm(`Voulez-vous vraiment supprimer "${searchTerm}" des favoris ?`)) {
        this.favorites.splice(index, 1);
      } else {
        return;
      }
    }

    this.saveFavorites();
    this.updateFavoriteButtonState();
  }

  // Méthode pour mettre à jour la liste des favoris
  updateFavoritesList() {
    const noFavoritesMessage = document.querySelector('#section-favoris .info-vide');
    
    if (this.favorites.length === 0) {
      this.favoritesList.innerHTML = '';
      noFavoritesMessage.style.display = 'block';
      return;
    }

    noFavoritesMessage.style.display = 'none';
    this.favoritesList.innerHTML = this.favorites
      .map(term => `
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
      `)
      .join('');

    // Ajouter les écouteurs d'événements pour les favoris
    this.favoritesList.querySelectorAll('li span').forEach((span, index) => {
      span.addEventListener('click', () => {
        this.searchInput.value = this.favorites[index];
        this.updateFavoriteButtonState();
        this.performSearch();
      });
    });

    this.favoritesList.querySelectorAll('.delete-favorite').forEach((img, index) => {
      img.addEventListener('click', () => {
        if (confirm(`Voulez-vous vraiment supprimer "${this.favorites[index]}" des favoris ?`)) {
          this.favorites.splice(index, 1);
          this.saveFavorites();
          this.updateFavoriteButtonState();
        }
      });
    });
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  const app = new SpotifyView();
}); 