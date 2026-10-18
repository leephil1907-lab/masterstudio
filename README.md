# Master Studio

A unified, modular workspace for creator media, livestream tooling, video discovery, local AI, privacy engineering, and security research.

## Included modules

- **TikTokLive** — livestream event integration reference; requires authorized credentials and API-compliant access.
- **AutoSocial** — social publishing workflow reference; use official platform APIs and user-approved actions.
- **VidBee** — video discovery/download workflow reference; respect creator rights and source-platform terms.
- **Tiktok** — TikTok-related project reference.
- **OBS Studio / OBS Virtual Camera** — production and virtual-camera integration references.
- **Local AI** — provider-agnostic local inference configuration.
- **Privacy & Security Lab** — defensive review and safe test planning for device/network research repositories.

The repository links are catalogued as upstream projects, not copied or embedded. Each integration must be implemented and tested independently; this dashboard does not claim upstream functionality is already integrated.

## Development

```bash
npm install
npm run dev
```

## Security boundaries

No credential harvesting, keylogging, identity spoofing, covert tracking, unauthorized traffic manipulation, or account automation is implemented. Use authorized APIs, explicit user consent, and isolated test environments.

See `docs/INTEGRATIONS.md` for integration status and next steps.