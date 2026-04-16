ALTER TABLE users ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(9);
ALTER TABLE users ADD COLUMN IF NOT EXISTS headquarter TEXT;

UPDATE users SET 
    phone_number = 
        (CASE WHEN random() < 0.5 THEN '92' ELSE '96' END) || 
        LPAD(floor(random() * 1000000)::text, 6, '0'),
    birthday = DATE '1990-01-01' + floor(random() * 10000)::int * INTERVAL '1 day',
    headquarter = 
        (CASE floor(random() * 4)::int
            WHEN 0 THEN 'Lisboa'
            WHEN 1 THEN 'Porto'
            WHEN 2 THEN 'Coimbra'
            ELSE 'Faro'
        END);
