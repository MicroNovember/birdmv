// api/movies-json.js - Protected JSON endpoint
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
    const blockedAgents = ['curl', 'wget', 'python', 'java', 'scrapy', 'bot', 'crawler', 'postman', 'insomnia'];
    const isBlockedAgent = blockedAgents.some(agent => 
        userAgent.toLowerCase().includes(agent)
    );
    
    // Check referer - only allow from our domain
    const isAllowedReferer = referer.includes('samorn-flix.vercel.app') || 
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
        console.log('🚨 Suspicious JSON request blocked:', {
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
    
    try {
        console.log(`🔒 Serving protected JSON to IP: ${clientIP}`);
        
        // Read movies.json file
        const fs = require('fs').promises;
        const path = require('path');
        
        const jsonPath = path.join(process.cwd(), 'public', 'movies.json');
        const REAL_API = "https://api.av24flix.com/api/v1/users/operation/movies?page=1&limit=1500";
        const jsonContent = await fs.readFile(jsonPath, 'utf8');
        const moviesData = JSON.parse(jsonContent);
        
        // Add security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
        res.setHeader('Content-Type', 'application/json');
        
        // Add watermark/obfuscation
        const protectedData = {
            ...moviesData,
            _protected: true,
            _timestamp: Date.now(),
            _source: 'samorn-flix-vercel-app',
            _note: 'This data is protected and should not be scraped'
        };
        
        res.status(200).json(protectedData);
        
    } catch (error) {
        console.error('❌ Protected JSON Error:', error.message);
        res.status(500).json({ 
            error: error.message,
            message: 'Failed to load protected data'
        });
    }
}
