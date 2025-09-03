-- First add email field to profiles table  
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), NEW.email);
  RETURN NEW;
END;
$$;

-- Create admin configurations table
CREATE TABLE public.admin_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_configs ENABLE ROW LEVEL SECURITY;

-- Create code snippets table for admin to manage
CREATE TABLE public.code_snippets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;

-- Create policies for code snippets
CREATE POLICY "Code snippets are viewable by everyone" 
ON public.code_snippets 
FOR SELECT 
USING (is_active = true);

-- Create policy for admin access to configs and snippets
CREATE POLICY "Only admins can manage configs" 
ON public.admin_configs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND email = 'teste@teste.com'
  )
);

CREATE POLICY "Only admins can manage code snippets" 
ON public.code_snippets 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND email = 'teste@teste.com'
  )
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_admin_configs_updated_at
BEFORE UPDATE ON public.admin_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_code_snippets_updated_at
BEFORE UPDATE ON public.code_snippets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default code snippets
INSERT INTO public.code_snippets (title, language, content, category, difficulty) VALUES
('Hello World', 'javascript', 'console.log("Hello, World!");', 'basics', 'easy'),
('Array Sum', 'javascript', 'function sum(arr) {\n  return arr.reduce((a, b) => a + b, 0);\n}', 'algorithms', 'medium'),
('Fibonacci', 'python', 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)', 'algorithms', 'hard');

-- Insert default admin configurations
INSERT INTO public.admin_configs (key, value) VALUES
('site_name', '"CodeRace"'),
('github_link', '"https://github.com/coderace"'),
('footer_text', '"Feito com ❤️ para a comunidade dev. Open source no GitHub."'),
('google_analytics', '""'),
('favicon_url', '""');