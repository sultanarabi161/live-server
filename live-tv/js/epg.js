class EPGManager {
    constructor() {
        this.epgData = {};
        this.currentProgram = null;
        this.updateInterval = null;
    }

    async loadEPG(channelId) {
        try {
            // EPG ডেটা লোড করা (এখানে আপনার EPG API URL ব্যবহার করুন)
            const response = await fetch(`https://your-epg-api.com/guide/${channelId}`);
            const data = await response.json();
            this.epgData[channelId] = this.parseEPGData(data);
            this.startUpdateTimer();
            return true;
        } catch (error) {
            console.error('EPG loading error:', error);
            return false;
        }
    }

    parseEPGData(data) {
        // EPG ডেটা পার্স করা
        return data.programs.map(program => ({
            id: program.id,
            title: program.title,
            description: program.description,
            startTime: new Date(program.start),
            endTime: new Date(program.end),
            duration: program.duration,
            category: program.category
        }));
    }

    getCurrentProgram(channelId) {
        const now = new Date();
        return this.epgData[channelId]?.find(program => 
            program.startTime <= now && program.endTime >= now
        );
    }

    getUpcomingPrograms(channelId, limit = 5) {
        const now = new Date();
        return this.epgData[channelId]?.filter(program => 
            program.startTime > now
        ).slice(0, limit);
    }

    updateProgramDisplay(channelId) {
        const currentProgram = this.getCurrentProgram(channelId);
        const upcomingPrograms = this.getUpcomingPrograms(channelId);

        // প্রোগ্রাম ইনফো আপডেট করা
        if (currentProgram) {
            document.getElementById('currentProgramTitle').textContent = currentProgram.title;
            this.updateProgressBar(currentProgram);
        }

        // আপকামিং প্রোগ্রাম আপডেট করা
        const upcomingContainer = document.getElementById('upcomingPrograms');
        upcomingContainer.innerHTML = upcomingPrograms.map(program => `
            <div class="upcoming-program">
                <span class="time">${this.formatTime(program.startTime)}</span>
                <span class="title">${program.title}</span>
            </div>
        `).join('');
    }

    updateProgressBar(program) {
        const now = new Date();
        const progress = (now - program.startTime) / (program.endTime - program.startTime) * 100;
        const progressBar = document.querySelector('.progress-fill');
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    }

    startUpdateTimer() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.updateInterval = setInterval(() => {
            this.updateProgramDisplay();
        }, 30000); // প্রতি 30 সেকেন্ডে আপডেট
    }

    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}
