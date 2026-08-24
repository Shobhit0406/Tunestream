// =============================
// TUNESTREAM PLAYER — Modern Version
// =============================

// Songs array loaded from Django API
let songs = [];
const API_BASE_URL = "/api";

// Load songs from Django API
async function loadSongsFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/tracks/`);
        const data = await response.json();

        songs = data.map(track => ({
            file: track.audio_file,
            name: track.title,
            artist: track.artist_names,
            slug: track.slug,
            cover: track.cover_image
        }));

        console.log(`✅ Loaded ${songs.length} songs from Django API`);
        populateTrendingCards();
        renderQueueList();
    } catch (error) {
        console.error("❌ Failed to load songs from API:", error);
    }
}

// =============================
// DOM ELEMENTS
// =============================
const audio = document.getElementById('audio');
const songList = document.getElementById('songList');
const trendingContainer = document.getElementById('trending-container');

// Playbar elements
const playPauseBtn = document.getElementById('play-pause-playbar');
const playIcon = document.getElementById('play-icon-playbar');
const prevBtn = document.getElementById('prev-btn-playbar');
const nextBtn = document.getElementById('next-btn-playbar');

const playbarTitle = document.getElementById('playbar-title');
const playbarArtist = document.getElementById('playbar-artist');

const progressTrack = document.getElementById('progress-track-playbar');
const progressFill = document.getElementById('progress-fill-playbar');
const progressHandle = document.getElementById('progress-handle-playbar');
const currentTimeLabel = document.getElementById('current-time-playbar');
const durationLabel = document.getElementById('duration-playbar');

const volumeSlider = document.getElementById('volume-slider-playbar');
const volumeToggle = document.getElementById('volume-toggle-playbar');
const miniEq = document.getElementById('mini-eq');

// =============================
// STATE
// =============================
let currentSongIndex = 0;
let isMuted = false;
let previousVolume = 0.7;
let isDraggingProgress = false;
let isDraggingVolume = false;

// =============================
// FUNCTIONS
// =============================

function generatePlaceholder(songName) {
    const colors = [
        ['#FF6B6B', '#FF9F43'],
        ['#A78BFA', '#7C3AED'],
        ['#34D399', '#10B981'],
        ['#60A5FA', '#3B82F6'],
        ['#F59E0B', '#D97706'],
        ['#EC4899', '#DB2777'],
    ];
    
    const colorIndex = songName.charCodeAt(0) % colors.length;
    const [color1, color2] = colors[colorIndex];
    
    // SVG string – note the use of Unicode characters (♪, songName)
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="160" height="160" fill="url(#grad)"/>
            <text x="80" y="70" font-size="48" fill="rgba(255,255,255,0.5)" text-anchor="middle" font-family="Arial" font-weight="bold">♪</text>
            <text x="80" y="115" font-size="12" fill="rgba(255,255,255,0.6)" text-anchor="middle" font-family="Arial">
                <tspan x="80">${songName.substring(0, 20)}</tspan>
            </text>
        </svg>
    `;

    // ★ FIX: Encode Unicode safely for base64
    const encoded = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${encoded}`;
}

// Populate trending cards from API data
function populateTrendingCards() {
    if (!trendingContainer) return;
    
    trendingContainer.innerHTML = '';
    
    songs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'music-card';
        
        // Use actual cover if available, otherwise generate placeholder
        const coverSrc = (song.cover && song.cover.trim() !== '') 
            ? song.cover 
            : generatePlaceholder(song.name);
        
        card.innerHTML = `
            <div class="music-card-image">
                <img src="${coverSrc}" alt="${song.name}" onerror="this.src='${generatePlaceholder(song.name)}'">
            </div>
            <div class="music-card-info">
                <div class="music-card-title">${song.name}</div>
                <div class="music-card-artist">${song.artist}</div>
            </div>
        `;
        card.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(index);
            audio.play();
            updatePlayIcon();
            highlightCurrentSong();
        });
        trendingContainer.appendChild(card);
    });
    
    console.log(`✅ Populated ${songs.length} trending cards`);
}

// Render queue list
function renderQueueList() {
    if (!songList) return;
    
    songList.innerHTML = '';
    
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="queue-title">${song.name}</div>
            <div class="queue-artist">${song.artist}</div>
        `;
        li.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(index);
            audio.play();
            updatePlayIcon();
            highlightCurrentSong();
        });
        songList.appendChild(li);
    });
    
    console.log(`✅ Rendered queue with ${songs.length} songs`);
}

// Load a song
function loadSong(index) {
    if (index < 0 || index >= songs.length) {
        console.error(`Invalid song index: ${index}`);
        return;
    }

    currentSongIndex = index;
    const song = songs[index];

    audio.src = song.file;
    audio.load();

    // Update playbar info
    playbarTitle.textContent = song.name;
    playbarArtist.textContent = song.artist;

    // Reset progress
    updateProgressBar();
    currentTimeLabel.textContent = '0:00';

    // Update queue highlight
    highlightCurrentSong();

    // Load metadata for duration
    audio.addEventListener('loadedmetadata', () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        durationLabel.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }, { once: true });
}

// Update progress bar
function updateProgressBar() {
    if (!audio.duration) return;

    const percent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${percent}%`;
    progressHandle.style.left = `${percent}%`;

    const mins = Math.floor(audio.currentTime / 60);
    const secs = Math.floor(audio.currentTime % 60);
    currentTimeLabel.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Update play button icon
function updatePlayIcon() {
    if (audio.paused) {
        playIcon.className = 'fas fa-play';
        miniEq.classList.remove('playing');
        document.body.classList.remove('is-playing');
    } else {
        playIcon.className = 'fas fa-pause';
        miniEq.classList.add('playing');
        document.body.classList.add('is-playing');
    }
}

// Highlight current song in queue
function highlightCurrentSong() {
    document.querySelectorAll('#songList li').forEach((li, i) => {
        li.classList.toggle('now-playing', i === currentSongIndex);
    });

    document.querySelectorAll('.music-card').forEach((card, i) => {
        card.classList.toggle('now-playing', i === currentSongIndex);
    });
}

// Toggle play/pause
function togglePlayPause() {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

// Next song
function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    audio.play();
    updatePlayIcon();
    highlightCurrentSong();
}

// Previous song
function playPrevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    audio.play();
    updatePlayIcon();
    highlightCurrentSong();
}

// =============================
// EVENT LISTENERS
// =============================

// Playback controls
playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', playNextSong);
prevBtn.addEventListener('click', playPrevSong);

// Progress bar
progressTrack.addEventListener('click', (e) => {
    if (!audio.duration) return;

    const rect = progressTrack.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
    updateProgressBar();
});

progressHandle.addEventListener('mousedown', () => {
    isDraggingProgress = true;
});

document.addEventListener('mousemove', (e) => {
    if (isDraggingProgress && audio.duration) {
        const rect = progressTrack.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const clampedPercent = Math.max(0, Math.min(1, percent));
        audio.currentTime = clampedPercent * audio.duration;
        updateProgressBar();
    }
});

document.addEventListener('mouseup', () => {
    isDraggingProgress = false;
    isDraggingVolume = false;
});

// Volume control
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
    isMuted = false;
});

volumeToggle.addEventListener('click', () => {
    if (audio.volume > 0) {
        previousVolume = audio.volume;
        audio.volume = 0;
        volumeSlider.value = 0;
    } else {
        audio.volume = previousVolume;
        volumeSlider.value = previousVolume * 100;
    }
});

// Audio events
audio.addEventListener('timeupdate', updateProgressBar);
audio.addEventListener('play', updatePlayIcon);
audio.addEventListener('pause', updatePlayIcon);
audio.addEventListener('ended', playNextSong);

// =============================
// INITIALIZATION
// =============================
async function init() {
    console.log('🎵 TuneStream initializing...');

    // Load songs from API
    await loadSongsFromAPI();

    // Set initial volume
    audio.volume = previousVolume;
    volumeSlider.value = previousVolume * 100;

    // Load first song
    if (songs.length > 0) {
        loadSong(0);
        console.log(`✅ Player ready with ${songs.length} songs`);
    } else {
        console.error('❌ No songs loaded');
    }
}

document.addEventListener('DOMContentLoaded', init);