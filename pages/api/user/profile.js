// pages/api/user/profile.js
// =======================
import { db, admin } from '../../../lib/firebase-admin';
import { requireAuth } from '../../../lib/middleware';

async function handler(req, res) {
  const { uid } = req.user;
  const { userType } = req.user;

  try {
    const collectionName = userType === 'vendor' ? 'vendors' : 'suppliers';
    const userRef = db.collection(collectionName).doc(uid);

    if (req.method === 'GET') {
      // Get user profile
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      
      // Remove sensitive information
      delete userData.password;
      
      res.status(200).json({
        success: true,
        user: userData
      });
    } else if (req.method === 'PUT') {
      // Update user profile
      const { name, phone, location, region, businessType, companyName } = req.body;
      
      const updateData = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (name) updateData.name = name.trim();
      if (phone) updateData.phone = phone.trim();
      
      // User type specific fields
      if (userType === 'vendor') {
        if (location !== undefined) updateData.location = location;
        if (region !== undefined) updateData.region = region;
        if (businessType !== undefined) updateData.businessType = businessType;
      } else if (userType === 'supplier') {
        if (companyName !== undefined) updateData.companyName = companyName;
      }

      await userRef.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully'
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Profile operation failed' });
  }
}

export default requireAuth(handler); 