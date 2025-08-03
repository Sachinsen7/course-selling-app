// Simple test to verify OAuth configuration
const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Testing OAuth Configuration...\n');

// Check required environment variables
const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'GOOGLE_CALLBACK_URL',
    'JWT_SECRET',
    'FRONTEND_URL'
];

let allConfigured = true;

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***HIDDEN***' : value}`);
    } else {
        console.log(`❌ ${varName}: NOT SET`);
        allConfigured = false;
    }
});

console.log('\n🔗 OAuth URLs:');
console.log(`📱 Frontend: ${process.env.FRONTEND_URL || 'NOT SET'}`);
console.log(`🔙 Callback: ${process.env.GOOGLE_CALLBACK_URL || 'NOT SET'}`);
console.log(`🎯 Auth Success: ${process.env.FRONTEND_URL || 'NOT SET'}/auth/success`);

console.log('\n🚀 Test OAuth Flow:');
console.log('1. Go to: http://localhost:5174/login');
console.log('2. Click "Continue with Google"');
console.log('3. Complete Google OAuth');
console.log('4. Should redirect to: http://localhost:5174/auth/success');

if (allConfigured) {
    console.log('\n✅ All OAuth configuration looks good!');
} else {
    console.log('\n❌ Some configuration is missing. Please check your .env file.');
}

console.log('\n📋 Backend API Endpoints:');
console.log('• GET  /api/auth/google - Start OAuth flow');
console.log('• GET  /api/auth/google/callback - OAuth callback');
console.log('• GET  /api/auth/me - Get current user');
console.log('• POST /api/auth/logout - Logout user');
console.log('• POST /api/auth/logout - Logout user');

