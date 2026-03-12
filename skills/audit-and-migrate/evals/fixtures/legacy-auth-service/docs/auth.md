# Auth

Requests should include the `legacy_session` cookie. Admin users are identified through the
cookie payload, and the bootstrap script in `scripts/seed-legacy-auth.sh` should be used when
testing locally.

The mobile clients do not send bearer tokens yet.
