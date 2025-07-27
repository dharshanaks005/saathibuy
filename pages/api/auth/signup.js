// =======================
// pages/api/auth/signup.js
// =======================
import { rateLimit } from '../../../lib/middleware';

export default async function handler(req, res) {
  // Apply rate limiting
  rateLimit(3, 15 * 60 * 1000)(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { name, email, phone, password, confirmPassword, userType, idToken } = req.body;

      // Validation
      if (!name || !email || !phone || !userType) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (!['vendor', 'supplier'].includes(userType)) {
        return res.status(400).json({ error: 'Invalid user type' });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Phone validation
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Phone number must be 10 digits' });
      }

      // For testing purposes, we'll simulate a successful signup
      // In production, you would use Firebase Admin SDK here
      
      const mockUserData = {
        uid: `mock_${Date.now()}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        userType: userType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        emailVerified: false,
      };

      // Add user-type specific fields
      if (userType === 'vendor') {
        mockUserData.location = null;
        mockUserData.region = null;
        mockUserData.businessType = null;
        mockUserData.groupId = null;
        mockUserData.totalOrders = 0;
        mockUserData.isOnboardingComplete = false;
      } else if (userType === 'supplier') {
        mockUserData.companyName = null;
        mockUserData.verificationStatus = 'pending';
        mockUserData.products = [];
        mockUserData.rating = 0;
        mockUserData.totalDeals = 0;
        mockUserData.isVerified = false;
      }

      // Success response
      res.status(201).json({
        success: true,
        message: `${userType} account created successfully!`,
        user: {
          uid: mockUserData.uid,
          email: mockUserData.email,
          displayName: mockUserData.name,
          userType: userType
        },
        userData: mockUserData,
        nextStep: `/${userType}-onboarding`
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Account creation failed. Please try again.' });
    }
  });
}

// =======================


