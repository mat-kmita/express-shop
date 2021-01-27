BEGIN;

CREATE TABLE IF NOT EXISTS products(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL CONSTRAINT price_positive CHECK (price > 0)
);

CREATE TABLE IF NOT EXISTS users(
    id SERIAL NOT NULL UNIQUE,
    username TEXT PRIMARY KEY ,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    address_street TEXT,
    address_building_number INTEGER,
    address_flat_number INTEGER,
    address_city TEXT,
    address_postal_code TEXT
);

CREATE TABLE IF NOT EXISTS orders(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id), 
    address TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders_products(
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL 
);

CREATE TABLE IF NOT EXISTS admins(
    id SERIAL NOT NULL UNIQUE,
    username TEXT PRIMARY KEY ,
    password_hash TEXT NOT NULL
);

COMMIT;