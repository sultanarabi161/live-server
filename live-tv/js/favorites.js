class FavoritesManager {
    constructor() {
        this.favorites = this.loadFavorites();
    }

    loadFavorites() {
        return JSON.parse(localStorage.getItem('favorites')) || [];
    }

    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    addFavorite(channel) {
        if (!this.isFavorite(channel.id)) {
            this.favorites.push({
                id: channel.id,
                name: channel.name,
                logo: channel.logo,
                url: channel.url,
                category: channel.category,
                addedDate: new Date().toISOString()
            });
            this.saveFavorites();
            this.updateFavoriteButton(channel.id, true);
            this.showNotification('Added to favorites');
        }
    }

    removeFavorite(channelId) {
        this.favorites = this.favorites.filter(f => f.id !== channelId);
        this.saveFavorites();
        this.updateFavoriteButton(channelId, false);
        this.showNotification('Removed from favorites');
    }

    isFavorite(channelId) {
        return this.favorites.some(f => f.id === channelId);
    }

    getFavorites() {
        return this.favorites;
    }

    updateFavoriteButton(channelId, isFavorite) {
        const favBtn = document.getElementById('favoriteBtn');
        if (favBtn) {
            favBtn.classList.toggle('active', isFavorite);
            favBtn.innerHTML = `<i class="fas fa-heart${isFavorite ? '' : '-o'}"></i>`;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }, 100);
    }
}
