// pages/api/orders/index.js
// =======================
import { db, admin } from '../../../lib/firebase-admin';
import { requireAuth } from '../../../lib/middleware';

async function handler(req, res) {
  const { uid } = req.user;
  const { userType } = req.user;

  try {
    if (req.method === 'GET') {
      // Get orders based on user type
      let ordersQuery;
      
      if (userType === 'vendor') {
        // Vendors see their own orders
        ordersQuery = db.collection('orders').where('vendorId', '==', uid);
      } else if (userType === 'supplier') {
        // Suppliers see orders for their products
        ordersQuery = db.collection('orders').where('supplierId', '==', uid);
      }

      const ordersSnapshot = await ordersQuery.orderBy('createdAt', 'desc').get();
      const orders = [];
      
      ordersSnapshot.forEach(doc => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json({
        success: true,
        orders: orders
      });
    } else if (req.method === 'POST') {
      // Only vendors can create orders
      if (userType !== 'vendor') {
        return res.status(403).json({ error: 'Only vendors can create orders' });
      }

      const { productId, quantity, deliveryAddress, specialInstructions } = req.body;

      // Validation
      if (!productId || !quantity || !deliveryAddress) {
        return res.status(400).json({ error: 'Product ID, quantity, and delivery address are required' });
      }

      if (quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be positive' });
      }

      // Get product details
      const productDoc = await db.collection('products').doc(productId).get();
      if (!productDoc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const productData = productDoc.data();
      
      if (!productData.isActive) {
        return res.status(400).json({ error: 'Product is not available' });
      }

      if (quantity < productData.minOrderQuantity) {
        return res.status(400).json({ 
          error: `Minimum order quantity is ${productData.minOrderQuantity} ${productData.unit}` 
        });
      }

      // Calculate total price
      const totalPrice = productData.price * quantity;

      // Create order
      const orderData = {
        productId: productId,
        productName: productData.name,
        productPrice: productData.price,
        quantity: quantity,
        unit: productData.unit,
        totalPrice: totalPrice,
        vendorId: uid,
        supplierId: productData.supplierId,
        deliveryAddress: deliveryAddress,
        specialInstructions: specialInstructions || '',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const orderRef = await db.collection('orders').add(orderData);

      // Update product total orders
      await db.collection('products').doc(productId).update({
        totalOrders: admin.firestore.FieldValue.increment(1)
      });

      // Update vendor total orders
      await db.collection('vendors').doc(uid).update({
        totalOrders: admin.firestore.FieldValue.increment(1)
      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        orderId: orderRef.id,
        order: orderData
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({ error: 'Orders operation failed' });
  }
}

export default requireAuth(handler); 