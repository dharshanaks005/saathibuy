// pages/api/auth/logout.js
// =======================
import { requireAuth } from '../../../lib/middleware';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing the token. However, we can log the logout event.
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}

export default requireAuth(handler); 