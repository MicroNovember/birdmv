document.addEventListener('DOMContentLoaded', () => {
    const movieGrid = document.getElementById('movie-grid');
    const categoryShowcase = document.getElementById('category-showcase');
    const fullMovieDisplay = document.getElementById('full-movie-display');

    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidebarMenu = document.querySelector('.sidebar-menu');
    const displayCountSelect = document.getElementById('displayCount');

    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageNumbersContainer = document.getElementById('page-numbers');
    const paginationControls = document.getElementById('pagination');

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // Element ใหม่
    const favoritesLink = document.getElementById('favorites-link');
    const clearFavoritesBtn = document.getElementById('clear-favorites-btn');

    let allMoviesLoaded = {};
    let currentCategoryData = [];
    let currentPage = 1;

    // Handle 'all' as string or number
    let moviesPerPage = displayCountSelect.value === 'all' ? 'all' : parseInt(displayCountSelect.value);

    let currentSearchResults = [];
    let isDisplayingFavorites = false; // Flag สำหรับรายการโปรด

    const movieSources = [
        { url: "data/server1-en.json", id: "server1-en", title: "หนังฝรั่ง (S1)" },
        { url: "data/server1-china.json", id: "server1-china", title: "หนังจีน (S1)" },
        { url: "data/server1-korea.json", id: "server1-korea", title: "หนังเกาหลี (S1)" },
        { url: "data/server1-asia.json", id: "server1-asia", title: "หนังอินเดีย (S1)" },
        { url: "data/server1-thai.json", id: "server1-thai", title: "หนังไทย (S1)" },
        { url: "data/server1-cartoon.json", id: "server1-cartoon", title: "การ์ตูน (S1)" }
    ];

    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="${movie.image}" alt="${movie.name} Cover" onerror="this.onerror=null;this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AX2lAAACV0lEQVR4Xu3cMQ0AAAgEIfvXn2JzZlA904KqA1jDtgkCAQIECLx7AgnYAQIECBAYEGBgEwIECLx7AgnYAQIECBAYEGBgEwIECLx7AgnYAQIECBAYEGBgEwIECLx7AgnYAQIECBAYEGBgEwIECLx7AgnYAQIECBAYEGBgEwIECLx7AgnYAQIECBAYEGBgEwIECLx7AgnYAQIECBAYEGBgEwIECLx7AgnYAQIECBAYEGBgEwIECLx7AgnYAQIECBAYEGBgEwIECLx7AgnYAQIECBAYEGBgEwIECLx7AgnYAQIECBAYEGBgEwIECLx7AgnYAQIECBAYEGBgEwIECLx7AgnYAQIECBAYEGBgEwIECLx7AgnYAXv/C9uX/X+r82uIAAAAAElFTkSuQmCC';">
            <h3>${movie.name}</h3>
            <p>${movie.info}</p>
        `;
        movieCard.addEventListener('click', () => {
            const playerUrl = new URL('player.html', window.location.href);
            playerUrl.searchParams.append('name', movie.name);
            playerUrl.searchParams.append('info', movie.info); 
            playerUrl.searchParams.append('image', movie.image);
            playerUrl.searchParams.append('url', encodeURIComponent(movie.url)); 
            window.location.href = playerUrl.href; 
        });
        return movieCard;
    }

    function displayMoviesGrid(moviesToDisplay) {
        movieGrid.innerHTML = '';

        const totalMoviesInCurrentDisplay = moviesToDisplay.length;

        // ควบคุมการแสดงปุ่มล้างรายการโปรด
        if (isDisplayingFavorites) {
            clearFavoritesBtn.style.display = 'flex'; // แสดงปุ่มเมื่ออยู่หน้ารายการโปรด
            if (totalMoviesInCurrentDisplay === 0) {
                movieGrid.innerHTML = '<p style="text-align: center; color: #A9B8CC; padding: 20px;">ยังไม่มีหนังในรายการโปรดของคุณ</p>';
                paginationControls.style.display = 'none';
                return;
            }
        } else {
            clearFavoritesBtn.style.display = 'none'; // ซ่อนเมื่อไม่ใช่รายการโปรด
        }

        // ควบคุมการแสดง pagination
        if (moviesPerPage === 'all' || totalMoviesInCurrentDisplay <= moviesPerPage) {
            paginationControls.style.display = 'none';
        } else {
            paginationControls.style.display = 'flex';
        }

        // คำนวณ subset ของหนังที่จะโชว์
        const startIdx = (currentPage - 1) * (moviesPerPage === 'all' ? totalMoviesInCurrentDisplay : moviesPerPage);
        const endIdx = (moviesPerPage === 'all') ? totalMoviesInCurrentDisplay : startIdx + moviesPerPage;
        const moviesToShow = moviesToDisplay.slice(startIdx, endIdx);

        // ถ้าหน้าเปล่าแต่มีหนังในหมวดหมู่ ให้รีเซ็ตหน้า
        if (moviesToShow.length === 0 && totalMoviesInCurrentDisplay > 0) {
            currentPage = 1;
            displayMoviesGrid(moviesToDisplay);
            return;
        } else if (moviesToShow.length === 0 && totalMoviesInCurrentDisplay === 0 && !isDisplayingFavorites) {
            // ไม่มีหนังในหมวดหมู่หรือผลการค้นหา
            movieGrid.innerHTML = '<p style="text-align: center; color: #A9B8CC; padding: 20px;">ไม่พบหนังในหมวดหมู่นี้</p>';
            updatePaginationControls(0);
            return;
        }

        // แสดงหนัง
        moviesToShow.forEach(movie => {
            movieGrid.appendChild(createMovieCard(movie));
        });

        updatePaginationControls(totalMoviesInCurrentDisplay);
    }

    function updatePaginationControls(totalMovies) {
        const totalPages = (moviesPerPage === 'all') ? 1 : Math.ceil(totalMovies / moviesPerPage);
        pageNumbersContainer.innerHTML = '';

        if (totalPages <= 1) {
            paginationControls.style.display = 'none';
            return;
        }

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.classList.add('page-number-link');
            if (i === currentPage) {
                pageLink.classList.add('active');
            }
            pageLink.textContent = i;
            pageLink.dataset.page = i;
            pageLink.addEventListener('click', (event) => {
                event.preventDefault();
                currentPage = parseInt(event.target.dataset.page);
                if (isDisplayingFavorites) {
                    displayMoviesGrid(getFavorites());
                } else if (currentSearchResults.length > 0) {
                    displayMoviesGrid(currentSearchResults);
                } else {
                    displayMoviesGrid(currentCategoryData);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            pageNumbersContainer.appendChild(pageLink);
        }

        prevPageBtn.disabled = (currentPage === 1);
        nextPageBtn.disabled = (currentPage === totalPages);
        paginationControls.style.display = 'flex';
    }

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            if (isDisplayingFavorites) {
                displayMoviesGrid(getFavorites());
            } else if (currentSearchResults.length > 0) {
                displayMoviesGrid(currentSearchResults);
            } else {
                displayMoviesGrid(currentCategoryData);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextPageBtn.addEventListener('click', () => {
        let totalMoviesCount;
        if (isDisplayingFavorites) {
            totalMoviesCount = getFavorites().length;
        } else if (currentSearchResults.length > 0) {
            totalMoviesCount = currentSearchResults.length;
        } else {
            totalMoviesCount = currentCategoryData.length;
        }
        const totalPages = (moviesPerPage === 'all') ? 1 : Math.ceil(totalMoviesCount / moviesPerPage);

        if (currentPage < totalPages) {
            currentPage++;
            if (isDisplayingFavorites) {
                displayMoviesGrid(getFavorites());
            } else if (currentSearchResults.length > 0) {
                displayMoviesGrid(currentSearchResults);
            } else {
                displayMoviesGrid(currentCategoryData);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    function showCategoryShowcase() {
        categoryShowcase.style.display = 'block';
        fullMovieDisplay.style.display = 'none';
        sidebarMenu.classList.remove('active');
        searchInput.value = '';
        currentSearchResults = [];
        isDisplayingFavorites = false;
        clearFavoritesBtn.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showFullMovieDisplay(type, data, keyword = '') {
        categoryShowcase.style.display = 'none';
        fullMovieDisplay.style.display = 'block';
        sidebarMenu.classList.remove('active');

        // Reset flags
        isDisplayingFavorites = false;
        currentSearchResults = [];
        currentCategoryData = [];
        searchInput.value = '';

        if (type === 'category') {
            currentCategoryData = data;
        } else if (type === 'search') {
            currentSearchResults = data;
            searchInput.value = keyword;
        } else if (type === 'favorites') {
            isDisplayingFavorites = true;
            document.querySelector('#full-movie-display .controls label').textContent = 'รายการโปรด:';
            document.getElementById('displayCount').style.display = 'none';
            clearFavoritesBtn.style.display = 'flex';
        } else {
            currentCategoryData = data;
        }

        currentPage = 1;
        displayMoviesGrid(type === 'search' ? currentSearchResults : (type === 'favorites' ? data : currentCategoryData));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function performSearch() {
        const keyword = searchInput.value.toLowerCase().trim();
        if (keyword === '') {
            alert('กรุณาป้อนคำค้นหา');
            return;
        }
        const allMovies = Object.values(allMoviesLoaded).flat();

        const results = allMovies.filter(movie =>
            movie.name && movie.name.toLowerCase().includes(keyword)
        );

        if (results.length > 0) {
            showFullMovieDisplay('search', results, keyword);
        } else {
            showFullMovieDisplay('search', [], keyword);
            movieGrid.innerHTML = `<p style="text-align: center; color: #A9B8CC; padding: 20px;">ไม่พบผลลัพธ์สำหรับ "${keyword}"</p>`;
            updatePaginationControls(0);
        }
    }

    // --- Favorite Functions ---
    function getFavorites() {
        try {
            return JSON.parse(localStorage.getItem('favorites') || '[]');
        } catch (e) {
            console.error('Error parsing favorites from localStorage:', e);
            return [];
        }
    }

    function showFavorites() {
        const favorites = getFavorites();
        showFullMovieDisplay('favorites', favorites);
        sidebarMenu.classList.remove('active');
        document.querySelector('#full-movie-display .controls label').textContent = 'รายการโปรด:';
        document.getElementById('displayCount').style.display = 'none';
    }

    function clearAllFavorites() {
        if (confirm('คุณแน่ใจหรือไม่ที่ต้องการล้างรายการโปรดทั้งหมด?')) {
            localStorage.removeItem('favorites');
            showFavorites();
            alert('รายการโปรดทั้งหมดถูกล้างแล้ว!');
        }
    }
    // --- END Favorite Functions ---

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    // Favorites link event
    favoritesLink.addEventListener('click', (event) => {
        event.preventDefault();
        showFavorites();
    });

    // ล้างรายการโปรด
    clearFavoritesBtn.addEventListener('click', clearAllFavorites);

    async function initializeApp() {
        const homeLink = document.createElement('a');
        homeLink.href = "#";
        homeLink.textContent = "🏠 หน้าแรก";
        homeLink.addEventListener('click', (event) => {
            event.preventDefault();
            showCategoryShowcase();
            sidebarMenu.classList.remove('active');
        });
        // เพิ่มหน้าแรกก่อน favorites
        sidebarMenu.insertBefore(homeLink, favoritesLink);

        for (const source of movieSources) {
            try {
                const response = await fetch(source.url);
                if (!response.ok) {
                    console.warn(`Could not load ${source.url}: ${response.statusText}`);
                    continue;
                }
                const data = await response.json();
                allMoviesLoaded[source.id] = data;

                const link = document.createElement('a');
                link.href = "#";
                link.dataset.category = source.id;
                link.textContent = source.title;
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    showFullMovieDisplay('category', allMoviesLoaded[event.currentTarget.dataset.category]);
                });
                sidebarMenu.appendChild(link);

                if (data.length > 0) {
                    const categorySection = document.createElement('div');
                    categorySection.classList.add('category-section');

                    const categoryHeader = document.createElement('div');
                    categoryHeader.classList.add('category-header');
                    categoryHeader.innerHTML = `
                        <h2>${source.title.replace(' (S1)', '').replace(' (S2)', '')}</h2>
                        <a href="#" data-category-id="${source.id}">ดูทั้งหมด <i class="fas fa-arrow-right"></i></a>
                    `;
                    categoryHeader.querySelector('a').addEventListener('click', (event) => {
                        event.preventDefault();
                        showFullMovieDisplay('category', allMoviesLoaded[event.currentTarget.dataset.categoryId]);
                    });
                    categorySection.appendChild(categoryHeader);

                    const movieScroller = document.createElement('div');
                    movieScroller.classList.add('movie-scroller');
                    const movieScrollerContent = document.createElement('div');
                    movieScrollerContent.classList.add('movie-scroller-content');

                    const moviesToShowInScroller = data.slice(0, 12);
                    moviesToShowInScroller.forEach(movie => {
                        movieScrollerContent.appendChild(createMovieCard(movie));
                    });

                    movieScroller.appendChild(movieScrollerContent);
                    categorySection.appendChild(movieScroller);
                    categoryShowcase.appendChild(categorySection);
                }

            } catch (error) {
                console.error(`Error fetching ${source.url}:`, error);
            }
        }

        // ตรวจสอบ URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const initialCategory = urlParams.get('category');
        const initialSearch = urlParams.get('search');
        const initialFavorites = urlParams.get('favorites');

        if (initialSearch) {
            searchInput.value = initialSearch;
            performSearch();
        } else if (initialFavorites === 'true') {
            showFavorites();
        } else if (initialCategory && allMoviesLoaded[initialCategory]) {
            showFullMovieDisplay('category', allMoviesLoaded[initialCategory]);
        } else if (initialCategory === "All") {
            // รวมหนังทั้งหมด
            const allMoviesArray = Object.values(allMoviesLoaded).flat();
            showFullMovieDisplay('category', allMoviesArray);
        } else {
            showCategoryShowcase();
        }
    }

    hamburgerMenu.addEventListener('click', () => {
        sidebarMenu.classList.toggle('active');
    });

    document.addEventListener('click', (event) => {
        if (!sidebarMenu.contains(event.target) && !hamburgerMenu.contains(event.target)) {
            sidebarMenu.classList.remove('active');
        }
    });

    displayCountSelect.addEventListener('change', (event) => {
        const val = event.target.value;
        moviesPerPage = val === 'all' ? 'all' : parseInt(val);
        currentPage = 1;
        if (isDisplayingFavorites) {
            displayMoviesGrid(getFavorites());
        } else if (currentSearchResults.length > 0) {
            displayMoviesGrid(currentSearchResults);
        } else {
            displayMoviesGrid(currentCategoryData);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    initializeApp();
});

