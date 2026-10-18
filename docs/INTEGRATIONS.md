# Integration map

| Module | Upstream | Status | Next implementation step |
|---|---|---|---|
| TikTokLive | https://github.com/leephil1907-lab/TikTokLive | Catalogued; not connected | Inspect API, authentication, events, and upstream license; use only permitted access |
| AutoSocial | https://github.com/Katzca/AutoSocial | Catalogued; not connected | Inspect platform adapters and implement official API integrations with approval gates |
| VidBee | https://github.com/nexmoe/VidBee | Catalogued; not connected | Inspect supported sources and rights/terms constraints before enabling downloads |
| Tiktok | https://github.com/running-libo/Tiktok | Catalogued; not connected | Review source, dependencies, and license |
| OBS Studio | https://github.com/obsproject/obs-studio | Reference integration | Optional local OBS WebSocket adapter, explicitly enabled by the user |
| OBS Virtual Camera | https://github.com/CatxFish/obs-virtual-cam | Reference integration | OS-specific compatibility check and install guide |
| Libretube | https://github.com/LiberTube/libertube | Reference integration | Link out or integrate only through supported interfaces |
| Local AI | https://github.com/techjarves/Uncensored-Local-AI-Multiplatform | Reference integration | Configure a user-provided local endpoint; never expose secrets in the browser |
| Face analysis | https://github.com/yakhyo/uniface | Research reference | Keep optional, consent-based, and clearly labelled; no identity verification claims |
| Device/network security research | supplied Android, SNI, and eSpoofer repositories | Review-only | Static review in an isolated lab; no credential collection, covert monitoring, or unauthorized interception |

## Integration contract

A repository link is not a completed integration. Before an adapter is marked connected, record its license, supported version, required permissions, credential storage approach, error handling, tests, and rollback path. Keep secrets server-side. Require user confirmation for external publishing or destructive actions. Never automate login challenges or bypass platform access controls.


## Device Studio (Cloud Phone + Android Emulator)

Both device modules use one shared setup flow. The frontend must not report a session as active unless a configured provider returns a valid session ID.

The provider adapter is not yet vendor-specific. Before enabling managed sessions, select a provider whose terms and API support the required Android runtime, installation, interaction, lifecycle, and usage controls. A browser app-testing sandbox is not necessarily a persistent general-purpose cloud phone.

For a future self-hosted route, use an Android-in-cloud runtime with a separately secured WebRTC streaming/control layer. Do not expose ADB or emulator management ports publicly. Keep provider credentials on the server, require authorization, enforce quotas and session expiry, and log session lifecycle events.
