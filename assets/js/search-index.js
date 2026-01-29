// Global Search Index for Movie Website
// Created: 2026-01-29
// Purpose: Comprehensive search across all movie categories

// Global search index and state
let globalSearchIndex = [];
let searchIndexLoaded = false;
let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

// Categories configuration
const SEARCH_CATEGORIES = [
    { key: 'thai', title: 'หนังไทย', priority: 1 },
    { key: 'korea', title: 'หนังเกาหลี', priority: 2 },
    { key: 'china', title: 'หนังจีน/ฮ่องกง', priority: 3 },
    { key: 'inter', title: 'หนังฝรั่ง/สากล', priority: 4 },
    { key: 'cartoon', title: 'การ์ตูน/อนิเมชั่น', priority: 5 },
    { key: 'india', title: 'หนังอินเดีย', priority: 6 },
    { key: 'asia', title: 'หนังเอเซีย', priority: 7 },
    { key: 'temp', title: 'VIP', priority: 8, vip: true }
];

/**
 * Build comprehensive search index from all categories
 * This function loads all movies from all categories and creates a searchable index
 */
async function buildGlobalSearchIndex() {
    console.log('🔍 Building global search index...');
    globalSearchIndex = [];
    
    for (const category of SEARCH_CATEGORIES) {
        try {
            // Check VIP access for VIP categories
            if (category.vip) {
                const userType = localStorage.getItem('user_type');
                const vipData = localStorage.getItem('vip_access');
                let isVip = false;
                
                if (vipData) {
                    try {
                        const { expires } = JSON.parse(vipData);
                        isVip = expires && new Date(expires) > new Date();
                    } catch (error) {
                        console.error('Error checking VIP status:', error);
                    }
                }
                
                const isLoggedIn = userType === 'guest' || userType === 'vip';
                
                if (!isLoggedIn || !isVip) {
                    console.log(`Skipping VIP category ${category.key} - no access`);
                    continue;
                }
            }
            
            // Load movies from category
            const functionName = 'get' + category.key.toUpperCase();
            if (typeof window[functionName] === 'function') {
                const movies = window[functionName]();
                console.log(`Loaded ${movies.length} movies from ${category.key}`);
                
                // Process and add valid movies to index
                const validMovies = movies.filter(movie => {
                    if (!movie || typeof movie !== 'object') return false;
                    
                    const movieFile = movie['video-audio1'] || movie.file || movie.url;
                    const movieName = movie.name || '';
                    
                    return movieFile && movieName && movieName.trim() !== '';
                });
                
                // Add movies to global index with metadata
                validMovies.forEach(movie => {
                    const indexedMovie = {
                        ...movie,
                        searchCategory: category.key,
                        searchCategoryTitle: category.title,
                        searchPriority: category.priority,
                        searchableText: createSearchableText(movie)
                    };
                    globalSearchIndex.push(indexedMovie);
                });
                
                console.log(`Added ${validMovies.length} valid movies to index from ${category.key}`);
            } else {
                console.warn(`Function ${functionName} not found for category ${category.key}`);
            }
        } catch (error) {
            console.error(`Error loading category ${category.key}:`, error);
        }
    }
    
    searchIndexLoaded = true;
    console.log(`✅ Global search index built with ${globalSearchIndex.length} movies`);
    return globalSearchIndex;
}

/**
 * Create searchable text from movie object
 * This combines all searchable fields into one string for easy searching
 */
function createSearchableText(movie) {
    const fields = [
        movie.name || '',
        movie.info || '',
        movie.description || '',
        movie.category || '',
        movie.year || '',
        movie.cast || '',
        movie.director || '',
        movie.genre || '',
        movie.tags || ''
    ];
    
    return fields.join(' ').toLowerCase().trim();
}

/**
 * Enhanced search function with ranking and filtering
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Array} - Array of search results with ranking
 */
function searchGlobalIndex(query, options = {}) {
    const {
        category = null,           // Filter by specific category
        limit = 50,               // Limit results
        sortBy = 'relevance',     // Sort by: relevance, name, year, category
        includeVIP = false        // Include VIP results
    } = options;
    
    if (!query || query.length < 2) {
        return [];
    }
    
    // Save search query to history
    saveSearchQuery(query);
    
    const searchQuery = query.toLowerCase().trim();
    const results = [];
    
    // Search through global index
    for (const movie of globalSearchIndex) {
        // Skip VIP if not requested
        if (movie.searchCategory === 'temp' && !includeVIP) {
            const userType = localStorage.getItem('user_type');
            const vipData = localStorage.getItem('vip_access');
            let isVip = false;
            
            if (vipData) {
                try {
                    const { expires } = JSON.parse(vipData);
                    isVip = expires && new Date(expires) > new Date();
                } catch (error) {
                    // Ignore VIP check errors
                }
            }
            
            const isLoggedIn = userType === 'guest' || userType === 'vip';
            if (!isLoggedIn || !isVip) continue;
        }
        
        // Filter by category if specified
        if (category && movie.searchCategory !== category) continue;
        
        // Calculate relevance score
        const relevance = calculateRelevance(movie, searchQuery);
        
        if (relevance > 0) {
            results.push({
                ...movie,
                relevanceScore: relevance
            });
        }
    }
    
    // Sort results
    const sortedResults = sortSearchResults(results, sortBy);
    
    // Limit results
    return sortedResults.slice(0, limit);
}

/**
 * Calculate relevance score for search ranking
 * @param {Object} movie - Movie object
 * @param {string} query - Search query
 * @returns {number} - Relevance score (0-100)
 */
function calculateRelevance(movie, query) {
    let score = 0;
    const searchableText = movie.searchableText;
    const movieName = (movie.name || '').toLowerCase();
    const movieInfo = (movie.info || '').toLowerCase();
    
    // Exact name match (highest score)
    if (movieName === query) score += 100;
    else if (movieName.includes(query)) score += 80;
    
    // Name starts with query
    if (movieName.startsWith(query)) score += 60;
    
    // Word boundaries in name
    const words = movieName.split(/\s+/);
    for (const word of words) {
        if (word === query) score += 50;
        else if (word.startsWith(query)) score += 30;
    }
    
    // Info/description matches
    if (movieInfo.includes(query)) score += 20;
    
    // Partial matches in searchable text
    const queryWords = query.split(/\s+/);
    for (const qWord of queryWords) {
        if (searchableText.includes(qWord)) score += 10;
    }
    
    // Category priority boost
    score += (10 - movie.searchPriority) * 2;
    
    return Math.min(score, 100);
}

/**
 * Sort search results by specified criteria
 * @param {Array} results - Search results
 * @param {string} sortBy - Sort criteria
 * @returns {Array} - Sorted results
 */
function sortSearchResults(results, sortBy) {
    const sorted = [...results];
    
    switch (sortBy) {
        case 'relevance':
            return sorted.sort((a, b) => b.relevanceScore - a.relevanceScore);
        case 'name':
            return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'th'));
        case 'year':
            return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
        case 'category':
            return sorted.sort((a, b) => a.searchPriority - b.searchPriority);
        default:
            return sorted.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
}

/**
 * Save search query to history
 * @param {string} query - Search query
 */
function saveSearchQuery(query) {
    if (query.length < 2) return;
    
    // Remove if already exists
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== query.toLowerCase());
    // Add to beginning
    searchHistory.unshift(query);
    // Keep only last 10
    searchHistory = searchHistory.slice(0, 10);
    // Save to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

/**
 * Get search suggestions based on input
 * @param {string} partialQuery - Partial search query
 * @returns {Array} - Array of suggestions
 */
function getSearchSuggestions(partialQuery) {
    if (partialQuery.length < 2) return [];
    
    const suggestions = [];
    const query = partialQuery.toLowerCase();
    
    // Get suggestions from search history
    for (const historyItem of searchHistory) {
        if (historyItem.toLowerCase().includes(query)) {
            suggestions.push({
                text: historyItem,
                type: 'history',
                source: 'ประวัติการค้นหา'
            });
        }
    }
    
    // Get suggestions from movie names
    const movieNames = new Set();
    for (const movie of globalSearchIndex) {
        const movieName = movie.name || '';
        if (movieName.toLowerCase().includes(query)) {
            movieNames.add(movieName);
        }
    }
    
    // Add unique movie name suggestions
    for (const movieName of Array.from(movieNames).slice(0, 5)) {
        suggestions.push({
            text: movieName,
            type: 'movie',
            source: globalSearchIndex.find(m => m.name === movieName)?.searchCategoryTitle || 'หนัง'
        });
    }
    
    return suggestions.slice(0, 8);
}

/**
 * Get popular search terms (most searched)
 * @returns {Array} - Array of popular terms
 */
function getPopularSearchTerms() {
    // For now, return search history sorted by frequency
    const termFrequency = {};
    for (const term of searchHistory) {
        termFrequency[term] = (termFrequency[term] || 0) + 1;
    }
    
    return Object.entries(termFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([term]) => term);
}

/**
 * Initialize search system
 * This should be called when the page loads
 */
async function initializeSearchSystem() {
    console.log('🚀 Initializing search system...');
    
    // Build search index
    await buildGlobalSearchIndex();
    
    // Set up search input listeners if on appropriate page
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        setupSearchInputListeners(searchInput);
    }
    
    const mobileSearchInput = document.getElementById('mobile-search-input');
    if (mobileSearchInput) {
        setupMobileSearchListeners(mobileSearchInput);
    }
    
    console.log('✅ Search system initialized');
}

/**
 * Set up search input listeners for desktop
 * @param {HTMLElement} searchInput - Search input element
 */
function setupSearchInputListeners(searchInput) {
    let searchTimeout;
    let currentFocus = -1;
    
    // Real-time search with debounce
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length >= 2) {
            searchTimeout = setTimeout(() => {
                performGlobalSearch(query);
                showSearchSuggestions(query);
            }, 300);
        } else if (query.length === 0) {
            clearSearchResults();
            hideSearchSuggestions();
        } else {
            hideSearchSuggestions();
        }
    });
    
    // Enter key search
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                performGlobalSearch(query);
                hideSearchSuggestions();
            }
        }
    });
    
    // Arrow key navigation for suggestions
    searchInput.addEventListener('keydown', function(e) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        const items = suggestionsContainer ? suggestionsContainer.getElementsByClassName('suggestion-item') : [];
        
        if (e.key === 'ArrowDown') {
            currentFocus++;
            addActive(items);
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            currentFocus--;
            addActive(items);
            e.preventDefault();
        } else if (e.key === 'Escape') {
            hideSearchSuggestions();
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !document.getElementById('search-suggestions').contains(e.target)) {
            hideSearchSuggestions();
        }
    });
}

/**
 * Show search suggestions dropdown
 * @param {string} query - Search query
 */
function showSearchSuggestions(query) {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (!suggestionsContainer) return;
    
    const suggestions = getSearchSuggestions(query);
    
    if (suggestions.length === 0) {
        hideSearchSuggestions();
        return;
    }
    
    let suggestionsHtml = '';
    suggestions.forEach((suggestion, index) => {
        const icon = suggestion.type === 'history' ? '🕐' : '🎬';
        suggestionsHtml += `
            <div class="suggestion-item" onclick="selectSuggestion('${suggestion.text.replace(/'/g, "\\'")}')" data-index="${index}">
                <span class="suggestion-icon">${icon}</span>
                <span class="suggestion-text">${suggestion.text}</span>
                <span class="suggestion-type">${suggestion.source}</span>
            </div>
        `;
    });
    
    suggestionsContainer.innerHTML = suggestionsHtml;
    suggestionsContainer.classList.remove('hidden');
}

/**
 * Hide search suggestions dropdown
 */
function hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.add('hidden');
    }
}

/**
 * Select a search suggestion
 * @param {string} suggestion - Selected suggestion text
 */
function selectSuggestion(suggestion) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = suggestion;
        performGlobalSearch(suggestion);
        hideSearchSuggestions();
    }
}

/**
 * Add active class to suggestion item
 * @param {NodeList} items - Suggestion items
 */
function addActive(items) {
    if (!items) return;
    
    // Remove active class from all items
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('active');
    }
    
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    
    // Add active class to current item
    if (currentFocus >= 0) {
        items[currentFocus].classList.add('active');
        items[currentFocus].scrollIntoView({ block: 'nearest' });
    }
}

/**
 * Set up mobile search listeners
 * @param {HTMLElement} mobileSearchInput - Mobile search input element
 */
function setupMobileSearchListeners(mobileSearchInput) {
    let searchTimeout;
    
    mobileSearchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length >= 2) {
            searchTimeout = setTimeout(() => {
                performMobileSearch(query);
            }, 300);
        } else if (query.length === 0) {
            clearMobileSearchResults();
        }
    });
}

/**
 * Perform global search and display results
 * @param {string} query - Search query
 */
function performGlobalSearch(query) {
    console.log(`🔍 Performing global search for: "${query}"`);
    
    const results = searchGlobalIndex(query, { limit: 100 });
    
    // Update search state
    if (typeof window !== 'undefined') {
        // Set global window variables
        window.isSearchMode = true;
        window.searchResults = results;
        window.currentPage = 1;
        window.currentSearchQuery = query;
        
        // Set category.js global search state variables if they exist
        if (typeof isGlobalSearchMode !== 'undefined') {
            isGlobalSearchMode = true;
            globalSearchResults = results;
            globalSearchQuery = query;
            
            // Also set local search state for compatibility
            isSearchMode = true;
            searchResults = results;
            currentPage = 1;
        }
        
        // Display results using existing displayMovies function
        if (typeof displayMovies === 'function') {
            displayMovies(results, `ผลการค้นหา "${query}" จากทุกหมวดหมู่ (${results.length} รายการ)`);
        }
    }
    
    console.log(`📊 Found ${results.length} results for "${query}"`);
}

/**
 * Perform mobile search
 * @param {string} query - Search query
 */
function performMobileSearch(query) {
    console.log(`📱 Performing mobile search for: "${query}"`);
    
    const results = searchGlobalIndex(query, { limit: 12 });
    const searchResult = document.getElementById('mobile-search-result-grid');
    
    if (searchResult) {
        if (results.length > 0) {
            const cardsHtml = results.map(createMovieCard).join('');
            searchResult.innerHTML = cardsHtml;
        } else {
            searchResult.innerHTML = '<p class="text-gray-400 text-center col-span-full">ไม่พบรายการที่ตรงกับการค้นหา</p>';
        }
    }
    
    console.log(`📱 Found ${results.length} mobile results for "${query}"`);
}

/**
 * Clear search results and return to normal view
 */
function clearSearchResults() {
    if (typeof window !== 'undefined') {
        // Reset global window variables
        window.isSearchMode = false;
        window.searchResults = [];
        window.currentPage = 1;
        window.currentSearchQuery = '';
        
        // Reset category.js global search state variables if they exist
        if (typeof isGlobalSearchMode !== 'undefined') {
            isGlobalSearchMode = false;
            globalSearchResults = [];
            globalSearchQuery = '';
            
            // Also reset local search state for compatibility
            isSearchMode = false;
            searchResults = [];
            currentPage = 1;
        }
        
        // Clear search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Return to normal category view
        if (typeof loadCategory === 'function' && window.currentCategory) {
            loadCategory(window.currentCategory);
        }
    }
}

/**
 * Clear mobile search results
 */
function clearMobileSearchResults() {
    const searchResult = document.getElementById('mobile-search-result-grid');
    if (searchResult) {
        searchResult.innerHTML = '<p class="text-gray-400 text-center col-span-full">กรุณาพิมพ์เพื่อค้นหาหนัง</p>';
    }
}

// Export functions for global access
if (typeof window !== 'undefined') {
    window.buildGlobalSearchIndex = buildGlobalSearchIndex;
    window.searchGlobalIndex = searchGlobalIndex;
    window.getSearchSuggestions = getSearchSuggestions;
    window.getPopularSearchTerms = getPopularSearchTerms;
    window.initializeSearchSystem = initializeSearchSystem;
    window.performGlobalSearch = performGlobalSearch;
    window.performMobileSearch = performMobileSearch;
    window.clearSearchResults = clearSearchResults;
    window.clearMobileSearchResults = clearMobileSearchResults;
    window.showSearchSuggestions = showSearchSuggestions;
    window.hideSearchSuggestions = hideSearchSuggestions;
    window.selectSuggestion = selectSuggestion;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSearchSystem);
    } else {
        initializeSearchSystem();
    }
}
