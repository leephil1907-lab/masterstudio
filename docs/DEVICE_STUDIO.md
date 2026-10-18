# Master Studio Device Studio

## Managed provider selected: Genymotion SaaS

Master Studio uses Genymotion SaaS as its first managed Android provider because its official API supports starting disposable Android instances, obtaining an instance-scoped access token, retrieving the instance WebRTC address, and stopping the instance. The official device web player SDK can render and interact with the Android screen inside Master Studio.

- [Genymotion SaaS API](https://developer.genymotion.com/saas/)
- [Genymotion device web player SDK](https://github.com/Genymobile/genymotion-device-web-player)
- [SaaS getting started and trial information](https://docs.genymotion.com/quickstart/saas_quickstart/)

**Important product distinction:** both current options are cloud-hosted Android virtual devices. “Cloud Phone” is a phone-profile virtual Android device, not a physical handset with a carrier SIM or guaranteed cellular service. Android Emulator is another recipe/profile using the same lifecycle. Instances are disposable: stopping one destroys the instance and changes made inside it may be lost.

## Environment variables

Set these in the hosting platform's server-side environment (for Railway: Service → Variables). Never commit real secrets.

- `DEVICE_API_ACCESS_KEY`: a long random secret used to authorize Master Studio session start/stop requests.
- `GENYMOTION_API_TOKEN`: API token from your Genymotion SaaS account.
- `GENYMOTION_PHONE_RECIPE_UUID`: a ready phone-form-factor recipe UUID.
- `GENYMOTION_EMULATOR_RECIPE_UUID`: a ready Android recipe UUID for the emulator module.

Use the Genymotion SaaS portal or API to find available recipe UUIDs. The token is sent only by the server to `https://api.geny.io/cloud` using the documented `x-api-token` header. Master Studio then requests a short-lived instance access token and passes that instance-scoped token to the official web player for WebRTC.

## Run and deploy

- Development: `npm install`, then `npm run dev` (starts the Node server and Vite middleware together).
- Production: `npm install`, `npm run build`, then `npm start`.
- Health check: `GET /api/health`.
- Provider configuration: `GET /api/devices/providers`.

The root `railway.json` declares build and start commands plus the health check. GitHub Actions builds the frontend and performs an API smoke test. A production launch/stop test still requires valid Genymotion credentials and recipe UUIDs from the account owner; CI must not create billable cloud instances.

## Session lifecycle

1. Master Studio checks that the API token and recipe UUID for the selected device type are configured.
2. The server starts a disposable Genymotion instance using `POST /v1/recipes/{recipeUuid}/start-disposable`.
3. It requests an instance-scoped player token using `POST /v1/instances/access-token`.
4. The browser loads `@genymotion/device-web-player` and connects to the returned WebRTC URL.
5. End session calls `POST /v1/instances/{instanceUuid}/stop-disposable`. The UI only reports the provider's successful response as a confirmed stop request.

## Security and reliability

- Keep Genymotion and device access keys in server environment variables only.
- Use HTTPS in production; do not expose ADB or device management ports publicly.
- Add real user authentication, per-user ownership, rate limits, quotas, audit logs, and cost controls before opening session creation to public users. The bootstrap access key is not multi-user authentication.
- A process restart clears the current in-memory session ownership map. Before multi-instance or multi-user deployment, persist session ownership securely and implement cleanup for orphaned instances.
- Never automatically start devices during a health check or CI build.
- Self-hosted runtime support is intentionally reserved for a later adapter; the UI does not pretend it is enabled.
