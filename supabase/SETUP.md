# Supabase setup

1. Rotate the previously exposed secret key in the Supabase dashboard.
2. Apply the schema to the linked project:

```sh
supabase db query --linked --file supabase/schema.sql
```

You can also run `supabase/schema.sql` in the Supabase SQL Editor.
3. Install and log in to the Supabase CLI:

```sh
npm install -g supabase
supabase login
supabase link --project-ref xbxlwqbkamtcskdfspnf
supabase secrets set ADMIN_PASSCODE=choose-a-private-passcode
supabase functions deploy admin-control --no-verify-jwt
```

The browser uses only the publishable key in `index.html`. Never put the secret key in this repository or in GitHub Pages.

After the schema and function are deployed, the three-dot admin button can update maintenance mode, the countdown, and announcements. Visitors receive changes through Supabase Realtime.
