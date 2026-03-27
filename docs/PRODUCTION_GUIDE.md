# 🛫 Travelopro Flight Booking Platform

A **production-ready flight booking system** built with React.js, Node.js, Express, MongoDB, and Stripe integration.

---

## 📋 Features

✅ **User Authentication** - JWT-based auth with role-based access control  
✅ **Flight Search** - Travelopro API integration with dynamic markup pricing  
✅ **Payment Processing** - Stripe payment intents + webhooks  
✅ **Booking Management** - Full booking lifecycle with status tracking  
✅ **Contact System** - Customer inquiry forms with admin notifications  
✅ **Email Alerts** - PDF tickets, booking confirmations, contact notifications  
✅ **Admin Dashboard** - Manage markups, view revenue, process refunds  
✅ **Security** - Bcrypt passwords, JWT tokens, rate limiting, helmet headers

---

## 🛠️ Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| **Frontend**   | React 18, Vite, TailwindCSS, Axios      |
| **Backend**    | Node.js, Express, MongoDB, Mongoose     |
| **Auth**       | JWT, Bcrypt, Role-based middleware      |
| **Payments**   | Stripe API, PaymentIntents, Webhooks    |
| **Email**      | Nodemailer, PDFKit                      |
| **Deployment** | Docker-ready (optional), Render, Vercel |

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- Stripe account
- SendGrid/Email provider
- Travelopro API key

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Fill in environment variables (see .env.example)
# Edit .env with your keys:
# - MONGO_URI
# - JWT_SECRET
# - STRIPE_SECRET_KEY
# - EMAIL credentials
# - TRAVELOPRO_API_KEY
# - ADMIN_EMAIL

# Run dev server
npm run dev
```

**Backend runs on:** `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

**Frontend runs on:** `http://localhost:3000`

---

## 📚 API Reference

### Auth Endpoints

**POST `/api/auth/register`**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password"
}
```

**POST `/api/auth/login`**

```json
{
  "email": "john@example.com",
  "password": "secure_password"
}
```

Returns: `{ user, token }`

### Flight Search

**POST `/api/flights/search`**

```json
{
  "origin": "NYC",
  "destination": "LAX",
  "date": "2026-04-01",
  "passengers": 2
}
```

### Bookings

**POST `/api/bookings`** (Protected)

```json
{
  "flightData": {
    /* flight object */
  },
  "basePrice": 150.0,
  "markup": 25.0
}
```

**GET `/api/bookings`** (Protected) - User's bookings

### Contact

**POST `/api/contact`** (Public)

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "message": "Inquiry about flights..."
}
```

**GET `/api/contact`** (Admin only) - View all contact messages

**PATCH `/api/contact/:id/read`** (Admin only) - Mark message as read

### Admin Routes

**POST `/api/admin/markup`** (Admin only)

```json
{
  "type": "percentage",
  "value": 15
}
```

**GET `/api/admin/bookings`** (Admin only) - All bookings with revenue tracking

**GET `/api/admin/revenue`** (Admin only) - Revenue summary

**POST `/api/admin/bookings/:id/refund`** (Admin only) - Process refund

### Webhooks

**POST `/api/webhooks/stripe`** - Stripe payment confirmation webhook

---

## 🔐 Security Features

### Authentication & Authorization

- **JWT tokens** with 7-day expiration
- **Bcrypt password** hashing (10 salt rounds)
- **Role-based access control** (user/admin)
- Protected routes with `protect` and `authorizeAdmin` middleware

### Input Validation

- Required field checks
- Email format validation
- Type coercion and sanitization

### Network Security

- **HTTPS recommended** (use helmet in production)
- **CORS** enabled for frontend
- **Rate limiting** (120 requests per 15 minutes)
- **Input size limits** (10MB JSON)

### Secrets Management

- All sensitive data in `.env` (never commit)
- Environment-based configuration
- Stripe webhook signature verification

---

## 📊 Database Schema

### Users

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "user" | "admin",
  createdAt, updatedAt
}
```

### Bookings

```javascript
{
  userId: ObjectId,
  flightData: Object,
  basePrice: Number,
  markup: Number,
  finalPrice: Number,
  status: "pending" | "paid" | "cancelled" | "refunded",
  paymentIntentId: String,
  createdAt, updatedAt
}
```

### Contacts

```javascript
{
  name: String,
  email: String,
  message: String,
  status: "new" | "read" | "replied",
  createdAt, updatedAt
}
```

### Markups

```javascript
{
  type: "fixed" | "percentage",
  value: Number,
  createdAt, updatedAt
}
```

---

## 🔄 User Flow

1. **Register/Login** → Get JWT token, saved in localStorage
2. **Search Flights** → Frontend calls `/api/flights/search` with criteria
3. **Select Flight** → Navigate to booking page with selected flight
4. **Create Payment Intent** → Backend generates Stripe PaymentIntent
5. **Payment** → Stripe collects payment from frontend
6. **Webhook Confirmation** → Stripe notifies backend of success
7. **Booking Created** → PDF ticket sent via email
8. **Dashboard** → User views bookings and history
9. **Contact Form** → User sends inquiry, admin gets email notification
10. **Admin Panel** → Admins manage markup, revenue, refunds

---

## 📧 Email Templates

### Booking Confirmation

- Passenger details
- Flight info (airline, times, route)
- Price breakdown
- PDF ticket attachment

### Contact Notification (to admin)

- Sender name & email
- Full message content
- Submission timestamp

---

## 🧪 Testing API

### Using cURL

**Register:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Search Flights (no auth required):**

```bash
curl -X POST http://localhost:5000/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "NYC",
    "destination": "LAX",
    "date": "2026-04-01",
    "passengers": 1
  }'
```

### Using Postman

- Import the provided Postman collection
- Set `{{token}}` variable from login response
- Test each endpoint with sample payloads

---

## 🚢 Deployment

### Backend (Render, Railway, AWS)

1. Push code to GitHub
2. Connect repository to Render/AWS
3. Set environment variables in platform
4. Deploy (auto-restart on push)

### Frontend (Vercel, Netlify)

1. Push code to GitHub
2. Connect to Vercel/Netlify
3. Set build command: `npm run build`
4. Set start command: None (static)

### Database (MongoDB Atlas)

1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Add to `MONGO_URI` in backend `.env`

---

## 📝 Environment Variables

See `.env.example` for complete list:

```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/travelopro
JWT_SECRET=your-secure-randomstring-min32chars
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG...
ADMIN_EMAIL=admin@travelopro.com
TRAVELOPRO_API_KEY=YOUR_API_KEY
NODE_ENV=production
```

---

## ⚠️ Important Security Notes

1. **Never commit `.env`** file to git
2. **Rotate JWT_SECRET** regularly in production
3. **Enable 2FA** on admin accounts
4. **Use HTTPS** only in production
5. **Monitor rate limits** and adjust if needed
6. **Log all admin actions** for audit trails
7. **Validate all Stripe webhooks** with signature
8. **Use environment-specific Stripe keys** (test in dev, live in prod)
9. **Hash passwords** before storing (handled by bcrypt middleware)
10. **Expire sessions** and refresh tokens periodically

---

## 🐛 Troubleshooting

### MongoDB Connection Error

- Check `MONGO_URI` in `.env`
- Ensure MongoDB service is running locally or Atlas cluster is accessible

### Stripe Webhook Failing

- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check endpoint in Stripe dashboard points to `/api/webhooks/stripe`
- Ensure raw body parser is enabled in Express

### Email Not Sending

- Check `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`
- For SendGrid: use "apikey" as username, API key as password
- Check admin spam folder

### CORS Errors

- Frontend must be allowed in backend CORS config
- Check `ALLOWED_ORIGINS` environment variable

---

## 📞 Support

For issues:

1. Check `.env` variables are set
2. Verify all dependencies installed (`npm install`)
3. Check server logs for error messages
4. Review API response format
5. Test with Postman before debugging frontend

---

## 📄 License

MIT

---

**Built with ❤️ for seamless flight bookings**
