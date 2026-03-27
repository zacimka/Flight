# 🌍 ZamGo Travel - Premium Full-Stack Flight Booking Engine ✈️

This repository contains the complete, production-grade flight booking platform built with **React**, **Node.js/Express**, **MongoDB**, and **Stripe**. It integrates a robust flight search engine with real-time passenger manifest collection and automated e-ticketing.

## 🚀 Key Features

*   **Multi-Mode Search**: Support for Single-city and **Multi-city** flight itineraries.
*   **Rich Passenger manifest**: Collects identities for adults, children, and infants (on lap) with built-in validation.
*   **Ancillary Services**: Integrated selection for baggage upgrades and meal preferences.
*   **Secure Payments**: Fully integrated **Stripe Checkout** with support for simulated and live transactions.
*   **Automated Ticketing**: Generates unique **PNR Record Locators** and high-fidelity **E-Ticket PDFs** upon successful payment.
*   **Rebranded Experience**: A premium, "ZamGo Travel" inspired design that is fully responsive and focused on user conversion.

## 📂 Project Architecture

```bash
├── backend/            # Express.js API & MongoDB Logic
│   ├── models/         # User, Booking, & Markup Schemas
│   ├── controllers/    # Booking Intents, Payments, & PDF generation 
│   ├── services/       # Integration with Flight APIs & Stripe
│   └── routes/         # Protected API Endpoints
├── frontend/           # Vite + React + TailwindCSS UI
│   ├── src/            # Components, Hooks, & Page Routing
│   └── public/         # Digital Assets (Logos, Icons)
└── package.json        # Root workspace manager
```

## 🛠 Installation & Local Setup

1.  **Clone & Install**:
    ```bash
    npm run install:all
    ```

2.  **Environment Configuration**:
    Configure your `.env` files in both `/backend` and `/frontend` with your MongoDB URI, Stripe keys, and JWT secrets.

3.  **Launch the Platform**:
    ```bash
    npm run dev
    ```

## ⚙️ Management Scripts (Backend)
*   `npm run seed`: Import the global airport database into MongoDB.
*   `npm run fetch`: Fetch the latest global aviation data updates.

---
© 2026 **ZamGo Travel**. All rights reserved.
