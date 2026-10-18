-- Brand identity additions for the public site and control room.
-- `settings` is a key/value store, so this is safe for both fresh and existing
-- projects. Administrators can edit all branding values in Admin → Settings.

insert into public.settings (key, value)
values ('website_tagline', 'Social growth, kept in line.')
on conflict (key) do nothing;
