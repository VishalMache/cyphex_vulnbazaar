CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(128) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'customer',
  bio TEXT DEFAULT ''
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total_cents INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

-- Password for both seed accounts is "Password123!" (bcrypt hash below), so the
-- demo has a working login without anyone needing to register first.
INSERT INTO users (username, password_hash, email, role, bio) VALUES
  ('admin', '$2a$10$SIzYywBsh1anrfjIqjmzyutXLwDDTO1yZArQdQMBWub2HMLsLfRFK', 'admin@vulnbazaar.test', 'admin', 'Store administrator.'),
  ('alice', '$2a$10$SIzYywBsh1anrfjIqjmzyutXLwDDTO1yZArQdQMBWub2HMLsLfRFK', 'alice@vulnbazaar.test', 'customer', 'Just here for the deals.'),
  ('bob',   '$2a$10$SIzYywBsh1anrfjIqjmzyutXLwDDTO1yZArQdQMBWub2HMLsLfRFK', 'bob@vulnbazaar.test', 'customer', 'Coffee enthusiast.');

INSERT INTO products (name, price, description) VALUES
  ('Mechanical Keyboard', 89.99, 'Hot-swappable switches, RGB backlight.'),
  ('Standing Desk', 349.00, 'Electric height adjustment, 120cm top.'),
  ('Noise-Cancelling Headphones', 199.50, '30-hour battery, USB-C fast charge.'),
  ('Ultrawide Monitor', 429.00, '34" curved, 144Hz.'),
  ('Espresso Machine', 259.00, '15-bar pump, built-in grinder.');

INSERT INTO orders (user_id, total_cents, status) VALUES
  (2, 8999, 'paid'),
  (3, 34900, 'pending'),
  (2, 19950, 'shipped');
