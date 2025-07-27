// lib/signup-utils.js (Utility Functions)
// =======================
import { adminDb } from './firebase-admin';

// Generate unique vendor ID
export async function generateVendorId(region) {
  try {
    const regionCode = region ? region.substring(0, 3).toUpperCase() : 'GEN';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const vendorId = `V${regionCode}${timestamp}${random}`;
    
    // Check if ID already exists
    const existingVendor = await adminDb.collection('vendors')
      .where('vendorId', '==', vendorId).get();
    
    if (!existingVendor.empty) {
      // If exists, recursively generate new ID
      return generateVendorId(region);
    }
    
    return vendorId;
  } catch (error) {
    console.error('Error generating vendor ID:', error);
    return `V${Date.now()}`;
  }
}

// Generate unique supplier ID
export async function generateSupplierId() {
  try {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const supplierId = `S${timestamp}${random}`;
    
    // Check if ID already exists
    const existingSupplier = await adminDb.collection('suppliers')
      .where('supplierId', '==', supplierId).get();
    
    if (!existingSupplier.empty) {
      // If exists, recursively generate new ID
      return generateSupplierId();
    }
    
    return supplierId;
  } catch (error) {
    console.error('Error generating supplier ID:', error);
    return `S${Date.now()}`;
  }
}

// Send welcome email (placeholder for email service)
export async function sendWelcomeEmail(email, name, userType) {
  try {
    // Implement your email service here (SendGrid, AWS SES, etc.)
    console.log(`Welcome email would be sent to ${email} for ${userType} ${name}`);
    
    // Example email content
    const emailContent = {
      to: email,
      subject: `Welcome to SathiBuy, ${name}!`,
      html: `
        <h2>Welcome to SathiBuy!</h2>
        <p>Hi ${name},</p>
        <p>Your ${userType} account has been created successfully.</p>
        <p>Next steps:</p>
        <ul>
          <li>Complete your profile setup</li>
          ${userType === 'vendor' ? 
            '<li>Set your location for group matching</li>' : 
            '<li>Verify your business documents</li>'
          }
          <li>Start ${userType === 'vendor' ? 'joining bulk orders' : 'creating bulk deals'}</li>
        </ul>
        <p>Thank you for choosing SathiBuy!</p>
      `
    };
    
    // Here you would actually send the email
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}