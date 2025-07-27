// pages/api/products/index.js
// =======================
import { db, admin } from '../../../lib/firebase-admin';
import { requireAuth, requireUserType } from '../../../lib/middleware';

async function handler(req, res) {
  const { uid } = req.user;
  const { userType } = req.user;

  try {
    if (req.method === 'GET') {
      // Get products (suppliers can see their own, vendors can see all)
      let productsQuery;
      
      if (userType === 'supplier') {
        // Suppliers see only their own products
        productsQuery = db.collection('products').where('supplierId', '==', uid);
      } else {
        // Vendors see all active products
        productsQuery = db.collection('products').where('isActive', '==', true);
      }

      const productsSnapshot = await productsQuery.get();
      const products = [];
      
      productsSnapshot.forEach(doc => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json({
        success: true,
        products: products
      });
    } else if (req.method === 'POST') {
      // Only suppliers can create products
      if (userType !== 'supplier') {
        return res.status(403).json({ error: 'Only suppliers can create products' });
      }

      const { name, description, category, price, minOrderQuantity, unit, images } = req.body;

      // Validation
      if (!name || !description || !category || !price || !minOrderQuantity || !unit) {
        return res.status(400).json({ error: 'All required fields must be provided' });
      }

      if (price <= 0 || minOrderQuantity <= 0) {
        return res.status(400).json({ error: 'Price and minimum order quantity must be positive' });
      }

      const productData = {
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        price: parseFloat(price),
        minOrderQuantity: parseInt(minOrderQuantity),
        unit: unit.trim(),
        supplierId: uid,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        images: images || [],
        rating: 0,
        totalOrders: 0
      };

      const productRef = await db.collection('products').add(productData);
      
      // Update supplier's products array
      await db.collection('suppliers').doc(uid).update({
        products: admin.firestore.FieldValue.arrayUnion(productRef.id)
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        productId: productRef.id
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Products operation failed' });
  }
}

export default requireAuth(handler); 