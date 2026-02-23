# Database Relations Documentation (Updated)

This document outlines the relationships between the tables in the `public` schema of the database after the Phase 1-4 implementation.

## Tables and Relationships

### Core E-Commerce
- **Orders** (`orders`)
  - Extended with `dealer_id`, `coupon_id`, `shipping_cost`, `grand_total`, `status`, etc.
- **Order Items** (`order_items`)
  - Linked to `orders`, `products`, `product_variants`.
- **Payments** (`payments`)
  - Links `orders` and `profiles` to `payment_methods`.
- **Shipping** (`shipments`)
  - Links `orders` to `shipping_carriers` and tracks movement via `shipment_tracking`.

### Customer Engagement
- **Reviews** (`reviews`)
  - Links `profiles` to `products` and `orders`. Verified purchase tracking.
- **Wishlists** (`wishlists`)
  - Multi-variant support for user favorites.
- **Returns** (`return_requests`)
  - Manages order returns and links to `orders` and `profiles`.

### Growth & Loyalty
- **Loyalty** (`user_loyalty`)
  - Points-based system linked to `profiles` and `loyalty_tiers`.
- **Referrals** (`referrals`)
  - Tracks user invitations and rewards.

### Service App
- **Service History** (`service_history`)
  - Tracks vehicle service over time.
- **Tools** (`special_tools`)
  - Inventory management for workshop equipment linked via `tool_usage`.

## Notes
- Referential integrity is strictly enforced across all modules.
- Triggers ensure `updated_at` timestamps are always accurate.
- Indexes are optimized for high-traffic tables like `orders` and `payments`.
