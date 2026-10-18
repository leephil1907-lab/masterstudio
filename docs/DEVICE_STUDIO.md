# Master Studio Device Studio

Cloud Phone and Android Emulator use one shared setup flow and one server-side adapter boundary. OBS Studio remains a separate module.

## Important status distinction

The web interface is implemented, but a real device does not exist until a managed provider or self-hosted bridge is configured. Master Studio deliberately does not simulate a phone or mark a session active based on a button click. The current backend uses an explicit HTTP adapter contract; it is not a vendor-specific integration until a compatible provider is selected/configured.

## Configure the server

1. Install dependencies with `npm install`.
2. Copy `.env.example` to your deployment environment (do not commit actual secrets).
3. Set a long random `DEVICE_API_ACCESS_KEY`.
4. For the managed-first route, set `MANAGED_DEVICE_API_URL` and `MANAGED_DEVICE_API_TOKEN` to a trusted provider adapter that implements the contract below.
5. Start with `npm run dev`; for production build with `npm run build` and start with `npm start`.
6. Confirm `GET /api/health` and `GET /api/devices/providers` before testing a real session.

## Adapter HTTP contract

The configured base URL is a trusted server-side URL. Provider tokens are sent only from the server as `Authorization: Bearer …`. Production URLs must use HTTPS.

### Create session

`POST {BASE_URL}/api/sessions`

Request:
```json
{
  "type": "cloud-phone",
  "profile": "pixel-8",
  "appTarget": "com.example.app",
  "requestedBy": "masterstudio"
}
```

`type` is `cloud-phone` or `android-emulator`; `profile` is `pixel-8`, `pixel-tablet`, or `custom`; `appTarget` may be null.

Return a JSON object with a required `sessionId` and optional `status`, `launchUrl` (HTTPS only), `deviceName`, and `expiresAt`.

### End session

`DELETE {BASE_URL}/api/sessions/{sessionId}`

Return JSON with an optional `status`. The provider must actually terminate the session before returning success.

## Provider selection

A managed app-testing sandbox such as Appetize can provide browser-based virtual-device app previews, but that is not automatically equivalent to a persistent, general-purpose cloud phone. Confirm the provider supports the desired Android session, app installation, lifecycle, usage limits, and required device controls before connecting it.

For a self-hosted path, the bridge can later target an Android-in-cloud runtime such as redroid plus a WebRTC control/streaming layer. Do not expose ADB or an emulator management port directly to the public internet.

## Security and reliability

- Keep provider credentials server-side; never use `VITE_*` variables for secrets.
- Keep the device access key private and rotate it if exposed.
- Put user authentication/authorization in front of the API before offering multi-user public access; the access key is a bootstrap gate, not per-user authorization.
- Add quotas, ownership checks, session expiry, audit logging, and billing controls before public launch.
- Only launch apps/devices you own or are authorized to operate.
- A session is shown as created only when the provider returns a valid `sessionId`; end-session success requires a successful provider response.
