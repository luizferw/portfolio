# Contact Worker

Standalone Cloudflare Worker for `POST /api/contact`. It accepts JSON with the
required fields `name`, `email`, `demand`, `deadline`, `budget`, and the
required `turnstileToken`. Optional fields are `company`, `phone`, `site`,
`technology`, and the empty honeypot field. Unknown fields are rejected.

## Configuration and secrets

`wrangler.toml` contains only non-secret variables: `CORS_ORIGIN`, the
`TURNSTILE_EXPECTED_HOSTNAME` (the hostname returned by Turnstile), and the
server-controlled Resend sender and recipient. Set secrets interactively:

```sh
npm install
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Create a Turnstile widget in the Cloudflare dashboard, use its site key in the
frontend, and keep its secret key only in the `TURNSTILE_SECRET_KEY` Worker
secret. Configure the widget hostname to match `TURNSTILE_EXPECTED_HOSTNAME`.
The Worker verifies the token server-side, including the `contact_form` action
and returned hostname. **Never commit Resend or Turnstile secrets, local
`.dev.vars`, or generated `.wrangler` artifacts.**

## Deploy order

1. Verify the Resend sending domain and DNS records.
2. Create the Turnstile widget and configure its hostname/site key.
3. Set `TURNSTILE_EXPECTED_HOSTNAME` and the Resend vars in `wrangler.toml`.
4. Add both Worker secrets with `wrangler secret put`.
5. Deploy and copy the complete Worker URL ending in `/api/contact` into the GitHub repository variable `PUBLIC_CONTACT_ENDPOINT`. Set the Turnstile site key in `PUBLIC_TURNSTILE_SITE_KEY`, then trigger a new GitHub Pages deployment.

```sh
npx wrangler deploy
```

For local development, override the origin and hostname as needed:

```sh
npx wrangler dev --var CORS_ORIGIN:http://localhost:4321 --var TURNSTILE_EXPECTED_HOSTNAME:localhost
```

POST and OPTIONS require an exact matching `Origin`; the browser-only endpoint
rejects missing origins. Configure a Cloudflare-managed WAF/rate-limit rule
for the `/api/contact` path (for example, limit POST requests per IP) in front
of the Worker to control abuse and Resend costs.
