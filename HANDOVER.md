# Client Handover — Zidaan Architectures Platform

For the studio's owner / office manager, and for the handover meeting.
Technical setup is in [DEPLOYMENT.md](DEPLOYMENT.md); developer notes in
[README.md](README.md).

---

## 1. What you are receiving

- **Public website** — listings catalogue, listing pages with viewing
  requests, agent profiles, Sell-your-property and Contact forms, journal,
  team, services and legal pages.
- **Client accounts** — visitors register with email or phone, request and
  cancel viewings, save listings, edit their profile and password, reset a
  forgotten password by emailed code.
- **Staff dashboard** — for admins, managers and agents (permissions below).
- **Source code**, automated tests, deployment configuration and these documents.

## 2. Who can do what

| | Admin | Manager | Agent |
|---|:-:|:-:|:-:|
| See dashboard figures | everything | everything | own listings & deals |
| Add / edit / remove listings and photos | ✓ | ✓ | — (sees own) |
| Approve / reject / complete viewings | all | all | own listings |
| Record sales & lettings | ✓ (can complete) | ✓ (can complete) | proposes; office confirms |
| Enquiries inbox | ✓ | ✓ | — |
| Create & manage staff and client accounts | all accounts | agents & clients only | — |
| Activity log | ✓ | — | — |

Clients never see the dashboard; staff accounts can't be self-registered —
an admin or manager creates them.

## 3. Everyday tasks (staff dashboard)

**Add a listing** — *Properties → Add Property*. Choose the agent responsible,
the type (apartment, shop, single floor, duplex, double floor, third floor),
upload photos (JPG / PNG / WebP, up to 5 MB each; first photo is the cover).
Tick *Feature on the home page* to show it in the home page's selected works.
Edit any time; remove individual photos with the ✕ on each.

**Take a listing down** — delete it; it goes to *Trash* and can be restored.
A listing with recorded sales can't be permanently deleted (the sales history
needs it).

**Handle viewing requests** — *Bookings*. New requests are *pending*.
Approve or reject; after the visit, *Mark completed*. The client gets an email
and an in-app notice each time. Two viewings can't be approved for the same
listing at the same time.

**Record a sale or letting** — *Transactions → Record transaction*. Pick the
listing, the client's name, amount and date. *Completed* closes the listing
(sold / rented) and counts the revenue; *Pending* records an agreed deal that
hasn't closed. If a completed deal falls through, *Cancel* it — the listing
goes back on the market and the revenue leaves the reports. Completed amounts
can't be edited (cancel and re-record instead). Agents can log deals on their
own listings; they arrive as *pending* for the office to confirm, and admins /
managers get a notification. Download a PDF invoice from each row; export
everything to Excel.

**Answer enquiries** — *Enquiries*. Contact-form messages, Sell-your-property
valuation requests and newsletter sign-ups arrive here, and every admin and
manager gets a notification. Assign to a colleague, add private notes, move
to *In progress* / *Closed*.

**Staff and clients** — *Users*. Create an account with a role; setting a new
password or deactivating someone signs them out everywhere immediately.
Deleted accounts go to trash (*Show trash* → restore). To remove an **agent who
has listings**, use *Agents → remove*, which asks who takes over their
listings and open viewings.

**Audit trail** — *Activity Log* (admins): role changes, deletions, viewing
decisions, money changes — who, what, when, from which IP.

## 4. Things you must provide or decide before launch

- [ ] **Domain names** and access to DNS (website, admin, api).
- [ ] **Hosting** — a server for the API (≈ ₹500–1,500 / month VPS) and a
      managed MySQL database with daily backups (recommended), plus free/cheap
      static hosting for the two websites. See DEPLOYMENT.md §1.
- [ ] **Email sending account** (Resend, Postmark, SES, Zoho…) with your domain
      verified — required for password-reset codes and viewing emails.
- [ ] **Your real content**: listings and photos (the demo catalogue is not
      loaded on the live site), agent names / phones / photos, office address,
      phone, emails and social links (`frontend-user/src/data/site.js`), team,
      services, journal and FAQ text (`frontend-user/src/data/`), privacy policy
      and terms reviewed by your lawyer.
- [ ] **First admin's email** (and a strong password, given to the developer securely).
- [ ] Whether you want **online payments**, **Google / Apple sign-in** or
      **email verification** — not built (section 6).

## 5. Accounts the client must own

Keep these in the studio's name, with passwords in a password manager:
domain registrar, DNS provider, server / VPS, database provider, email
provider, static hosting, the Git repository, and the first admin account.
The application's `APP_KEY` (in the server's env file) must also be stored
safely — losing it invalidates encrypted data.

## 6. Known limitations / not included

- **No online payments.** Viewings are free; sales are agreed offline and
  recorded in Transactions. A payment gateway (Razorpay, etc.) would be a
  separate project.
- **Google / Apple sign-in** buttons on the login pages are placeholders that
  say "not available yet".
- **No email verification** on registration; accounts work immediately.
  Password reset works for accounts with an email address; phone-only clients
  must contact the studio (no SMS provider is connected).
- **Site content** (journal, team, services, FAQ, careers) is edited in code,
  not through the dashboard.
- **Rescheduling** a viewing: reject/cancel and ask the client to request a new
  time (no reschedule button).
- **Account deletion** by clients themselves is not self-service. On request,
  staff delete the client from *Users* (moves to trash, restorable); to erase
  their data entirely, permanently delete from trash, which also removes their
  viewing requests and saved listings.
- The `react-router` library has two moderate advisories whose fix needs a
  major-version upgrade; they concern features this app does not use
  (navigating to user-supplied URLs, server rendering). Schedule the upgrade.
- The dashboard is a single ~790 KB JavaScript file; fine for staff on office
  connections, could be split later.
- Tested automatically against SQLite; the live database is MySQL. The SQL is
  portable and was written for MySQL, but run the acceptance checklist below
  on the real staging server before go-live.

## 7. Acceptance checklist (do this on staging, then sign off)

Public site / client
- [ ] Home, Properties (filters, Buy, Rent, category cards), a listing page, Agents and an agent profile load with your content on phone and desktop.
- [ ] Register with email; log out; log in. Register with a phone number; log in with it.
- [ ] Forgot password → code arrives by email within a minute → reset works → old sessions are signed out.
- [ ] Request a viewing; see it under *My bookings*; cancel it.
- [ ] Save a listing; it appears under *Saved*.
- [ ] Profile: change name / phone; change password (wrong current password is rejected).
- [ ] Contact form and Sell form: submit; each appears in the dashboard's Enquiries.

Staff
- [ ] Admin: create a manager and an agent; both can log in to the dashboard; a client account can't.
- [ ] Manager: cannot see admin/manager edit buttons; cannot create an admin.
- [ ] Add a listing with photos as manager; it appears on the public site; mark it featured → shows on home.
- [ ] Agent: sees only their listings and viewings; approves a viewing → client gets email.
- [ ] Two clients request the same time slot → only one can be approved.
- [ ] Agent proposes a transaction → office gets a notification → manager completes it → listing shows as sold → revenue on dashboard → PDF invoice downloads.
- [ ] Cancel that transaction → listing back to available.
- [ ] Deactivate the agent → they are logged out at their next click.
- [ ] Activity log shows the above actions.
- [ ] Backup restore tested once (DEPLOYMENT.md §7).

Signed off by: ____________________   Date: ____________
