# Integration credentials

## Current scope

Admins with `integrations:manage` can access integration management at `/dashboard/integrations`, including creating, listing, rotating, and revoking service credentials. Credentials are independent of user accounts. Each credential stores the explicit permission set selected at creation. The API accepts only permissions supported by an integration route; currently, that is `tracking:update`. The secret is returned only on creation or rotation; PostgreSQL stores a SHA-256 hash and a non-secret key ID.

Authenticated services can submit a wagon report to:

```http
POST /integration/tracking/wagons/{wagonNumber}/positions
Authorization: Bearer ec_int_{keyId}.{secret}
Content-Type: application/json
```

Example body:

```json
{
  "latitude": 34.261,
  "longitude": -6.5802,
  "status": "IN_TRANSIT",
  "recordedAt": "2026-10-04T15:35:06Z"
}
```

`recordedAt` is optional and represents the source's observation time; when omitted, the API stores the current time. Each accepted report is associated with the credential that submitted it. Credentials are bearer secrets: send them only over HTTPS, keep them in the external service's secret store, and rotate or revoke them if exposed.

This endpoint is a transport scaffold, not an ONCF integration. No provider polling, webhook verification, replay protection/idempotency, retry queue, expiry policy, rate limit, external wagon-ID mapping, or provider-specific payload translation is implemented. Confirm the provider contract before connecting a real source. For local disposable development databases, apply the evolving schema and permission seed using the normal `apps/api` database setup instructions; do not push schema changes to valuable data.
