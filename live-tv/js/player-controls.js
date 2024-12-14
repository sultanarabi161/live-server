class PlayerControls {
    constructor(videoElement) {
        this.video = videoElement;
        this.player = null;
        this.hls = null;
        this.initializePlayer();
    }

    initializePlayer() {
        // Plyr প্লেয়ার ইনিশিয়ালাইজ করা
        this.player = new Plyr(this.video, {
            controls: [
                'play-large', 'play', 'progress', 'current-time',
                'duration', 'mute', 'volume', 'captions',
                'settings', 'pip', 'airplay', 'fullscreen'
            ],
            settings: ['quality', 'speed', 'loop'],
            quality: {
                default: 720,
                options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
            }
        });

        // HLS সাপোর্ট চেক করা
        if (Hls.isSupported()) {
            this.hls = new Hls({
                maxBufferSize: 0,
                maxBufferLength: 30,
                liveSyncDuration: 3,
                liveMaxLatencyDuration: 10
            });
            this.setupHLS();
        }

        this.addCustomControls();
        this.setupEventListeners();
    }

    setupHLS() {
        this.hls.attachMedia(this.video);
        this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            console.log('HLS Media Attached');
        });

        this.hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        this.hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        this.hls.recoverMediaError();
                        break;
                    default:
                        this.initializePlayer();
                        break;
                }
            }
        });
    }

    loadChannel(url) {
        if (Hls.isSupported()) {
            this.hls.loadSource(url);
        } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
            this.video.src = url;
        }
    }

    addCustomControls() {
        const customControls = `
            <div class="custom-controls">
                <button class="quality-btn">
                    <i class="fas fa-cog"></i>
                    <span>Quality</span>
                </button>
                <button class="audio-track-btn">
                    <i class="fas fa-volume-up"></i>
                    <span>Audio</span>
                </button>
                <div class="playback-speed">
                    <select>
                        <option value="0.5">0.5x</option>
                        <option value="1.0" selected>1.0x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2.0">2.0x</option>
                    </select>
                </div>
            </div>
        `;

        const controlsContainer = document.querySelector('.plyr__controls');
        controlsContainer.insertAdjacentHTML('beforeend', customControls);
    }

    setupEventListeners() {
        // প্লেয়ার ইভেন্ট লিসেনার
        this.player.on('playing', () => {
            console.log('Video is playing');
        });

        this.player.on('pause', () => {
            console.log('Video is paused');
        });

        this.player.on('ended', () => {
            console.log('Video ended');
        });

        // কাস্টম কন্ট্রোল ইভেন্ট লিসেনার
        document.querySelector('.quality-btn').addEventListener('click', () => {
            this.toggleQualityMenu();
        });

        document.querySelector('.playback-speed select').addEventListener('change', (e) => {
            this.setPlaybackSpeed(e.target.value);
        });
    }

    setQuality(level) {
        if (this.hls) {
            this.hls.currentLevel = level;
        }
    }

    setPlaybackSpeed(speed) {
        this.video.playbackRate = parseFloat(speed);
    }

    toggleQualityMenu() {
        // কোয়ালিটি মেনু টগল করা
    }

    destroy() {
        if (this.hls) {
            this.hls.destroy();
        }
        this.player.destroy();
    }
}
