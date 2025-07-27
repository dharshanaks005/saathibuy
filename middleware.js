// Rate limiting middleware (simple implementation)
const rateLimitMap = new Map();

export function rateLimit(limit = 100, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }

    const requests = rateLimitMap.get(ip);
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= limit) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    recentRequests.push(now);
    rateLimitMap.set(ip, recentRequests);
    next();
  };
}

// Middleware to verify Firebase ID token (temporarily disabled for testing)
export async function verifyToken(req, res, next) {
  // For testing, we'll skip token verification
  next();
}

// Middleware to check if user is authenticated
export function requireAuth(handler) {
  return async (req, res) => {
    // For testing, we'll skip authentication
    return handler(req, res);
  };
}

// Middleware to validate request body
export function validateBody(requiredFields) {
  return (req, res, next) => {
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    next();
  };
}

// Middleware to check user type
export function requireUserType(allowedTypes) {
  return (req, res, next) => {
    // For testing, we'll skip user type checking
    next();
  };
} 