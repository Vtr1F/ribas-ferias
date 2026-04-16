CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    link_pedido INTEGER REFERENCES requests(id) ON DELETE SET NULL, -- Opcional: clica e vai ao pedido
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);