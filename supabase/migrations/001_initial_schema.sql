-- TradeXa Fretes — Initial Schema
-- Migration 001: Create freight schema and core tables

-- 1. Create schema
CREATE SCHEMA IF NOT EXISTS freight;

-- 2. Profiles (extends auth.users)
CREATE TABLE freight.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('carrier', 'shipper', 'admin')) DEFAULT 'shipper',
    avatar_url TEXT,
    document_type TEXT CHECK (document_type IN ('cpf', 'cnpj')),
    document_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION freight.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO freight.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION freight.handle_new_user();

-- 3. Routes (carrier routes)
CREATE TABLE freight.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID NOT NULL REFERENCES freight.profiles(id) ON DELETE CASCADE,
    origin_city TEXT NOT NULL,
    origin_state CHAR(2) NOT NULL,
    destination_city TEXT NOT NULL,
    destination_state CHAR(2) NOT NULL,
    distance_km DECIMAL(10,2),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Freight tables (pricing)
CREATE TABLE freight.freight_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID NOT NULL REFERENCES freight.profiles(id) ON DELETE CASCADE,
    route_id UUID REFERENCES freight.routes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_per_kg DECIMAL(10,2),
    price_per_m3 DECIMAL(10,2),
    price_per_km DECIMAL(10,2),
    min_price DECIMAL(10,2) DEFAULT 0,
    max_weight_kg DECIMAL(10,2),
    cargo_type TEXT,
    valid_from DATE,
    valid_until DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Fleet
CREATE TABLE freight.fleet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID NOT NULL REFERENCES freight.profiles(id) ON DELETE CASCADE,
    plate TEXT NOT NULL,
    model TEXT,
    year INT,
    capacity_kg DECIMAL(10,2),
    capacity_m3 DECIMAL(10,2),
    vehicle_type TEXT,
    has_gps BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_transit', 'maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Drivers
CREATE TABLE freight.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID NOT NULL REFERENCES freight.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cpf TEXT,
    cnh_number TEXT,
    cnh_expiry DATE,
    phone TEXT,
    email TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Quotations (shipper requests)
CREATE TABLE freight.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipper_id UUID NOT NULL REFERENCES freight.profiles(id) ON DELETE CASCADE,
    origin_city TEXT NOT NULL,
    origin_state CHAR(2) NOT NULL,
    destination_city TEXT NOT NULL,
    destination_state CHAR(2) NOT NULL,
    cargo_description TEXT,
    weight_kg DECIMAL(10,2),
    volume_m3 DECIMAL(10,2),
    cargo_type TEXT,
    pickup_date DATE,
    delivery_date DATE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'bidding', 'closed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Bids (carrier offers)
CREATE TABLE freight.quotation_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES freight.quotations(id) ON DELETE CASCADE,
    carrier_id UUID NOT NULL REFERENCES freight.profiles(id) ON DELETE CASCADE,
    price DECIMAL(12,2) NOT NULL,
    estimated_days INT,
    vehicle_id UUID REFERENCES freight.fleet(id),
    driver_id UUID REFERENCES freight.drivers(id),
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Orders
CREATE TABLE freight.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID REFERENCES freight.quotations(id),
    shipper_id UUID NOT NULL REFERENCES freight.profiles(id),
    carrier_id UUID NOT NULL REFERENCES freight.profiles(id),
    bid_id UUID REFERENCES freight.quotation_bids(id),
    price DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
    pickup_date DATE,
    delivery_date DATE,
    tracking_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tracking events
CREATE TABLE freight.tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES freight.orders(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('picked_up', 'departed', 'arrived', 'in_transit', 'delivered', 'delayed', 'exception')),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    description TEXT,
    photo_url TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Payments
CREATE TABLE freight.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES freight.orders(id) ON DELETE CASCADE,
    shipper_id UUID NOT NULL REFERENCES freight.profiles(id),
    carrier_id UUID NOT NULL REFERENCES freight.profiles(id),
    amount DECIMAL(12,2) NOT NULL,
    platform_fee DECIMAL(12,2),
    carrier_amount DECIMAL(12,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'refunded', 'failed')),
    payment_method TEXT CHECK (payment_method IN ('pix', 'credit_card', 'boleto')),
    stripe_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Reviews
CREATE TABLE freight.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES freight.orders(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES freight.profiles(id),
    reviewee_id UUID NOT NULL REFERENCES freight.profiles(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Documents
CREATE TABLE freight.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID NOT NULL REFERENCES freight.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES freight.orders(id) ON DELETE SET NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('cte', 'mdfe', 'ciot', 'cnh', 'rnrtc', 'other')),
    file_url TEXT NOT NULL,
    file_name TEXT,
    expiry_date DATE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Notifications
CREATE TABLE freight.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES freight.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    read BOOLEAN DEFAULT FALSE,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Settings
CREATE TABLE freight.settings (
    user_id UUID PRIMARY KEY REFERENCES freight.profiles(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_routes_carrier ON freight.routes(carrier_id);
CREATE INDEX idx_freight_tables_carrier ON freight.freight_tables(carrier_id);
CREATE INDEX idx_fleet_carrier ON freight.fleet(carrier_id);
CREATE INDEX idx_drivers_carrier ON freight.drivers(carrier_id);
CREATE INDEX idx_quotations_shipper ON freight.quotations(shipper_id);
CREATE INDEX idx_quotation_bids_carrier ON freight.quotation_bids(carrier_id);
CREATE INDEX idx_orders_shipper ON freight.orders(shipper_id);
CREATE INDEX idx_orders_carrier ON freight.orders(carrier_id);
CREATE INDEX idx_tracking_events_order ON freight.tracking_events(order_id);
CREATE INDEX idx_payments_order ON freight.payments(order_id);
CREATE INDEX idx_notifications_user ON freight.notifications(user_id);
