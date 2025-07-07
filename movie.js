export const showPlayerPage = (movie, videoElement) => {
    document.getElementById('player-movie-title').textContent = movie.name;
    document.getElementById('player-movie-info').textContent = movie.info;

    if (window.hls) {
        window.hls.destroy();
   