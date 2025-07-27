// =======================
// pages/api/onboarding.js (Missing API)
// =======================
import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "sathibuy-1a0e2",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    projectId: "sathibuy-1a0e2",
  });
}

const db = admin.firestore();
const auth = admin.auth();

// Region calculator function
function calculateRegion(latitude, longitude) {
  // Kerala regions based on coordinates
  const regions = {
    'thrissur-north': {
      minLat: 10.5000,
      maxLat: 10.6000,
      minLng: 76.2000,
      maxLng: 76.3000
    },
    'thrissur-south': {
      minLat: 10.4000,
      maxLat: 10.5000,
      minLng: 76.2000,
      maxLng: 76.3000
    },
    'kochi-central': {
      minLat: 9.9000,
      maxLat: 10.0000,
      minLng: 76.2500,
      maxLng: 76.3500
    },
    'kozhikode': {
      minLat: 11.2400,
      maxLat: 11.2600,
      minLng: 75.7600,
      maxLng: 75.7800
    }
  };

  for (const [regionName, bounds] of Object.entries(regions)) {
    if (
      latitude >= bounds.minLat &&
      latitude <= bounds.maxLat &&
      longitude >= bounds.minLng &&
      longitude <= bounds.maxLng
    ) {
      return regionName;
    }
  }

  // Default region if coordinates don't match specific areas
  return 'kerala-general';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify the token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const userId = decodedToken.uid;
    const { products, location } = req.body;

    // Validation
    if (!products || !products.trim()) {
      return res.status(400).json({ error: 'Products field is required' });
    }

    if (!location || !location.lat || !location.lon) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // Validate coordinates
    const latitude = parseFloat(location.lat);
    const longitude = parseFloat(location.lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid location coordinates' });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Location coordinates out of range' });
    }

    // Calculate region based on GPS
    const region = calculateRegion(latitude, longitude);

    // Check if vendor exists
    const vendorDoc = await db.collection('vendors').doc(userId).get();
    if (!vendorDoc.exists()) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Update vendor document with onboarding data
    const updateData = {
      location: {
        latitude: latitude,
        longitude: longitude,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      },
      region: region,
      businessInfo: {
        productsNeeded: products.trim(),
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      isOnboardingComplete: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('vendors').doc(userId).update(updateData);

    // Log onboarding completion
    await db.collection('activity_logs').add({
      userId: userId,
      userType: 'vendor',
      action: 'onboarding_completed',
      details: {
        region: region,
        location: { latitude, longitude },
        productsNeeded: products.trim()
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Success response
    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully!',
      data: {
        region: region,
        location: { latitude, longitude },
        nextStep: '/vendor-dashboard'
      }
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Onboarding failed. Please try again.' });
  }
}

// =======================

// =======================
// pages/vendor-onboarding.js (Fixed with Authentication)
// =======================
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { auth } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function VendorOnboarding() {
  const [products, setProducts] = useState('');
  const [location, setLocation] = useState({ lat: '', lon: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Get GPS location
  const handleGetLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError('Unable to retrieve your location. Please allow location access.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Submit onboarding info
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!products.trim()) {
      setError('Please enter what you need.');
      setLoading(false);
      return;
    }

    if (!location.lat || !location.lon) {
      setError('Please provide your location.');
      setLoading(false);
      return;
    }

    if (!user) {
      setError('Authentication required. Please login again.');
      setLoading(false);
      return;
    }

    try {
      // Get Firebase ID token
      const idToken = await user.getIdToken();

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          products,
          location,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess('Onboarding complete! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/vendor-dashboard');
        }, 1500);
      } else {
        setError(data.error || 'Onboarding failed.');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Vendor Onboarding - SathiBuy</title>
      </Head>
      <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px #0001' }}>
        <h2>Vendor Onboarding</h2>
        <p style={{ marginBottom: 20, color: '#666' }}>
          Welcome! Let's set up your profile to find the best bulk deals in your area.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="products">What do you need? (e.g. rice, oil, vegetables)</label>
            <textarea
              id="products"
              value={products}
              onChange={e => setProducts(e.target.value)}
              placeholder="List the products you need for your business..."
              rows={3}
              style={{ 
                width: '100%', 
                padding: 10, 
                marginTop: 6, 
                borderRadius: 6, 
                border: '1px solid #ccc',
                resize: 'vertical',
                minHeight: 80
              }}
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: 18 }}>
            <label>Location:</label>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
              We need your location to group you with nearby vendors for bulk orders.
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              <button 
                type="button" 
                onClick={handleGetLocation} 
                disabled={loading} 
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: 6, 
                  background: loading ? '#ccc' : '#0e1c38', 
                  color: '#fff', 
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Getting location...' : 'Get My Location'}
              </button>
              {location.lat && location.lon && (
                <span style={{ fontSize: 13, color: '#16a34a' }}>
                  📍 Location captured
                </span>
              )}
            </div>
          </div>

          {error && (
            <div style={{ 
              color: '#dc2626', 
              marginBottom: 12, 
              padding: 10, 
              background: '#fef2f2', 
              borderRadius: 6,
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ 
              color: '#16a34a', 
              marginBottom: 12, 
              padding: 10, 
              background: '#f0fdf4', 
              borderRadius: 6,
              border: '1px solid #bbf7d0'
            }}>
              {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !products.trim() || !location.lat} 
            style={{ 
              width: '100%', 
              padding: 12, 
              borderRadius: 6, 
              background: (loading || !products.trim() || !location.lat) ? '#ccc' : '#0e1c38', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 600,
              cursor: (loading || !products.trim() || !location.lat) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Submitting...' : 'Complete Onboarding'}
          </button>
        </form>
      </div>
    </>
  );
}

// =======================
