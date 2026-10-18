#!/usr/bin/env node
/**
 * Generates SQL that imports the users from the old MySQL dump
 * (legacy/dlititci_boostmysocial2.sql) into Supabase Auth + profiles.
 *
 * Supabase Auth verifies bcrypt hashes and the old panel already stored them,
 * so existing passwords keep working.
 *
 * Usage:  node scripts/import-legacy-users.mjs
 * Output: scripts/output/legacy-users.sql   (contains password hashes — do not commit)
 *
 * Run the generated file in the Supabase SQL editor AFTER 0001–0005.
 */
import fs from 'node:fs';
import path from 'node:path';

const DUMP = 'legacy/dlititci_boostmysocial2.sql';
const OUT = 'scripts/output/legacy-users.sql';
const ESCAPES = { n: '\n', r: '\r', t: '\t', 0: '\0', Z: '\x1a', b: '\b', '\\': '\\', "'": "'", '"': '"' };

/** Minimal parser for MySQL extended INSERTs (handles escapes, quoted commas). */
function rows(table) {
  const dump = fs.readFileSync(DUMP, 'utf8');
  const match = dump.match(new RegExp('INSERT INTO `' + table + '` \\([^)]*\\) VALUES\\s*(.*?);\\s*\\n', 's'));
  if (!match) return [];
  const body = match[1];
  const out = [];
  let row = null;
  let field = '';
  let inString = false;
  let escaped = false;
  let hasField = false;
  let quoted = false;

  for (const char of body) {
    if (inString) {
      if (escaped) { field += ESCAPES[char] ?? char; escaped = false; }
      else if (char === '\\') escaped = true;
      else if (char === "'") inString = false;
      else field += char;
    } else if (char === "'") { inString = true; hasField = true; quoted = true; }
    else if (char === '(') { row = []; field = ''; hasField = false; quoted = false; }
    else if (char === ',') {
      if (row) {
        row.push(hasField ? (quoted ? field : field.toUpperCase() === 'NULL' ? null : field) : null);
        field = ''; hasField = false; quoted = false;
      }
    }
    else if (char === ')') {
      if (row) {
        row.push(hasField ? (quoted ? field : field.toUpperCase() === 'NULL' ? null : field) : null);
        out.push(row); row = null; field = ''; hasField = false; quoted = false;
      }
    } else if (!/\s/.test(char)) { field += char; hasField = true; }
  }
  return out;
}

const q = (value) => (value === null || value === undefined ? 'null' : `'${String(value).replace(/'/g, "''")}'`);
const n = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

// general_users columns:
// 0 id, 1 ids, 2 role, 3 login_type, 4 first_name, 5 last_name, 6 email,
// 7 password, 8 timezone, 9 more_information, 10 settings, 11 desc, 12 balance,
// 13 custom_rate, 14 api_key, 15 spent, 16 activation_key, 17 reset_key,
// 18 history_ip, 19 status, 20 changed, 21 created
const users = rows('general_users');
if (users.length === 0) {
  console.error('No users found in', DUMP);
  process.exit(1);
}

const lines = [
  '-- Imported from the old MySQL panel.',
  '-- Passwords are bcrypt hashes produced by the old application and remain valid.',
  '-- Run once, after the main migrations.',
  'do $$',
  'declare',
  '  v_id uuid;',
  'begin',
];

for (const user of users) {
  const role = user[2] === 'admin' ? 'admin' : 'user';
  const firstName = user[4] || '';
  const lastName = user[5] || '';
  const email = user[6];
  const password = user[7] || null;
  const timezone = user[8] || 'UTC';
  const balance = n(user[12]);
  const apiKey = user[14] || null;
  const spent = n(user[15]);
  const status = Number(user[19]) === 1 ? 1 : 0;

  if (!email) continue;

  lines.push('', `  -- ${email} (${role})`);
  lines.push(`  select id into v_id from auth.users where lower(email) = lower(${q(email)}) limit 1;`);
  lines.push('  if v_id is null then');
  lines.push('    v_id := gen_random_uuid();');
  lines.push('    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,');
  lines.push('      raw_app_meta_data, raw_user_meta_data, created_at, updated_at)');
  lines.push('    values (');
  lines.push("      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',");
  lines.push(`      ${q(email)}, ${q(password)}, now(),`);
  lines.push(`      '{"provider":"email","providers":["email"]}'::jsonb,`);
  lines.push(`      jsonb_build_object('first_name', ${q(firstName)}, 'last_name', ${q(lastName)}, 'timezone', ${q(timezone)}),`);
  lines.push('      now(), now()');
  lines.push('    );');
  lines.push('    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)');
  lines.push('    values (gen_random_uuid(), v_id, v_id::text,');
  lines.push(`      jsonb_build_object('sub', v_id::text, 'email', ${q(email)}, 'email_verified', true),`);
  lines.push("      'email', now(), now(), now());");
  lines.push('  end if;');

  const set = [
    `role = ${q(role)}`,
    `first_name = ${q(firstName)}`,
    `last_name = ${q(lastName)}`,
    `timezone = ${q(timezone)}`,
    `status = ${status}`,
    `balance = ${balance}`,
    `spent = ${spent}`,
    `email = ${q(email)}`,
  ];
  if (apiKey) set.push(`api_key = ${q(apiKey)}`);
  lines.push(`  update public.profiles set ${set.join(', ')} where id = v_id;`);
}

lines.push('end $$;', '');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, lines.join('\n'));
console.log(`Wrote ${OUT} for ${users.length} legacy users.`);
console.log('Run it in the Supabase SQL editor, then delete the file.');
