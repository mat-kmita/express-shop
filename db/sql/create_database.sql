BEGIN;

CREATE TABLE IF NOT EXISTS categories(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT 'No description'
);

CREATE TABLE IF NOT EXISTS products(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT 'No description',
    price INTEGER NOT NULL CONSTRAINT price_positive CHECK (price > 0),
    discounted_price INTEGER CONSTRAINT discounted_price_positive CHECK (discounted_price > 0),
    quantity INTEGER NOT NULL CONSTRAINT quantity_positive CHECK (quantity > 0),
    CONSTRAINT discounted_less_than_regular CHECK (price > discounted_price),
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE NOT NULL
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
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL 
);

COMMIT;