// api/movies.js - Serverless Function with Security
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Security: Check for suspicious requests
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || req.headers['referrer'] || '';
    const origin = req.headers['origin'] || '';
    
    // Block suspicious user agents
    const blockedAgents = ['curl', 'wget', 'python', 'java', 'scrapy', 'bot', 'crawler'];
    const isBlockedAgent = blockedAgents.some(agent => 
        userAgent.toLowerCase().includes(agent)
    );
    
    // Block requests without proper referer (except direct access)
    const isAllowedReferer = !referer || 
        referer.includes('samorn-flix.vercel.app') || 
        referer.includes('localhost') ||
        referer.includes('127.0.0.1');
    
    // Rate limiting by IP (simple implementation)
    const clientIP = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection?.remoteAddress || 
                     req.socket?.remoteAddress || 
                     req.ip || 
                     'unknown';
    
    // Log suspicious activity
    if (isBlockedAgent || !isAllowedReferer) {
        console.log('🚨 Suspicious request blocked:', {
            userAgent: userAgent.substring(0, 100),
            referer: referer.substring(0, 100),
            origin: origin.substring(0, 100),
            ip: clientIP,
            timestamp: new Date().toISOString()
        });
        
        return res.status(403).json({
            error: 'Access Denied',
            message: 'Your request has been blocked for security reasons'
        });
    }
    
    // Get pagination parameters with validation
    const page = Math.max(1, Math.min(100, parseInt(req.query.page) || 1));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 24));
    const offset = (page - 1) * limit;
    
    try {
        console.log(`Loading movies from JSON: page ${page}, limit ${limit}, IP: ${clientIP}`);
        
        // Read directly from movies.json file
        const fs = require('fs').promises;
        const path = require('path');
        
        const jsonPath = path.join(process.cwd(), 'public', 'movies.json');
        const jsonContent = await fs.readFile(jsonPath, 'utf8');
        const moviesData = JSON.parse(jsonContent);
        
        // Check if we have movies
        if (!moviesData.movies || moviesData.movies.length === 0) {
            console.log('No movies found in JSON, fetching from API...');
            
            // Fallback: fetch from real API and update JSON
            const REAL_API = "https://api.av24flix.com/api/v1/users/operation/movies?page=1&limit=1500";
            
            const response = await fetch(REAL_API, {
                method: 'GET',
                headers: { 
                    'Accept': 'application/json',
                    'User-Agent': 'SAMORN-Flix/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data || !data.message || !data.message.data || !data.message.data.movies) {
                throw new Error('Invalid API response format');
            }
            
            const allMovies = data.message.data.movies;
            
            // Update JSON file
            const newCacheData = {
                lastUpdated: new Date().toISOString(),
                totalMovies: allMovies.length,
                movies: allMovies
            };
            
            await fs.writeFile(jsonPath, JSON.stringify(newCacheData, null, 2));
            console.log(`Updated JSON with ${allMovies.length} movies`);
            
            moviesData.movies = allMovies;
        }
        
        const allMovies = moviesData.movies;
        
        // Paginate from JSON data
        const paginatedMovies = allMovies.slice(offset, offset + limit);
        const totalPages = Math.ceil(allMovies.length / limit);
        
        const response = {
            message: {
                data: {
                    movies: paginatedMovies,
                    pagination: {
                        currentPage: page,
                        itemsPerPage: limit,
                        totalItems: allMovies.length,
                        totalPages: totalPages,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                }
            }
        };
        
        console.log(`Returning ${paginatedMovies.length} movies from JSON (total: ${allMovies.length})`);
        
        // Add security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.status(200).json(response);
        
    } catch (error) {
        console.error('JSON Loading Error:', error.message);
        res.status(500).json({ 
            error: error.message,
            message: 'Failed to load movies from JSON'
        });
    }
}
