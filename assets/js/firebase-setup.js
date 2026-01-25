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

        console.log('✅ Firebase initialized successfully!');
        console.log('📝 Default VIP code: 1234');
        console.log('🔗 Admin Dashboard: /admin.html');
        
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
        
        console.log('✅ Test VIP codes created:', testCodes.join(', '));
        
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
    }
}

// Auto-initialize when page loads (only on index.html)
if (window.location.pathname.includes('index.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Check if already initialized
        db.collection('vip_codes').doc('1234').get().then(doc => {
            if (!doc.exists) {
                console.log('🔧 Initializing Firebase for the first time...');
                initializeFirebase();
            } else {
                console.log('✅ Firebase already initialized');
            }
        }).catch(error => {
            console.log('🔧 Initializing Firebase...');
            initializeFirebase();
        });
    });
}
