import { useState } from 'react';
import Head from 'next/head';

export default function VendorOnboarding() {
  const [products, setProducts] = useState('');
  const [location, setLocation] = useState({ lat: '', lon: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        setError('Unable to retrieve your location.');
        setLoading(false);
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
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          location,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Onboarding complete! Redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = '/vendor-dashboard';
        }, 1500);
      } else {
        setError(data.error || 'Onboarding failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Vendor Onboarding - SathiBuy</title>
      </Head>
      <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px #0001' }}>
        <h2>Vendor Onboarding</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="products">What do you need? (e.g. rice, oil, vegetables)</label>
            <input
              id="products"
              type="text"
              value={products}
              onChange={e => setProducts(e.target.value)}
              placeholder="List your needs..."
              style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ccc' }}
              disabled={loading}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label>Location:</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              <button type="button" onClick={handleGetLocation} disabled={loading} style={{ padding: '8px 16px', borderRadius: 6, background: '#0e1c38', color: '#fff', border: 'none' }}>
                {loading ? 'Getting location...' : 'Get My Location'}
              </button>
              {location.lat && location.lon && (
                <span style={{ fontSize: 13, color: '#16a34a' }}>📍 {location.lat.toFixed(5)}, {location.lon.toFixed(5)}</span>
              )}
            </div>
          </div>
          {error && <div style={{ color: '#dc2626', marginBottom: 12 }}>{error}</div>}
          {success && <div style={{ color: '#16a34a', marginBottom: 12 }}>{success}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 6, background: '#0e1c38', color: '#fff', border: 'none', fontWeight: 600 }}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </>
  );
} 
// pages/api/onboarding.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { products, location } = req.body;
  if (!products || !location?.lat || !location?.lon) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Simulate saving to DB
    console.log('✅ Vendor onboarded:', { products, location });

    return res.status(200).json({ message: 'Onboarding successful.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
