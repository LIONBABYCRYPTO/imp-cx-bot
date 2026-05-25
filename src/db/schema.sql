-- imp.cx Bot Database Schema
-- PostgreSQL

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  referred_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Wallets (encrypted)
CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  public_key VARCHAR(44) NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  label VARCHAR(100) DEFAULT 'main',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Copy Trading Targets
CREATE TABLE IF NOT EXISTS copy_targets (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  target_wallet VARCHAR(44) NOT NULL,
  label VARCHAR(255),
  max_trade_size DECIMAL(20, 8) DEFAULT 0.1,
  min_trade_size DECIMAL(20, 8) DEFAULT 0.001,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, target_wallet)
);

-- Trades
CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  wallet_id INT REFERENCES wallets(id),
  trade_type VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
  input_token VARCHAR(44) NOT NULL,
  output_token VARCHAR(44) NOT NULL,
  input_amount DECIMAL(30, 18) NOT NULL,
  output_amount DECIMAL(30, 18),
  signature VARCHAR(128),
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  fee DECIMAL(20, 8),
  slippage DECIMAL(5, 2) DEFAULT 5,
  is_copy_trade BOOLEAN DEFAULT FALSE,
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Referral Rewards
CREATE TABLE IF NOT EXISTS referral_rewards (
  id SERIAL PRIMARY KEY,
  referrer_id INT REFERENCES users(id),
  referred_id INT REFERENCES users(id),
  trade_id INT REFERENCES trades(id),
  amount DECIMAL(20, 8),
  token VARCHAR(44),
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid
  created_at TIMESTAMP DEFAULT NOW()
);

-- Settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id INT PRIMARY KEY REFERENCES users(id),
  default_slippage DECIMAL(5, 2) DEFAULT 5,
  mev_protection BOOLEAN DEFAULT TRUE,
  priority_fee VARCHAR(20) DEFAULT 'auto',
  default_buy_currency VARCHAR(44) DEFAULT 'So11111111111111111111111111111111111111112',
  auto_approve BOOLEAN DEFAULT FALSE,
  max_trade_size DECIMAL(20, 8) DEFAULT 10,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fee Tiers
CREATE TABLE IF NOT EXISTS fee_tiers (
  id SERIAL PRIMARY KEY,
  min_volume DECIMAL(30, 8) DEFAULT 0,
  max_volume DECIMAL(30, 8),
  fee_percent DECIMAL(5, 2) NOT NULL,
  label VARCHAR(50)
);

-- Insert default fee tiers
INSERT INTO fee_tiers (min_volume, max_volume, fee_percent, label) VALUES
  (0, 10000, 0.5, 'Standard'),
  (10000, 100000, 0.4, 'Silver'),
  (100000, 1000000, 0.3, 'Gold'),
  (1000000, NULL, 0.2, 'Platinum')
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_created ON trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_copy_targets_user ON copy_targets(user_id);
