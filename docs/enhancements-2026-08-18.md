# Enhancement pass — 2026-08-18

Worked from the enhancement checklist kept in Notes ("Sannstha ko information haru
raakham…"). Each point below was audited against the codebase; this pass implements
three of them plus one latent bug found along the way.

## Implemented

### 1. Password fields can be revealed

New `src/components/admin/PasswordInput.tsx` — a drop-in replacement for
`<input type="password">` that toggles between `password` and `text` with an
eye / eye-off button inside the field. Carries `aria-label`, `aria-pressed` and
`type="button"` so it never submits its form, and forwards every input prop.

Applied to:

- `src/app/admin/login/page.tsx` — staff sign-in
- `src/components/admin/SignupForm.tsx` — account request

These were the only two password inputs in the codebase.

### 2. Loading state on every button

New `src/components/admin/SubmitButton.tsx` — uses `useFormStatus` to disable
itself, set `aria-busy`, and render a spinner (plus an optional `pendingLabel`)
while its parent form's server action is in flight.

Wired into all 11 server-action buttons that previously had none:

| Location | Buttons |
| --- | --- |
| `PropertyForm` / `AuctionForm` | Save / Create |
| Admin layout | Sign out (header + pending-approval screen) |
| Properties list | Delete |
| Auctions list | every status transition |
| Bidders | Add record, 3 deposit-status buttons, Delete |
| Staff | Approve, Reject |

Login and signup already had their own `busy` state and were left alone.

### 3. Staff can no longer see other institutions' rows

**Root cause.** The RLS `SELECT` policies on `properties`, `auctions` and
`property_images` are `is_published OR own-org` — deliberately open so the public
site can read anything published. Only the *write* policies were org-scoped, so
those read policies could not narrow the admin panel, and every admin list ran
unfiltered. An officer at one institution saw every other institution's published
properties and auctions.

**Fix.** Scoping is applied in the queries rather than in RLS — tightening the
policies would break public browsing for signed-in staff. New `getAdminScope()`
in `src/lib/admin/org.ts` returns `{ isPlatformAdmin, organizationId }` and fails
closed: a profile that cannot be resolved scopes to a sentinel UUID matching
nothing, rather than falling back to "see everything".

Applied to:

- `admin/properties` (list) and `admin/properties/[id]` (edit)
- `admin/auctions` (list), `admin/auctions/new` and `admin/auctions/[id]`
- the auction picker on `admin/bidders`
- the auction and property queries behind the dashboard KPIs and charts

`bidder_records` needed no change — its RLS policy was already correctly
org-scoped, with no public-read counterpart.

### 4. Crash on unauthenticated admin requests (found during the audit)

Three places dereferenced `user!.id` without checking for a session. Because a
page renders in parallel with its layout, `/admin/staff` threw
`TypeError: Cannot read properties of null (reading 'id')` on every logged-out
request — masked by the layout's redirect, but a real latent crash. All three now
fail closed:

| Site | Now |
| --- | --- |
| `admin/staff/page.tsx` | redirects to `/admin/login` |
| `actions.ts` → `upsertProperty` | throws "You must be signed in to save a property." |
| `org.ts` → `getAdminOrgContext` | returns no institutions |

### 5. Proxy login (view-as) from the admin panel

A platform admin can render the panel exactly as another staff member sees it,
for support and verification. **No session swap** — the admin stays
authenticated as themselves, so no service-role key is introduced. A cookie
records the target and `getAdminScope()` returns that person's institution, so
every admin query, the nav, the org badge and the dashboard charts follow.

New `src/lib/admin/view-as.ts`:

- `getRealViewer()` — the account actually signed in, **ignoring** the cookie.
  This is the security boundary.
- `getViewAsTarget()` — resolves the target, returning `null` for anyone who is
  not a real platform admin and for targets that are not approved.

Both are wrapped in React `cache()` for per-request memoisation, following the
data-access-layer pattern in Next's own `authentication.md`.

`startViewAs` / `stopViewAs` in `actions.ts` refuse non-platform-admins and
unapproved targets, set an `httpOnly` / `sameSite=lax` / `secure` cookie with a
one-hour max-age, and log both start and stop to the runtime log.

UI: a **View as** button on each approved row of `/admin/staff` (your own row
reads "You"), and a banner pinned above the header while proxying — naming the
staff member and their institution, warning that saved changes are still
recorded under the admin's own account, and offering **Exit proxy login**.

**Why a forged cookie is harmless.** The cookie is only honoured when the real
profile is a platform admin. For institution staff it is ignored outright; for a
platform admin it can only *narrow* what they already see. Setting it by hand can
never widen access. While proxying, `/admin/staff` correctly disappears, because
the effective scope is no longer platform admin — the banner is the way back.

**Writes during a proxy session** still execute with the admin's own rights. One
useful consequence: because `getAdminOrgContext()` now locks to the effective
institution, a property created while proxying is filed under the target's
institution rather than left unassigned.

**Not a full audit trail.** Start and stop are written to the runtime log only;
there is no `view_as` audit table. Worth adding if proxy login sees real use.

### Also

- `src/components/site/Header.tsx` now resolves the session and shows
  **Dashboard** instead of **Staff sign in** when signed in (checklist item
  "Login is showing even when logged in"). Added the `nav.dashboard` key to both
  the English and Nepali dictionaries.

## Verification

- `tsc --noEmit` clean; `next build` succeeds.
- Org scoping checked against the live API: unscoped returns 9 auctions across 4
  institutions, scoped to one institution returns exactly its 2, and the
  fail-closed sentinel returns `[]`.
- All public routes return 200; all 7 admin routes return 307 to login with
  **zero** server errors (previously `/admin/staff` logged a `TypeError` on every
  request).
- The show/hide password toggle was driven in a real browser on both forms: the
  field flips to plain text, the typed value survives, the label swaps, and the
  form does not submit.
- Proxy login, negative path: with a forged `nilami_view_as` cookie and no
  session, every admin route still redirects to login, the public site is
  unaffected, and no server errors are logged.
- **Not yet verified in a browser:** the "Dashboard" header label, the button
  spinners, and the proxy-login happy path (banner, narrowed scope, exit) — all
  sit behind staff auth, and proxy login additionally needs the single platform
  admin account.

## Lint

Three errors and one warning remain, all pre-existing and untouched by this pass:
two `<a>`-instead-of-`<Link>` Cancel links in `AuctionForm` / `PropertyForm`, a
`set-state-in-effect` in `Countdown.tsx`, and an unused `soldValue` on the
dashboard.

## Still outstanding from the checklist

| # | Item |
| --- | --- |
| 1 | Province / district / municipality should be dropdowns, not free text |
| 2 | Loan reference should not be required (column is `NOT NULL`; always rendered publicly) |
| 3 | Land area in aana should accept `1-0-0-0` (ropani–aana–paisa–daam) |
| 4 | Road access needs a feet unit |
| 5 | Facing should be a dropdown |
| 6 | OpenStreetMap integration (needs lat/long columns) |
| 7 | Video for property auctions |
| 8 | Appraised value should not be required (`required` on the input, `NOT NULL` in the DB) |

Items 1, 3, 4, 5, 6 and 7 all need schema changes, not just form changes.

Already satisfied before this pass: institution contact details on the auction
detail page, and the 10% bid-security auto-fill (computed server-side in
`upsertAuction` when the amount is left blank).

## Noted, not changed

In `upsertProperty` the organisation resolves as
`profile?.organization_id ?? formData.get("organization_id")`. The fallback exists
so platform admins (who have no organisation) can pick one, but it cannot tell
"platform admin" apart from "profile read failed" — so a failed profile fetch
would trust client input for the institution. RLS still blocks the write, so it is
not exploitable today, but the two cases should be split explicitly.
