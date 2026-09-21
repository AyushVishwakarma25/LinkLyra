// Validate build environment variables
// Fails production builds when VITE_RAZORPAY_KEY_ID is empty or contains "placeholder"

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const razorpayKey = process.env.VITE_RAZORPAY_KEY_ID;
  if (!razorpayKey || razorpayKey.trim() === '' || razorpayKey.toLowerCase().includes('placeholder')) {
    console.error('❌ Production build failed: VITE_RAZORPAY_KEY_ID must be provided and cannot be empty or contain "placeholder".');
    process.exit(1);
  }
}
