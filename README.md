# SathiBuy - Bulk Purchase Platform

A Next.js-based platform for bulk purchasing, connecting street vendors with suppliers. The platform provides APIs for vendor and supplier management, product catalog, and order processing.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Firebase project created
- Firebase service account key

### 1. Environment Setup

1. Copy the environment template:
```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your Firebase credentials:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=sathibuy-1a0e2
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Test the Backend

```bash
npm test
```

## 🔧 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication (Email/Password)
4. Enable Firestore Database

### 2. Get Service Account Key

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the credentials to your `.env.local` file

### 3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Vendors collection
    match /vendors/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Suppliers collection
    match /suppliers/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.supplierId;
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.vendorId || 
         request.auth.uid == resource.data.supplierId);
    }
  }
}
```

## 📁 Project Structure

```
sathibuy-frontend/
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signin.js
│   │   │   ├── signup.js
│   │   │   └── logout.js
│   │   ├── user/
│   │   │   └── profile.js
│   │   ├── products/
│   │   │   └── index.js
│   │   └── orders/
│   │       └── index.js
│   └── index.js
├── lib/
│   ├── firebase-admin.js
│   └── middleware.js
├── utils/
│   └── firebase.js
├── .env.local
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/logout` - User logout

### User Management

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Products

- `GET /api/products` - List products
- `POST /api/products` - Create product (suppliers only)

### Orders

- `GET /api/orders` - List orders
- `POST /api/orders` - Create order (vendors only)

## 🗄️ Database Schema

### Users Collection

#### Vendors
```javascript
{
  uid: string,
  name: string,
  email: string,
  phone: string,
  userType: 'vendor',
  location: string,
  region: string,
  businessType: string,
  groupId: string,
  totalOrders: number,
  isOnboardingComplete: boolean,
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Suppliers
```javascript
{
  uid: string,
  name: string,
  email: string,
  phone: string,
  userType: 'supplier',
  companyName: string,
  verificationStatus: 'pending' | 'verified' | 'rejected',
  products: string[],
  rating: number,
  totalDeals: number,
  isVerified: boolean,
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Products Collection
```javascript
{
  name: string,
  description: string,
  category: string,
  price: number,
  minOrderQuantity: number,
  unit: string,
  supplierId: string,
  isActive: boolean,
  images: string[],
  rating: number,
  totalOrders: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Orders Collection
```javascript
{
  productId: string,
  productName: string,
  productPrice: number,
  quantity: number,
  unit: string,
  totalPrice: number,
  vendorId: string,
  supplierId: string,
  deliveryAddress: string,
  specialInstructions: string,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🔐 Security Features

- **Rate Limiting**: API endpoints are protected with rate limiting
- **Authentication**: All protected routes require valid Firebase ID tokens
- **Authorization**: Role-based access control (vendor vs supplier)
- **Input Validation**: Comprehensive validation for all inputs
- **Error Handling**: Proper error responses without exposing sensitive information

## 🧪 Testing

### Run Backend Tests

```bash
npm test
```

### Manual Testing

1. Open `http://localhost:3000`
2. Try signing up as a vendor
3. Try signing up as a supplier
4. Test login functionality
5. Test user type switching

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Set environment variables on your hosting platform

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Admin SDK Error**: Ensure your service account credentials are correct
2. **CORS Issues**: Configure CORS settings in your hosting platform
3. **Rate Limiting**: Check if you're hitting rate limits during development
4. **Authentication Issues**: Verify Firebase Authentication is enabled

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
```

## 📝 Development

### Adding New API Routes

1. Create a new file in `pages/api/`
2. Import required middleware and Firebase admin
3. Implement the handler function
4. Add proper validation and error handling

Example:
```javascript
import { requireAuth } from '../../../lib/middleware';
import { db } from '../../../lib/firebase-admin';

async function handler(req, res) {
  // Your API logic here
}

export default requireAuth(handler);
```

### Adding New Features

1. Create React components in `pages/` or `components/`
2. Add API routes in `pages/api/`
3. Update database schema if needed
4. Add tests for new functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Review the Firebase setup
3. Check the console for error messages
4. Create an issue with detailed information

## 🎯 Roadmap

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Product image upload
- [ ] Order tracking
- [ ] Payment integration
- [ ] Mobile app
- [ ] Admin dashboard
- [ ] Analytics and reporting 