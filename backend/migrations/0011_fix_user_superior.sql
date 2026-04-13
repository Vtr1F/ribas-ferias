-- Fix user superior_id to match team structure
-- Design team (leader_id=2): workers 3, 4, 5
-- Development team (leader_id=7): workers 6, 8, 9
-- HR team (leader_id=11): workers 10, 12, 13

-- Update Design team workers
UPDATE users SET superior_id = 2 WHERE id IN (3, 4, 5);

-- Update Development team workers
UPDATE users SET superior_id = 7 WHERE id IN (6, 8, 9);

-- Update HR team workers
UPDATE users SET superior_id = 11 WHERE id IN (10, 12, 13);

-- Update leaders to have admin (user 1) as superior
UPDATE users SET superior_id = 1 WHERE id IN (2, 7, 11);
