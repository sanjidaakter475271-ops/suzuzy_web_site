# 🛒 Customer Website (Public App) - Implementation Plan

> **RoyalConsortium - কাস্টমার ওয়েবসাইট**

---

## 📊 Overview

```
Public App (Customer Website)
├── Home / Landing Page
├── Product Catalog (Browse/Search/Filter)
├── Product Detail
├── Cart & Checkout (bKash payment)
├── Order Tracking
├── Customer Account (Optional)
└── Static Pages (About, Contact, FAQ)
```

---

## 🏠 Homepage (`/`)

### Sections:
1. **Hero** - Full-screen with motorcycle imagery, animated text, CTA
2. **Featured Bikes** - Horizontal carousel, 3D card hover effects
3. **Brand Showcase** - Logo grid (Suzuki focus)
4. **Why Choose Us** - Animated counters, feature cards
5. **Featured Dealers** - Dealer spotlight cards
6. **Footer** - Newsletter, social, legal links

---

## 🏍️ Product Catalog

### `/bikes` - Product Listing

**Features:**
- Filter sidebar: price, brand, category, CC, condition, location
- Sort: price (low/high), newest, popular, rating
- Grid/List view toggle
- Infinite scroll pagination
- Active filter pills
- No results state

### `/bikes/[slug]` - Product Detail

**Sections:**
- Image gallery with zoom/lightbox
- Price display (base/sale/discount)
- Color selector (if variants)
- Add to Cart / Buy Now buttons
- Dealer info card
- Specification table
- Compatible bike models
- Similar products
- Share buttons

---

## 🛒 Cart & Checkout

### `/cart`
- Items grouped by dealer
- Quantity controls
- Price summary
- Continue shopping / Checkout buttons

### `/checkout` - Multi-step

```
Step 1: Customer Info (name, phone, email, address)
Step 2: Order Review (items, totals)
Step 3: Payment Method (bKash / COD)
Step 4: bKash Processing
```

### `/checkout/success`
- Order number
- Order summary
- Track order link

---

## 📦 Order Tracking

### `/track`
- Order ID input
- Phone verification
- Order status timeline
- Shipping info

---

## 👤 Customer Account (Optional Feature Flag)

### `/account`
- Dashboard overview
- Order history
- Profile settings
- Wishlist (if enabled)

---

## 📄 Static Pages

| Route | Content |
|-------|---------|
| `/about` | Company story, mission |
| `/contact` | Contact form, map, support |
| `/terms` | Terms and conditions |
| `/privacy` | Privacy policy |
| `/faq` | Accordion FAQ |

---

## 🔍 Navigation & Search

### Header Components:
- Logo
- Navigation (Categories mega menu)
- Search bar (instant results modal)
- Cart icon with count
- User account / Login

### Search Modal:
- Full-screen overlay
- Instant product results
- Category suggestions
- Recent searches

---

## 🛡️ Auth Flow

### `/login`
- Email/Password form
- Remember me
- Link to register
- Error handling

### `/register`
- Multi-step for dealers
- Simple form for customers

### `/forgot-password`
- Email input
- Reset token flow

---

## 📁 Folder Structure

```
src/app/
├── page.tsx                    # Homepage
├── bikes/
│   ├── page.tsx               # Listing
│   └── [slug]/page.tsx        # Detail
├── brands/
│   ├── page.tsx
│   └── [slug]/page.tsx
├── categories/[slug]/page.tsx
├── dealers/
│   ├── page.tsx               # Directory
│   └── [slug]/page.tsx        # Dealer profile
├── cart/page.tsx
├── checkout/
│   ├── page.tsx
│   ├── success/page.tsx
│   └── failed/page.tsx
├── track/
│   ├── page.tsx
│   └── [orderId]/page.tsx
├── account/
│   ├── page.tsx
│   ├── orders/page.tsx
│   └── profile/page.tsx
├── search/page.tsx
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
└── (static)/
    ├── about/page.tsx
    ├── contact/page.tsx
    ├── terms/page.tsx
    ├── privacy/page.tsx
    └── faq/page.tsx
```

---

## 🗄️ Database Tables Used

| Feature | Tables |
|---------|--------|
| Products | products, product_images, product_variants, categories |
| Cart | carts, cart_items |
| Orders | orders, order_items, sub_orders |
| Payments | payments |
| User | users, customer_addresses |
| Reviews | reviews |

---

## 🎨 Design Requirements

- **Theme:** Luxury Automotive Dark Mode
- **Typography:** Playfair Display + DM Sans
- **Colors:** Deep charcoal, Champagne Gold, Pearl White
- **Animations:** Framer Motion for scroll reveals, hovers
- **Mobile-first:** Responsive design

---

## ✅ Key Features Summary

1. **Browse Products** - Filter, sort, search
2. **Multi-Vendor Cart** - Items from different dealers
3. **bKash Payment** - Integrated checkout
4. **Order Tracking** - Real-time status
5. **Dealer Profiles** - Shop by dealer
6. **Reviews** - Customer reviews on products
