-- Create admin user in auth.users if not exists
DO $$
BEGIN
  -- Check if admin user already exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'teste@teste.com'
  ) THEN
    -- Insert admin user (password will need to be set manually)
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      is_super_admin
    ) VALUES (
      gen_random_uuid(),
      'teste@teste.com',
      crypt('teste123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"display_name": "Admin"}'::jsonb,
      false
    );
  END IF;
END $$;