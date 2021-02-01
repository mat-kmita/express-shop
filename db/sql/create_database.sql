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
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount INTEGER NOT NULL DEFAULT 0 
);

CREATE TABLE IF NOT EXISTS orders_products(
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL 
);

CREATE TABLE IF NOT EXISTS admins(
    id SERIAL NOT NULL UNIQUE,
    username TEXT PRIMARY KEY ,
    password_hash TEXT NOT NULL
);

COMMIT;