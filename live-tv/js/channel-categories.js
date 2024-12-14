class ChannelCategories {
    constructor() {
        this.categories = new Set();
        this.activeCategory = 'all';
    }

    addCategory(category) {
        if (category) {
            this.categories.add(category);
        }
    }

    getCategories() {
        return ['all', ...Array.from(this.categories)];
    }

    renderCategoryFilter(container) {
        const categories = this.getCategories();
        container.innerHTML = `
            <div class="category-buttons">
                ${categories.map(category => `
                    <button class="category-btn ${category === this.activeCategory ? 'active' : ''}"
                            data-category="${category}">
                        ${category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                `).join('')}
            </div>
        `;

        // কাটেগরি ফিল্টার ইভেন্ট লিসেনার
        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeCategory = btn.dataset.category;
                this.updateActiveButton(container);
                this.filterChannels();
            });
        });
    }

    updateActiveButton(container) {
        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.activeCategory);
        });
    }

    filterChannels() {
        const channels = document.querySelectorAll('.channel-card');
        channels.forEach(channel => {
            const category = channel.dataset.category;
            const shouldShow = this.activeCategory === 'all' || category === this.activeCategory;
            channel.style.display = shouldShow ? '' : 'none';
        });
    }
}
