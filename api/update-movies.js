// api/update-movies.js - Update movies data every 6 hours
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST for security
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        console.log('Starting movies data update...');
        
        // Fetch all movies from real API
        const REAL_API = "https://api.av24flix.com/api/v1/users/operation/movies?page=1&limit=1000";
        
        const response = await fetch(REAL_API, {
            method: 'GET',
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'SAMORN-Flix-Updater/1.0'
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
        
        // Save to public directory (simulated - in production you'd use Vercel KV or similar)
        const moviesData = {
            lastUpdated: new Date().toISOString(),
            totalMovies: movies.length,
            movies: movies
        };
        
        // In production, you'd save to Vercel KV, database, or file system
        // For now, we'll return the data to be cached
        
        console.log(`Successfully updated movies data: ${movies.length} movies`);
        
        res.status(200).json({
            success: true,
            message: 'Movies data updated successfully',
            data: moviesData
        });
        
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ 
            error: error.message,
            message: 'Failed to update movies data'
        });
    }
}
