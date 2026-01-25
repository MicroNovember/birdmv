// Firebase Setup Script - Run this once to initialize the database
async function initializeFirebase() {
    try {
        // Create default VIP code
        await db.collection('vip_codes').doc('1234').set({
            is_active: true,
            created_at: new Date(),
            usage_count: 0,
            max_usage: null,
            expires: null,
            last_used: null
        });

        console.error('✅ Firebase initialized successfully!');
        console.error('📝 Default VIP code: 1234');
        console.error('🔗 Admin Dashboard: /admin.html');
        
        // Create some test VIP codes
        const testCodes = ['5678', '9999', '2024'];
        
        for (const code of testCodes) {
            await db.collection('vip_codes').doc(code).set({
                is_active: true,
                created_at: new Date(),
                usage_count: 0,
                max_usage: 10,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                last_used: null
            });
        }
        
        console.error('✅ Test VIP codes created:', testCodes.join(', '));
        
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
    }
}

// Auto-initialize when page loads (only on index.html)
if (window.location.pathname.includes('index.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Check if already initialized by checking multiple codes
        const checkCodes = ['1234', '5678', '9999', '2024'];
        let foundCodes = 0;
        
        Promise.all(checkCodes.map(code => 
            db.collection('vip_codes').doc(code).get()
                .then(doc => doc.exists ? 1 : 0)
                .catch(() => 0)
        )).then(results => {
            foundCodes = results.reduce((sum, count) => sum + count, 0);
            
            if (foundCodes === 0) {
                console.error('🔧 Initializing Firebase for the first time...');
                initializeFirebase();
            } else {
                console.error(`✅ Firebase already initialized (${foundCodes}/${checkCodes.length} codes found)`);
            }
        }).catch(error => {
            console.error('🔧 Checking Firebase initialization...');
            // Only initialize if we can't connect to check existing codes
            if (error.message && error.message.includes('blocked')) {
                console.error('⚠️ Firebase connection blocked - skipping initialization');
            } else {
                console.error('🔧 Initializing Firebase...');
                initializeFirebase();
            }
        });
    });
}
