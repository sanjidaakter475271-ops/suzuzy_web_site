-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action character varying NOT NULL,
  module character varying NOT NULL,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.banners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying,
  image_url text NOT NULL,
  link_url text,
  position character varying,
  is_active boolean DEFAULT true,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT banners_pkey PRIMARY KEY (id)
);
CREATE TABLE public.bike_models (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  cc character varying,
  engine_type character varying,
  brand character varying DEFAULT 'Suzuki'::character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bike_models_pkey PRIMARY KEY (id)
);
CREATE TABLE public.campaign_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid,
  campaign_type character varying,
  views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campaign_analytics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cart_id uuid,
  product_id uuid,
  variant_id uuid,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id),
  CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  guest_id character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT carts_pkey PRIMARY KEY (id),
  CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  parent_id uuid,
  description text,
  icon_url text,
  image_url text,
  level integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id)
);
CREATE TABLE public.commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  sub_order_id uuid,
  dealer_id uuid,
  amount numeric NOT NULL,
  rate numeric NOT NULL,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'paid'::character varying, 'cancelled'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT commissions_pkey PRIMARY KEY (id),
  CONSTRAINT commissions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT commissions_sub_order_id_fkey FOREIGN KEY (sub_order_id) REFERENCES public.sub_orders(id),
  CONSTRAINT commissions_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id)
);
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code character varying NOT NULL UNIQUE,
  type character varying CHECK (type::text = ANY (ARRAY['percentage'::character varying, 'fixed'::character varying]::text[])),
  value numeric NOT NULL,
  min_spend numeric DEFAULT 0,
  max_discount numeric,
  starts_at timestamp with time zone NOT NULL,
  ends_at timestamp with time zone NOT NULL,
  usage_limit integer,
  used_count integer DEFAULT 0,
  dealer_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coupons_pkey PRIMARY KEY (id),
  CONSTRAINT coupons_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id)
);
CREATE TABLE public.customer_addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  name character varying NOT NULL,
  phone character varying NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city character varying,
  district character varying,
  division character varying,
  postal_code character varying,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customer_addresses_pkey PRIMARY KEY (id),
  CONSTRAINT customer_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.dealer_bank_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dealer_id uuid,
  account_type character varying CHECK (account_type::text = ANY (ARRAY['bank'::character varying, 'mobile_banking'::character varying]::text[])),
  provider_name character varying,
  account_name character varying,
  account_number character varying,
  branch_name character varying,
  routing_number character varying,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dealer_bank_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT dealer_bank_accounts_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id)
);
CREATE TABLE public.dealer_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dealer_id uuid,
  document_type character varying NOT NULL,
  document_url text NOT NULL,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying]::text[])),
  rejection_reason text,
  verified_at timestamp with time zone,
  verified_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dealer_documents_pkey PRIMARY KEY (id),
  CONSTRAINT dealer_documents_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id),
  CONSTRAINT dealer_documents_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.dealer_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dealer_id uuid,
  notification_type character varying NOT NULL,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dealer_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT dealer_notifications_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id)
);
CREATE TABLE public.dealer_payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dealer_id uuid,
  amount numeric NOT NULL,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying]::text[])),
  payout_method character varying,
  reference_id character varying,
  processed_at timestamp with time zone,
  processed_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dealer_payouts_pkey PRIMARY KEY (id),
  CONSTRAINT dealer_payouts_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id),
  CONSTRAINT dealer_payouts_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.dealer_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dealer_id uuid,
  setting_key character varying NOT NULL,
  setting_value jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dealer_settings_pkey PRIMARY KEY (id),
  CONSTRAINT dealer_settings_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id)
);
CREATE TABLE public.dealer_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dealer_id uuid,
  user_id uuid,
  dealer_role character varying CHECK (dealer_role::text = ANY (ARRAY['owner'::character varying, 'manager'::character varying, 'staff'::character varying]::text[])),
  can_manage_products boolean DEFAULT false,
  can_manage_orders boolean DEFAULT false,
  can_view_reports boolean DEFAULT false,
  can_manage_inventory boolean DEFAULT false,
  can_manage_coupons boolean DEFAULT false,
  can_manage_staff boolean DEFAULT false,
  can_view_finance boolean DEFAULT false,
  can_reply_reviews boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dealer_users_pkey PRIMARY KEY (id),
  CONSTRAINT dealer_users_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id),
  CONSTRAINT dealer_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.dealers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  email character varying NOT NULL UNIQUE,
  phone character varying NOT NULL UNIQUE,
  trade_license_no character varying,
  tin_number character varying,
  bin_number character varying,
  logo_url text,
  banner_url text,
  description text,
  address_line1 text,
  city character varying,
  district character varying,
  division character varying,
  owner_user_id uuid,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'active'::character varying, 'suspended'::character varying, 'rejected'::character varying, 'closed'::character varying]::text[])),
  current_plan_id uuid,
  subscription_status character varying DEFAULT 'active'::character varying,
  trial_ends_at timestamp with time zone,
  commission_rate numeric,
  commission_type character varying DEFAULT 'percentage'::character varying,
  max_products integer,
  max_users integer,
  max_images_per_product integer DEFAULT 5,
  total_products integer DEFAULT 0,
  total_orders integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  average_rating numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dealers_pkey PRIMARY KEY (id),
  CONSTRAINT dealers_current_plan_id_fkey FOREIGN KEY (current_plan_id) REFERENCES public.plans(id),
  CONSTRAINT dealers_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  subject character varying,
  body_html text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT email_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category character varying,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT faqs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.feature_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  is_enabled boolean DEFAULT false,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT feature_flags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  variant_id uuid,
  change_quantity integer NOT NULL,
  type character varying NOT NULL,
  description text,
  reference_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inventory_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT inventory_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.notification_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  title_template text,
  body_template text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notification_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title character varying NOT NULL,
  message text NOT NULL,
  type character varying,
  is_read boolean DEFAULT false,
  link_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  sub_order_id uuid,
  product_id uuid,
  variant_id uuid,
  dealer_id uuid,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_sub_order_id_fkey FOREIGN KEY (sub_order_id) REFERENCES public.sub_orders(id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id),
  CONSTRAINT order_items_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id)
);
CREATE TABLE public.order_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  sub_order_id uuid,
  note text NOT NULL,
  is_internal boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_notes_pkey PRIMARY KEY (id),
  CONSTRAINT order_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.order_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  sub_order_id uuid,
  status character varying NOT NULL,
  comment text,
  changed_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number character varying NOT NULL UNIQUE,
  user_id uuid,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'confirmed'::character varying, 'processing'::character varying, 'shipped'::character varying, 'delivered'::character varying, 'cancelled'::character varying]::text[])),
  shipping_address_id uuid,
  shipping_name character varying,
  shipping_phone character varying,
  shipping_address text,
  subtotal numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  shipping_cost numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  grand_total numeric NOT NULL,
  payment_status character varying DEFAULT 'pending'::character varying CHECK (payment_status::text = ANY (ARRAY['pending'::character varying, 'paid'::character varying, 'partial'::character varying, 'failed'::character varying, 'refunded'::character varying]::text[])),
  payment_method character varying,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES public.customer_addresses(id)
);
CREATE TABLE public.otp_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  phone_or_email character varying NOT NULL,
  otp_code character varying NOT NULL,
  purpose character varying NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  is_used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT otp_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT otp_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.pages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  content text NOT NULL,
  meta_title character varying,
  meta_description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.password_resets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  token character varying NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT password_resets_pkey PRIMARY KEY (id),
  CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  amount numeric NOT NULL,
  method character varying NOT NULL,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying]::text[])),
  gateway_transaction_id character varying,
  gateway_response jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.payout_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payout_id uuid,
  sub_order_id uuid,
  amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payout_items_pkey PRIMARY KEY (id),
  CONSTRAINT payout_items_sub_order_id_fkey FOREIGN KEY (sub_order_id) REFERENCES public.sub_orders(id),
  CONSTRAINT payout_items_payout_id_fkey FOREIGN KEY (payout_id) REFERENCES public.dealer_payouts(id)
);
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  module character varying NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT permissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.plan_features (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id uuid,
  feature_name character varying NOT NULL,
  feature_value text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT plan_features_pkey PRIMARY KEY (id),
  CONSTRAINT plan_features_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);
CREATE TABLE public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  price numeric NOT NULL,
  max_products integer,
  max_users integer,
  commission_rate numeric NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_attributes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  type character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_attributes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_bike_models (
  product_id uuid NOT NULL,
  bike_model_id uuid NOT NULL,
  CONSTRAINT product_bike_models_pkey PRIMARY KEY (product_id, bike_model_id),
  CONSTRAINT product_bike_models_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_bike_models_bike_model_id_fkey FOREIGN KEY (bike_model_id) REFERENCES public.bike_models(id)
);
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  sku character varying UNIQUE,
  price numeric,
  stock_quantity integer DEFAULT 0,
  attributes jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dealer_id uuid,
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  sku character varying UNIQUE,
  part_number character varying,
  category_id uuid,
  sub_category_id uuid,
  brand character varying,
  short_description text,
  description text,
  specifications jsonb,
  base_price numeric NOT NULL,
  sale_price numeric,
  cost_price numeric,
  discount_type character varying DEFAULT 'none'::character varying CHECK (discount_type::text = ANY (ARRAY['percentage'::character varying, 'fixed'::character varying, 'none'::character varying]::text[])),
  stock_quantity integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  stock_status character varying DEFAULT 'in_stock'::character varying CHECK (stock_status::text = ANY (ARRAY['in_stock'::character varying, 'out_of_stock'::character varying, 'pre_order'::character varying]::text[])),
  weight numeric,
  length numeric,
  width numeric,
  height numeric,
  is_free_shipping boolean DEFAULT false,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['draft'::character varying, 'pending'::character varying, 'active'::character varying, 'rejected'::character varying, 'blocked'::character varying]::text[])),
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  approved_by uuid,
  rejection_reason text,
  is_featured boolean DEFAULT false,
  is_new_arrival boolean DEFAULT true,
  is_best_seller boolean DEFAULT false,
  is_genuine boolean DEFAULT true,
  total_sold integer DEFAULT 0,
  total_views integer DEFAULT 0,
  average_rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT products_sub_category_id_fkey FOREIGN KEY (sub_category_id) REFERENCES public.categories(id),
  CONSTRAINT products_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email character varying DEFAULT ''::character varying UNIQUE,
  phone character varying UNIQUE,
  first_name character varying,
  last_name character varying,
  role_id uuid,
  dealer_id uuid,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying, 'pending'::character varying]::text[])),
  email_verified boolean DEFAULT false,
  mfa_enabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  full_name text,
  role text,
  onboarding_completed boolean DEFAULT false,
  temp_password text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);
CREATE TABLE public.promotions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  discount_type character varying,
  discount_value numeric,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT promotions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  device_token text NOT NULL,
  device_type character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.refunds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  sub_order_id uuid,
  payment_id uuid,
  amount numeric NOT NULL,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'processed'::character varying, 'rejected'::character varying]::text[])),
  type character varying,
  reason text,
  processed_at timestamp with time zone,
  processed_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT refunds_pkey PRIMARY KEY (id),
  CONSTRAINT refunds_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT refunds_sub_order_id_fkey FOREIGN KEY (sub_order_id) REFERENCES public.sub_orders(id),
  CONSTRAINT refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id),
  CONSTRAINT refunds_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.review_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  review_id uuid,
  user_id uuid,
  reply text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT review_replies_pkey PRIMARY KEY (id),
  CONSTRAINT review_replies_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id),
  CONSTRAINT review_replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  user_id uuid,
  order_id uuid,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying]::text[])),
  is_verified_purchase boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.role_permissions (
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id),
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id)
);
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  display_name character varying NOT NULL,
  display_name_bn character varying,
  level integer NOT NULL,
  role_type character varying CHECK (role_type::text = ANY (ARRAY['system'::character varying, 'dealer'::character varying, 'customer'::character varying]::text[])),
  is_system_role boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key character varying NOT NULL UNIQUE,
  value jsonb,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.shipping_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  zone_id uuid,
  name character varying NOT NULL,
  min_weight numeric,
  max_weight numeric,
  min_amount numeric,
  max_amount numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shipping_methods_pkey PRIMARY KEY (id),
  CONSTRAINT shipping_methods_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.shipping_zones(id)
);
CREATE TABLE public.shipping_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  method_id uuid,
  rate numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shipping_rates_pkey PRIMARY KEY (id),
  CONSTRAINT shipping_rates_method_id_fkey FOREIGN KEY (method_id) REFERENCES public.shipping_methods(id)
);
CREATE TABLE public.shipping_zones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shipping_zones_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sms_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  body_text text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sms_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sub_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  dealer_id uuid,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'confirmed'::character varying, 'processing'::character varying, 'shipped'::character varying, 'delivered'::character varying, 'cancelled'::character varying]::text[])),
  subtotal numeric NOT NULL,
  commission_amount numeric NOT NULL,
  dealer_amount numeric NOT NULL,
  shipping_cost numeric DEFAULT 0,
  tracking_number character varying,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sub_orders_pkey PRIMARY KEY (id),
  CONSTRAINT sub_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT sub_orders_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id)
);
CREATE TABLE public.subscription_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscription_id uuid,
  dealer_id uuid,
  amount numeric NOT NULL,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying]::text[])),
  billing_date timestamp with time zone NOT NULL,
  paid_at timestamp with time zone,
  transaction_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscription_invoices_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_invoices_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id),
  CONSTRAINT subscription_invoices_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id),
  CONSTRAINT subscription_invoices_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dealer_id uuid,
  plan_id uuid,
  status character varying DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'expired'::character varying, 'cancelled'::character varying, 'past_due'::character varying]::text[])),
  billing_cycle character varying CHECK (billing_cycle::text = ANY (ARRAY['monthly'::character varying, 'yearly'::character varying]::text[])),
  starts_at timestamp with time zone NOT NULL,
  ends_at timestamp with time zone NOT NULL,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id),
  CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);
CREATE TABLE public.support_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  dealer_id uuid,
  subject character varying NOT NULL,
  status character varying DEFAULT 'open'::character varying CHECK (status::text = ANY (ARRAY['open'::character varying, 'in_progress'::character varying, 'resolved'::character varying, 'closed'::character varying]::text[])),
  priority character varying DEFAULT 'medium'::character varying CHECK (priority::text = ANY (ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'urgent'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT support_tickets_pkey PRIMARY KEY (id),
  CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT support_tickets_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id)
);
CREATE TABLE public.ticket_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid,
  file_url text NOT NULL,
  file_type character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ticket_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT ticket_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.ticket_messages(id)
);
CREATE TABLE public.ticket_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid,
  user_id uuid,
  message text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ticket_messages_pkey PRIMARY KEY (id),
  CONSTRAINT ticket_messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id),
  CONSTRAINT ticket_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type character varying NOT NULL,
  amount numeric NOT NULL,
  status character varying DEFAULT 'completed'::character varying,
  reference_type character varying,
  reference_id uuid,
  dealer_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  token text NOT NULL UNIQUE,
  ip_address character varying,
  user_agent text,
  last_active timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.wishlists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  product_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wishlists_pkey PRIMARY KEY (id),
  CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);