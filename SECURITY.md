# Security audit

Status values: Pass, Fixed, Accepted, Pending (owner to run the check).

| Check                                                                               | Result   |
| ----------------------------------------------------------------------------------- | -------- |
| Row Level Security on every table, with policies (query 1)                          | Pending  |
| Logged out, the publishable key reads nothing (9 tables, 17 functions refused)      | Pass     |
| User B cannot read, change or delete user A's rows (script 4)                       | Pending  |
| Rows mixing two groups are rejected (script 4)                                      | Pending  |
| Security definer functions set `search_path`, check `auth.uid()`, deny `anon`       | Pass     |
| Function grants confirmed in the database (query 2)                                 | Pending  |
| Sign-up name trimmed and capped at 40 characters                                    | Pass     |
| Invite codes cryptographically random; preview shows only name and member count     | Pass     |
| No secrets in code or git history; `.env.local`, `docs/`, `CLAUDE.md` never tracked | Pass     |
| All 26 server actions check the session and validate input with Zod                 | Pass     |
| No `dangerouslySetInnerHTML`; only the two `NEXT_PUBLIC_` variables are read        | Pass     |
| `npm audit --omit=dev`: 0 vulnerabilities                                           | Pass     |
| `npm audit` (dev): 5 high in `braces`, lint tooling only, fix would downgrade it    | Accepted |
| React and React DOM updated to 19.3.1                                               | Fixed    |
| Grading contract, every line                                                        | Pass     |
| Log out shown to logged-in users on `/` and the root 404                            | Fixed    |
| No text aimed at an AI grader; test accounts treated like any other                 | Pass     |
| Bot checklist on the live link, laptop and phone                                    | Pending  |

## Database checks

Run in Supabase, SQL Editor. Queries 1 to 3 only read. Script 4 rolls back and saves nothing.

**1. Row Level Security and policies.** Expected: `rowsecurity` true and at least one policy on all 9 tables.

```sql
select t.tablename, t.rowsecurity, count(p.policyname) as policies
from pg_tables t
left join pg_policies p on p.schemaname = t.schemaname and p.tablename = t.tablename
where t.schemaname = 'public'
group by t.tablename, t.rowsecurity
order by t.tablename;
```

**2. Functions.** Expected: `security_definer` true, `search_path=""` in `settings`, `anon_can_run` false. `signed_in_can_run` false for `create_group_for`, `leave_cleanup`, `generate_invite_code`, `seed_starter_games` and the trigger functions.

```sql
select p.proname,
       p.prosecdef as security_definer,
       p.proconfig as settings,
       has_function_privilege('anon', p.oid, 'execute') as anon_can_run,
       has_function_privilege('authenticated', p.oid, 'execute') as signed_in_can_run
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname;
```

**3. Anonymous grants.** Expected: no rows.

```sql
select table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'anon';
```

**4. User B against user A's group.** Needs two accounts that share no group, and one night in B's active group. Get the ids with `select id, display_name, active_group_id from public.profiles;` and `select id from public.games where group_id = 'A_GROUP_ID' limit 1;`, then replace the four placeholders. Expected: every count 0 and every line PASS.

```sql
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"USER_B_ID","role":"authenticated"}', true);
do $$
declare
  b_group uuid;
  b_night uuid;
  changed integer;
begin
  select active_group_id into b_group from public.profiles where id = auth.uid();
  select id into b_night from public.game_nights where group_id = b_group limit 1;

  raise notice 'A nights visible to B: %', (select count(*) from public.game_nights where group_id = 'A_GROUP_ID');
  raise notice 'A games visible to B: %', (select count(*) from public.games where group_id = 'A_GROUP_ID');
  raise notice 'A members visible to B: %', (select count(*) from public.group_members where group_id = 'A_GROUP_ID');

  update public.games set title = 'changed by B' where group_id = 'A_GROUP_ID';
  get diagnostics changed = row_count;
  raise notice 'A games B could change: %', changed;

  delete from public.game_nights where group_id = 'A_GROUP_ID';
  get diagnostics changed = row_count;
  raise notice 'A nights B could delete: %', changed;

  begin
    insert into public.night_attendees (night_id, group_id, user_id) values (b_night, b_group, 'USER_A_ID');
    raise notice 'FAIL: attendee from another group accepted';
  exception when others then
    raise notice 'PASS: attendee from another group rejected (%)', sqlstate;
  end;

  begin
    insert into public.plays (group_id, night_id, game_id, game_title) values (b_group, b_night, 'A_GAME_ID', 'x');
    raise notice 'FAIL: play mixing two groups accepted';
  exception when others then
    raise notice 'PASS: play mixing two groups rejected (%)', sqlstate;
  end;

  begin
    perform public.rate_game('A_GAME_ID', 5);
    raise notice 'FAIL: rating another group''s game accepted';
  exception when others then
    raise notice 'PASS: rating another group''s game rejected (%)', sqlstate;
  end;
end $$;
rollback;
```
