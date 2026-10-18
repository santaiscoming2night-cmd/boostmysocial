-- Replace only the old bundled tagline. Admin-created taglines are untouched.
update public.settings
set value = 'Social growth, made louder.'
where key = 'website_tagline'
  and value = 'Social growth, kept in line.';
