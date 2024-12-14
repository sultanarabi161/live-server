document.addEventListener('DOMContentLoaded', () => {
    // মেইন ক্লাস ইনস্ট্যান্স তৈরি
    const epgManager = new EPGManager();
    const favoritesManager = new FavoritesManager();
    const playerControls = new PlayerControls(document.getElementById('player'));
    const categoryManager = new ChannelCategories();

    // গ্লোবাল স্টেট
    let currentChannel = null;

    // চ্যানেল লোড করা
    async function loadChannels() {
        try {
            const playlist = JSON.parse(localStorage.getItem('currentPlaylist'));
            if (!playlist) return;

            const response = await fetch(playlist.url);
            const m3u = await response.text();
            const channels = parseM3U(m3u);
            
            channels.forEach(channel => {
                categoryManager.addCategory(channel.category);
            });

            renderChannels(channels);
            categoryManager.renderCategoryFilter(
                document.getElementById('categoryFilters')
            );
        } catch (error) {
            showError('Error loading channels');
        }
    }

    // চ্যানেল রেন্ডার করা
    function renderChannels(channels) {
        const grid = document.getElementById('channelsGrid');
        grid.innerHTML = '';

        channels.forEach(channel => {
            const card = document.createElement('div');
            card.className = 'channel-card';
            card.dataset.category = channel.category;
            
            const isFavorite = favoritesManager.isFavorite(channel.id);
            
            card.innerHTML = `
                <img src="${channel.logo || 'assets/images/default-channel.png'}" 
                     class="channel-logo" 
                     alt="${channel.name}"
                     onerror="this.src='assets/images/default-channel.png'">
                <div class="channel-info">
                    <h3>${channel.name}</h3>
                    <p class="channel-category">${channel.category || 'General'}</p>
                    <button class="fav-btn ${isFavorite ? 'active' : ''}"
                            onclick="event.stopPropagation();">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            `;

            card.onclick = () => playChannel(channel);
            card.querySelector('.fav-btn').onclick = (e) => {
                e.stopPropagation();
                toggleFavorite(channel);
            };

            grid.appendChild(card);
        });
    }

    // চ্যানেল প্লে করা
    function playChannel(channel) {
        currentChannel = channel;
        document.getElementById('channelTitle').textContent = channel.name;
        playerControls.loadChannel(channel.url);
        epgManager.loadEPG(channel.id);
        
        // আপডেট UI
        updateActiveChannel();
    }

    // ফেভারিট টগল করা
    function toggleFavorite(channel) {
        if (favoritesManager.isFavorite(channel.id)) {
            favoritesManager.removeFavorite(channel.id);
        } else {
            favoritesManager.addFavorite(channel);
        }
    }

    // অ্যাক্টিভ চ্যানেল আপডেট করা
    function updateActiveChannel() {
        document.querySelectorAll('.channel-card').forEach(card => {
            card.classList.toggle('active', 
                card.dataset.channelId === currentChannel?.id
            );
        });
    }

    // সার্চ ফাংশনালিটি
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.channel-card').forEach(card => {
            const channelName = card.querySelector('h3').textContent.toLowerCase();
            const shouldShow = channelName.includes(searchTerm);
            card.style.display = shouldShow ? '' : 'none';
        });
    });

    // এরর মেসেজ দেখানো
    function showError(message) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        document.body.appendChild(error);
        
        setTimeout(() => error.remove(), 3000);
    }

    // Initialize
    loadChannels();
});
