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

    // เพิ่ม Element ใหม่
    const favoritesLink = document.getElementById('favorites-link');
    const clearFavoritesBtn = document.getElementById('clear-favorites-btn');

    let allMoviesLoaded = {};
    let currentCategoryData = [];
    let currentPage = 1;
    let moviesPerPage = parseInt(displayCountSelect.value);

    let currentSearchResults = [];
    let isDisplayingFavorites = false; // Flag เพื่อตรวจสอบว่ากำลังแสดงรายการโปรด

    const movieSources = [
        { url: "data/server1-thai.json", id: "server1-thai", title: "หนังไทย (S1)" },
        { url: "data/server1-en.json", id: "server1-en", title: "หนังฝรั่ง (S1)" },
        { url: "data/server1-china.json", id: "server1-china", title: "หนังจีน (S1)" },
        { url: "data/server1-korea.json", id: "server1-korea", title: "หนังเกาหลี (S1)" },
        { url: "data/server1-asia.json", id: "server1-asia", title: "หนังเอเชีย (S1)" },
        { url: "data/server1-cartoon.json", id: "server1-cartoon", title: "การ์ตูน (S1)" },
        { url: "data/server2-thai.json", id: "server2-thai", title: "หนังไทย (S2)" },
        { url: "data/server2-inter.json", id: "server2-inter", title: "หนังฝรั่ง (S2)" },
        { url: "data/server2-asia.json", id: "server2-asia", title: "หนังเอเชีย (S2)" },
        { url: "data/server2-cartoon.json", id: "server2-cartoon", title: "การ์ตูน (S2)" }
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
            if (totalMoviesInCurrentDisplay === 0) { // ถ้าไม่มีหนังในรายการโปรดเลย
                movieGrid.innerHTML = '<p style="text-align: center; color: #A9B8CC; padding: 20px;">ยังไม่มีหนังในรายการโปรดของคุณ</p>';
                paginationControls.style.display = 'none'; // ซ่อน pagination
                return;
            }
        } else {
            clearFavoritesBtn.style.display = 'none'; // ซ่อนปุ่มเมื่ออยู่หน้าอื่น
        }


        if (moviesPerPage === 'all' || totalMoviesInCurrentDisplay <= moviesPerPage) {
            paginationControls.style.display = 'none';
        } else {
            paginationControls.style.display = 'flex'; 
        }

        const moviesToShow = (moviesPerPage === 'all')
            ? moviesToDisplay
            : moviesToDisplay.slice(
                (currentPage - 1) * moviesPerPage,
                currentPage * moviesPerPage
            );

        if (moviesToShow.length === 0 && totalMoviesInCurrentDisplay > 0) {
            currentPage = 1;
            displayMoviesGrid(moviesToDisplay); 
            return;
        } else if (moviesToShow.length === 0 && totalMoviesInCurrentDisplay === 0 && !isDisplayingFavorites) {
            // กรณีไม่มีหนังในหมวดหมู่ หรือผลการค้นหา
            movieGrid.innerHTML = '<p style="text-align: center; color: #A9B8CC; padding: 20px;">ไม่พบหนังในหมวดหมู่นี้</p>';
            updatePaginationControls(0);
            return;
        }

        moviesToShow.forEach(movie => {
            movieGrid.appendChild(createMovieCard(movie));
        });

        updatePaginationControls(totalMoviesInCurrentDisplay);
    }

    function updatePaginationControls(totalMovies) {
        const totalPages = Math.ceil(totalMovies / moviesPerPage);
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
                if (isDisplayingFavorites) { // เพิ่มเงื่อนไขสำหรับรายการโปรด
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
            if (isDisplayingFavorites) { // เพิ่มเงื่อนไขสำหรับรายการโปรด
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
        let totalPages;
        let dataToCount;
        if (isDisplayingFavorites) { // เพิ่มเงื่อนไขสำหรับรายการโปรด
            dataToCount = getFavorites();
        } else if (currentSearchResults.length > 0) {
            dataToCount = currentSearchResults;
        } else {
            dataToCount = currentCategoryData;
        }
        totalPages = Math.ceil(dataToCount.length / moviesPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            if (isDisplayingFavorites) { // เพิ่มเงื่อนไขสำหรับรายการโปรด
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
        isDisplayingFavorites = false; // Reset flag
        clearFavoritesBtn.style.display = 'none'; // ซ่อนปุ่มล้างรายการโปรด
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showFullMovieDisplay(type, data, keyword = '') {
        categoryShowcase.style.display = 'none';
        fullMovieDisplay.style.display = 'block';
        sidebarMenu.classList.remove('active');

        // Reset flags and data
        isDisplayingFavorites = false;
        currentSearchResults = [];
        currentCategoryData = [];
        searchInput.value = '';

        if (type === 'category') {
            currentCategoryData = data;
        } else if (type === 'search') {
            currentSearchResults = data;
            searchInput.value = keyword;
        } else if (type === 'favorites') { // กรณีแสดงรายการโปรด
            isDisplayingFavorites = true;
            document.querySelector('#full-movie-display .controls label').textContent = 'รายการโปรด:'; // เปลี่ยน label
            document.getElementById('displayCount').style.display = 'none'; // ซ่อน select จำนวนแสดง
            // เปลี่ยน title ใน header (ถ้าคุณมี element สำหรับเปลี่ยน title ใน full-movie-display)
            // เช่น ถ้าคุณมี <h2 id="full-display-title"></h2> ใน full-movie-display
            // document.getElementById('full-display-title').textContent = 'รายการโปรด';
            // แต่เนื่องจาก H1 เป็น header หลัก เราจะไม่เปลี่ยนมัน
            // ถ้าอยากเปลี่ยน header หลักให้เป็น "รายการโปรด" ต้องทำเพิ่ม
            clearFavoritesBtn.style.display = 'flex'; // แสดงปุ่มล้าง
        } else { // default to category if type is unknown
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
            paginationControls.style.display = 'none'; 
        }
    }

    // --- NEW: Favorite Functions ---
    function getFavorites() {
        try {
            return JSON.parse(localStorage.getItem("favorites") || "[]");
        } catch (e) {
            console.error("Error parsing favorites from localStorage:", e);
            return [];
        }
    }

    function showFavorites() {
        const favorites = getFavorites();
        showFullMovieDisplay('favorites', favorites);
        sidebarMenu.classList.remove('active'); // ปิดเมนู sidebar
        // ปรับ UI ของ displayCountSelect และ label กลับมาใน showCategoryShowcase หรือเมื่อออกจาก Favorites
        document.querySelector('#full-movie-display .controls label').textContent = 'แสดง: ';
        document.getElementById('displayCount').style.display = 'inline-block'; // แสดง select จำนวนแสดง
    }

    function clearAllFavorites() {
        if (confirm('คุณแน่ใจหรือไม่ที่ต้องการล้างรายการโปรดทั้งหมด?')) {
            localStorage.removeItem('favorites');
            showFavorites(); // แสดงรายการโปรดที่ว่างเปล่า
            // ปรับ UI ของปุ่ม Favorite ใน Player Page หากผู้ใช้อยู่ที่นั่น
            // (ต้องมีวิธีสื่อสารระหว่างหน้า หรือให้ผู้ใช้รีเฟรชหน้า Player)
            alert('รายการโปรดทั้งหมดถูกล้างแล้ว!');
        }
    }
    // --- END NEW: Favorite Functions ---

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    // Event Listener สำหรับ Favorites Link
    favoritesLink.addEventListener('click', (event) => {
        event.preventDefault();
        showFavorites();
    });

    // Event Listener สำหรับปุ่มล้างรายการโปรด
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
        // เพิ่ม homeLink ก่อน favoritesLink
        sidebarMenu.insertBefore(homeLink, favoritesLink);


        const allLink = document.createElement('a');
        allLink.href = "#";
        allLink.dataset.category = "All";
        allLink.textContent = "ทั้งหมด";
        allLink.addEventListener('click', (event) => {
            event.preventDefault(); 
            showFullMovieDisplay('category', Object.values(allMoviesLoaded).flat());
        });
        sidebarMenu.insertBefore(allLink, favoritesLink); // เพิ่ม allLink ก่อน favoritesLink

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
                    showFullMovieDisplay('category', allMoviesLoaded[source.id]);
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

        // ตรวจสอบ URL parameter สำหรับหมวดหมู่หรือการค้นหาเมื่อโหลดหน้า
        const urlParams = new URLSearchParams(window.location.search);
        const initialCategory = urlParams.get('category');
        const initialSearch = urlParams.get('search');
        const initialFavorites = urlParams.get('favorites'); // ตรวจสอบ parameter สำหรับ favorites

        if (initialSearch) {
            searchInput.value = initialSearch;
            performSearch();
        } else if (initialFavorites === 'true') { // ถ้ามี ?favorites=true ใน URL
            showFavorites();
        } else if (initialCategory && allMoviesLoaded[initialCategory]) {
            showFullMovieDisplay('category', allMoviesLoaded[initialCategory]);
        } else if (initialCategory === "All") {
            showFullMovieDisplay('category', Object.values(allMoviesLoaded).flat());
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
        moviesPerPage = event.target.value === 'all' ? 'all' : parseInt(event.target.value);
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


