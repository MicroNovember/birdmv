// scripts/update-cache.js - Script to update movies cache
const fetch = require('node-fetch');

async function updateCache() {
    try {
        console.log('🔄 Updating movies cache...');
        
        // Fetch all movies from API - increase to 1500
        const response = await fetch('https://api.av24flix.com/api/v1/users/operation/movies?page=1&limit=1500', {
            method: 'GET',
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'SAMORN-Flix-Cron/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data || !data.message || !data.message.data || !data.message.data.movies) {
            throw new Error('Invalid API response format');
        }
        
        const movies = data.message.data.movies;
        
        // Create cache data
        const cacheData = {
            lastUpdated: new Date().toISOString(),
            totalMovies: movies.length,
            movies: movies
        };
        
        // Write to public directory
        const fs = require('fs').promises;
        const path = require('path');
        
        const publicDir = path.join(__dirname, '..', 'public');
        const cacheFile = path.join(publicDir, 'movies.json');
        
        // Ensure public directory exists
        await fs.mkdir(publicDir, { recursive: true });
        
        // Write cache file
        await fs.writeFile(cacheFile, JSON.stringify(cacheData, null, 2));
        
        console.log(`✅ Cache updated successfully: ${movies.length} movies`);
        console.log(`📁 Cache file: ${cacheFile}`);
        console.log(`🕐 Last updated: ${cacheData.lastUpdated}`);
        
        return cacheData;
        
    } catch (error) {
        console.error('❌ Cache update failed:', error.message);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    updateCache()
        .then(() => {
            console.log('🎉 Cache update completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Cache update failed:', error);
            process.exit(1);
        });
}

module.exports = { updateCache };
