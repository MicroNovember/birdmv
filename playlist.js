// Playlist Management System
const PLAYLISTS_STORAGE_KEY = 'm3u_playlists';
const CURRENT_PLAYLIST_KEY = 'current_playlist';

// Default playlists
const defaultPlaylists = [
    {
        id: 'default',
        name: 'Default Playlist',
        url: 'https://drive.google.com/uc?id=1laO8m4TokHGnMs56zI1PPF6rK3z-CIuJ',
        lastUpdated: null
    }
];

class PlaylistManager {
    constructor() {
        this.playlists = this.loadPlaylists();
        this.currentPlaylistId = this.loadCurrentPlaylist();
    }

    // Load playlists from localStorage
    loadPlaylists() {
        const stored = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return defaultPlaylists;
    }

    // Save playlists to localStorage
    savePlaylists() {
        localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(this.playlists));
    }

    // Load current playlist ID
    loadCurrentPlaylist() {
        const stored = localStorage.getItem(CURRENT_PLAYLIST_KEY);
        return stored || this.playlists[0]?.id || null;
    }

    // Save current playlist ID
    saveCurrentPlaylist(id) {
        localStorage.setItem(CURRENT_PLAYLIST_KEY, id);
        this.currentPlaylistId = id;
    }

    // Get all playlists
    getAllPlaylists() {
        return this.playlists;
    }

    // Get current playlist
    getCurrentPlaylist() {
        return this.playlists.find(p => p.id === this.currentPlaylistId) || this.playlists[0];
    }

    // Add new playlist
    addPlaylist(name, url) {
        const id = 'playlist_' + Date.now();
        const newPlaylist = {
            id: id,
            name: name || 'Untitled Playlist',
            url: url,
            lastUpdated: null
        };
        this.playlists.push(newPlaylist);
        this.savePlaylists();
        return newPlaylist;
    }

    // Remove playlist
    removePlaylist(id) {
        if (this.playlists.length <= 1) {
            throw new Error('ต้องมีอย่างน้อย 1 playlist');
        }
        
        const index = this.playlists.findIndex(p => p.id === id);
        if (index !== -1) {
            this.playlists.splice(index, 1);
            
            // If removing current playlist, switch to first available
            if (this.currentPlaylistId === id) {
                this.currentPlaylistId = this.playlists[0].id;
                this.saveCurrentPlaylist(this.currentPlaylistId);
            }
            
            this.savePlaylists();
            return true;
        }
        return false;
    }

    // Update playlist
    updatePlaylist(id, name, url) {
        const playlist = this.playlists.find(p => p.id === id);
        if (playlist) {
            if (name) playlist.name = name;
            if (url) playlist.url = url;
            this.savePlaylists();
            return playlist;
        }
        return null;
    }

    // Select playlist
    selectPlaylist(id) {
        const playlist = this.playlists.find(p => p.id === id);
        if (playlist) {
            this.saveCurrentPlaylist(id);
            return playlist;
        }
        return null;
    }

    // Update last updated timestamp
    updatePlaylistTimestamp(id) {
        const playlist = this.playlists.find(p => p.id === id);
        if (playlist) {
            playlist.lastUpdated = Date.now();
            this.savePlaylists();
        }
    }
}

// Initialize playlist manager
const playlistManager = new PlaylistManager();
