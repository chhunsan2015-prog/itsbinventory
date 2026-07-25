-- =========================================================================
--   TAX INVENTORY SYSTEM DATABASE SCHEMA & TRANSACTION LOGIC (SUPABASE / POSTGRESQL)
-- =========================================================================

-- 1. Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_kh VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('HQ', 'PROVINCIAL', 'KHAN', 'CENTRAL')),
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Items Table
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_kh VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    min_stock INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Inventory Table (Stores actual stock per location per item)
CREATE TABLE IF NOT EXISTS inventory (
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (location_id, item_id)
);

-- 4. Transactions Table (History / Audit Logs)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('STOCK_IN', 'HANDOVER', 'STOCK_OUT', 'ADJUSTMENT')),
    from_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    to_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    remark TEXT,
    recorded_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================================================
--   POSTGRESQL FUNCTION (RPC) FOR ATOMIC BRANCH HANDOVER
--   Guarantees all-or-nothing stock update within a single transaction block.
-- =========================================================================

CREATE OR REPLACE FUNCTION handle_branch_handover(
    p_from_location_id UUID,
    p_to_location_id UUID,
    p_item_id UUID,
    p_quantity INTEGER,
    p_remark TEXT,
    p_recorded_by VARCHAR
) RETURNS VOID AS $$
DECLARE
    v_hq_stock INTEGER;
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'បរិមាណផ្ទេរត្រូវតែធំជាងសូន្យ (Quantity must be greater than zero)';
    END IF;

    SELECT quantity INTO v_hq_stock
    FROM inventory
    WHERE location_id = p_from_location_id AND item_id = p_item_id
    FOR UPDATE;

    IF v_hq_stock IS NULL OR v_hq_stock < p_quantity THEN
        RAISE EXCEPTION 'ចំនួនសម្ភារៈនៅក្នុងស្តុកកណ្តាលមិនគ្រប់គ្រាន់សម្រាប់ផ្ទេរទេ (Insufficient stock at HQ)';
    END IF;

    UPDATE inventory
    SET quantity = quantity - p_quantity,
        updated_at = NOW()
    WHERE location_id = p_from_location_id AND item_id = p_item_id;

    INSERT INTO inventory (location_id, item_id, quantity, updated_at)
    VALUES (p_to_location_id, p_item_id, p_quantity, NOW())
    ON CONFLICT (location_id, item_id)
    DO UPDATE SET 
        quantity = inventory.quantity + EXCLUDED.quantity,
        updated_at = NOW();

    INSERT INTO transactions (
        type, from_location_id, to_location_id, item_id, quantity, remark, recorded_by, created_at
    ) VALUES (
        'HANDOVER', p_from_location_id, p_to_location_id, p_item_id, p_quantity, p_remark, p_recorded_by, NOW()
    );
END;
$$ LANGUAGE plpgsql;
