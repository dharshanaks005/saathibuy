// =======================
// pages/api/auth/check-email.js (Email availability check)
// =======================
import { adminAuth, adminDb } from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        available: false, 
        error: 'Invalid email format' 
      });
    }

    // Check Firebase Auth
    let authUserExists = false;
    try {
      await adminAuth.getUserByEmail(email);
      authUserExists = true;
    } catch (error) {
      // User doesn't exist in Firebase Auth
    }

    if (authUserExists) {
      return res.status(200).json({
        available: false,
        message: 'Email is already registered'
      });
    }

    // Check Firestore collections
    const vendorQuery = await adminDb.collection('vendors')
      .where('email', '==', email.toLowerCase()).get();
    
    const supplierQuery = await adminDb.collection('suppliers')
      .where('email', '==', email.toLowerCase()).get();

    if (!vendorQuery.empty || !supplierQuery.empty) {
      return res.status(200).json({
        available: false,
        message: 'Email is already registered'
      });
    }

    res.status(200).json({
      available: true,
      message: 'Email is available'
    });

  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// =======================
// Database Schema Validation
// =======================
import Joi from 'joi';

// Vendor signup schema
export const vendorSignupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^(\+91|91|0)?[6789]\d{9}$/).required(),
  password: Joi.string().min(6).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  userType: Joi.string().valid('vendor').required()
});

// Supplier signup schema
export const supplierSignupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^(\+91|91|0)?[6789]\d{9}$/).required(),
  password: Joi.string().min(6).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  userType: Joi.string().valid('supplier').required()
});

// =======================
// Rate Limiting Middleware
// =======================
const signupAttempts = new Map();

export function rateLimitSignup(req, res, next) {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // Max 5 signup attempts per 15 minutes

  // Clean old entries
  for (const [ip, data] of signupAttempts.entries()) {
    if (now - data.timestamp > windowMs) {
      signupAttempts.delete(ip);
    }
  }

  // Check current IP
  const ipData = signupAttempts.get(clientIP) || { count: 0, timestamp: now };

  if (ipData.count >= maxRequests && now - ipData.timestamp < windowMs) {
    return res.status(429).json({
      success: false,
      error: 'Too many signup attempts. Please try again later.',
      retryAfter: Math.ceil((windowMs - (now - ipData.timestamp)) / 1000)
    });
  }

  // Update count
  signupAttempts.set(clientIP, {
    count: ipData.count + 1,
    timestamp: ipData.timestamp
  });

  next();
}