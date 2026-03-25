// api/cron.js - Cron job endpoint for updating cache
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
        console.log('🔄 Starting scheduled cache update...');
        
        // Import the update function
        const { updateCache } = require('../scripts/update-cache.js');
        
        // Update cache
        const cacheData = await updateCache();
        
        res.status(200).json({
            success: true,
            message: 'Cache updated successfully via cron job',
            data: {
                totalMovies: cacheData.totalMovies,
                lastUpdated: cacheData.lastUpdated,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Cron cache update failed:', error.message);
        res.status(500).json({ 
            error: error.message,
            message: 'Failed to update cache via cron job'
        });
    }
}
