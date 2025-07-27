// pages/api/auth/signin.js
// =======================
import { rateLimit } from '../../../lib/middleware';

export default async function handler(req, res) {
  // Apply rate limiting
  rateLimit(5, 15 * 60 * 1000)(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { email, password, userType, idToken } = req.body;

      // Validation
      if (!email || !userType) {
        return res.status(400).json({ error: 'Email and user type are required' });
      }

      if (!['vendor', 'supplier'].includes(userType)) {
        return res.status(400).json({ error: 'Invalid user type' });
      }

      // For testing purposes, we'll simulate a successful signin
      // In production, you would verify the Firebase ID token here
      
      const mockUserData = {
        uid: `mock_${Date.now()}`,
        email: email.toLowerCase().trim(),
        name: 'Test User',
        phone: '1234567890',
        userType: userType,
        isActive: true,
        isOnboardingComplete: false,
        lastLoginAt: new Date().toISOString(),
        loginCount: 1
      };

      // Add user-type specific fields
      if (userType === 'vendor') {
        mockUserData.location = null;
        mockUserData.region = null;
        mockUserData.businessType = null;
        mockUserData.totalOrders = 0;
      } else if (userType === 'supplier') {
        mockUserData.companyName = null;
        mockUserData.verificationStatus = 'pending';
        mockUserData.products = [];
        mockUserData.rating = 0;
        mockUserData.totalDeals = 0;
      }

      // Success response
      res.status(200).json({
        success: true,
        message: 'Sign in successful',
        user: {
          uid: mockUserData.uid,
          email: mockUserData.email,
          displayName: mockUserData.name,
          userType: userType
        },
        userData: mockUserData,
        redirectTo: mockUserData.isOnboardingComplete ? 
          `/${userType}-dashboard` : 
          `/${userType}-onboarding`
      });

    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Sign in failed. Please try again.' });
    }
  });
}