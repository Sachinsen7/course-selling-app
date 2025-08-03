// Simple test to verify PhonePe configuration
const dotenv = require('dotenv');
dotenv.config();

console.log('💳 Testing PhonePe Payment Configuration...\n');

// Check PhonePe environment variables
const phonePeVars = [
    'PHONEPE_MERCHANT_ID',
    'PHONEPE_SALT_KEY',
    'PHONEPE_SALT_INDEX',
    'PHONEPE_BASE_URL',
    'PHONEPE_REDIRECT_URL',
    'PHONEPE_WEBHOOK_URL'
];

let phonePeConfigured = true;

phonePeVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: ${varName.includes('SALT') ? '***HIDDEN***' : value}`);
    } else {
        console.log(`⚠️  ${varName}: NOT SET (will use defaults for testing)`);
        if (varName === 'PHONEPE_MERCHANT_ID' || varName === 'PHONEPE_SALT_KEY') {
            phonePeConfigured = false;
        }
    }
});

console.log('\n🔗 PhonePe URLs:');
console.log(`🏪 Base URL: ${process.env.PHONEPE_BASE_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox'}`);
console.log(`🔙 Redirect: ${process.env.PHONEPE_REDIRECT_URL || 'http://localhost:3000/api/payment/phonepe/callback'}`);
console.log(`🔔 Webhook: ${process.env.PHONEPE_WEBHOOK_URL || 'http://localhost:3000/api/payment/phonepe/webhook'}`);

console.log('\n🚀 Test Payment Flow:');
console.log('1. Create a course with price > 0');
console.log('2. Try to purchase the course');
console.log('3. Use PhonePe test credentials');
console.log('4. Verify payment status updates');

if (phonePeConfigured) {
    console.log('\n✅ PhonePe configuration looks good!');
} else {
    console.log('\n⚠️  PhonePe requires merchant credentials for production.');
    console.log('   For testing, you can use the mock payment system.');
}

console.log('\n📋 Payment API Endpoints:');
console.log('• POST /api/payment/process - Mock payment processing');
console.log('• POST /api/payment/phonepe/initiate - Start PhonePe payment');
console.log('• POST /api/payment/phonepe/callback - PhonePe callback');
console.log('• POST /api/payment/phonepe/webhook - PhonePe webhook');

console.log('\n💡 Note: For production, register at https://business.phonepe.com/');
console.log('   and update the environment variables with real credentials.');
