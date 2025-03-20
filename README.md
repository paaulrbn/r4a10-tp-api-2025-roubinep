# Recherche de Musiques Spotify

Une application web permettant de rechercher des musiques, artistes et albums via l'API publique de Spotify. Les utilisateurs peuvent également enregistrer leurs recherches favorites pour un accès rapide.

## Fonctionnalités

-   **Recherche** : Saisissez un artiste, une chanson ou un album pour afficher les résultats correspondants.
-   **Favoris** : Ajoutez ou supprimez des recherches dans vos favoris.
-   **Responsive** : Compatible avec les écrans de différentes tailles.

## Installation

1. Clonez le dépôt :

    ```bash
    git clone https://github.com/paaulrbn/r4a10-tp-api-2025-roubinep.git
    cd r4a10-tp-api-2025-roubinep
    ```

2. Ouvrez le fichier `index.html` dans votre navigateur.

## Configuration

Le fichier `js/config.js` contient les identifiants pour accéder à l'API Spotify. Assurez-vous que les valeurs suivantes sont correctement définies :

```javascript
const config = {
    clientId: "VOTRE_CLIENT_ID",
    clientSecret: "VOTRE_CLIENT_SECRET",
};
export default config;
```

Pour obtenir un `clientId` et un `clientSecret`, inscrivez-vous sur le [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).

## Dépendances

Aucune dépendance externe n'est requise. Le projet utilise uniquement HTML, CSS et JavaScript.

## Structure du projet

```
r4a10-tp-api-2025-roubinep/
├── images/               # Images utilisées dans l'application
│   ├── attente-ajax.gif  # GIF de chargement
│   ├── etoile-pleine.svg # Icône étoile pleine (favori actif)
│   ├── etoile-vide.svg   # Icône étoile vide (favori inactif)
│   ├── loupe.svg         # Icône de recherche
│   └── no-image.png      # Image par défaut pour les résultats sans visuel
├── js/                   # Scripts JavaScript
│   ├── config.js         # Configuration de l'API Spotify
│   ├── main.js           # Script principal
│   ├── modelSearch.js    # Modèle pour gérer les appels à l'API Spotify
│   └── view.js           # Gestion de l'interface utilisateur
├── styles.css            # Feuille de styles principale
├── index.html            # Page principale de l'application
└── README.md             # Documentation du projet
```

## Utilisation

1. Saisissez un artiste, une chanson ou un album dans la barre de recherche.
2. Cliquez sur le bouton de recherche pour afficher les résultats.
3. Ajoutez une recherche aux favoris en cliquant sur l'icône étoile.
4. Consultez vos favoris dans la section dédiée et relancez une recherche en cliquant dessus.

## Auteurs

-   **Paul Roubinet** - Étudiant en BUT Informatique, IUT de Grenoble.
