CREATE TABLE IF NOT EXISTS company_settings (
    id SERIAL PRIMARY KEY,
    chave TEXT UNIQUE NOT NULL, -- Ex: 'dias_padrao'
    valor TEXT NOT NULL,       -- Ex: '22'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);