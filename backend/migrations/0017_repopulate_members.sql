-- Ensure JSONB members is populated for all teams
UPDATE teams
SET members = COALESCE(
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', u.id,
                'nome', u.nome,
                'email', u.email,
                'role_id', u.role_id
            )
        )
        FROM users u
        JOIN team_members tm ON u.id = tm.user_id
        WHERE tm.team_id = teams.id
    ),
    '[]'::jsonb
)
WHERE teams.members IS NULL OR jsonb_array_length(teams.members) = 0;
