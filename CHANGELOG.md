# Changelog

## [0.3.0](https://github.com/kWAYTV/roster/compare/roster-v0.2.4...roster-v0.3.0) (2026-07-20)


### Features

* add cooldown feature with UI components and metadata management ([3a86606](https://github.com/kWAYTV/roster/commit/3a86606cf668d188bc173d4ee3edc9e6694444ec))
* add initial configuration and UI components ([1f90599](https://github.com/kWAYTV/roster/commit/1f90599da9fa36486230e5484b378e5bf86af9c3))
* **bridge:** add open_external_url command ([c643400](https://github.com/kWAYTV/roster/commit/c64340066c32580c48bc96c2011dafb0caed7805))
* **build:** add Windows batch script for building signed NSIS installer ([35feed7](https://github.com/kWAYTV/roster/commit/35feed7e205f612fc37f98646eb2db3191a7ddd3))
* **build:** update build script and GitHub Actions workflow ([ebf544a](https://github.com/kWAYTV/roster/commit/ebf544adb9aa1acbea45d3edff94206434144aec))
* **config:** add bump configuration for versioning and release management ([b8f55c3](https://github.com/kWAYTV/roster/commit/b8f55c34442ec4adf2a4f230f27102a82dee1d3e))
* enhance release workflow for versioned and pre-releases ([0c28ded](https://github.com/kWAYTV/roster/commit/0c28dedff7924a63101a5334f66baa38954808f3))
* **icons:** add lucide-animated icons and shared helpers ([ed82c97](https://github.com/kWAYTV/roster/commit/ed82c97406531c86bd02f1efdd23ff824e7a3b15))
* implement online status tracking for accounts ([8aea6bd](https://github.com/kWAYTV/roster/commit/8aea6bdb6a831554b549e2d9e4632233de6a1b3d))
* **intake:** include failure reasons in partial import summary ([4186998](https://github.com/kWAYTV/roster/commit/418699812c89a446fa7167971a58e510f5733d56))
* introduce Ultracite code standards and Biome configuration ([c0238c8](https://github.com/kWAYTV/roster/commit/c0238c8ee032e389c4bbda9e3324c6a8e7addb5a))
* persist window size and position across launches ([78e5f51](https://github.com/kWAYTV/roster/commit/78e5f5166f7ec0a0b196b8bf324d8d44213dfce8))
* **preferences:** add 'minimize to tray on close' option ([7e19b57](https://github.com/kWAYTV/roster/commit/7e19b57685d3d9a55a9df681007f3df71e9d9f3e))
* **release:** update GitHub Actions workflow for signing key management ([fa20685](https://github.com/kWAYTV/roster/commit/fa20685f62a2002751bba111a21f5e77781b3c9f))
* **roster:** enhance profile handling and status updates ([7a28b17](https://github.com/kWAYTV/roster/commit/7a28b174b3bbf8ecce38f389e0dd4586481597a4))
* **roster:** polish account context menu UX ([06e5729](https://github.com/kWAYTV/roster/commit/06e5729c8bbff0065be8235cb1cabba50c5e8c0e))
* **security:** enable a Content Security Policy for the webview ([cf21ef3](https://github.com/kWAYTV/roster/commit/cf21ef382872896a3f1237eb34c9cdd4f639c423))
* **steam_client:** improve account management with conditional Steam stopping ([8258917](https://github.com/kWAYTV/roster/commit/82589178262115912d43990286dd68ffec821fce))
* **theme:** update color tokens and improve UI consistency ([31fdde3](https://github.com/kWAYTV/roster/commit/31fdde3f7a49d8c5a388230d5c0f36d949f1d6de))
* **tray:** open the import dialog instead of importing the clipboard ([3ff71aa](https://github.com/kWAYTV/roster/commit/3ff71aabf2b8656b2f0549299bac76daec8ff1e5))
* **ui:** enhance account management and UI components ([458b8b0](https://github.com/kWAYTV/roster/commit/458b8b0b9e8c2afb60e94cdf0a5b5c2f3e53a550))
* **ui:** enhance toolbar with PlusIcon and update button styles ([4ad8852](https://github.com/kWAYTV/roster/commit/4ad88527d091ace603af5dae98488669d0f9203a))
* **ui:** mask avatars in streamer mode and polish accessibility ([29b226b](https://github.com/kWAYTV/roster/commit/29b226b464f176939fbeb5485a21776e8c0b8286))
* **ui:** show version and GitHub link in footer ([9c814c2](https://github.com/kWAYTV/roster/commit/9c814c2f88beb7ded24234a4954ba48eab71adb5))
* **updater:** integrate update functionality and enhance settings UI ([956c0af](https://github.com/kWAYTV/roster/commit/956c0afe56357767519f9bebd0d881443b122255))


### Bug Fixes

* bug fixes and hardening across intake, roster, cooldowns, and Steam config ([ecd40b2](https://github.com/kWAYTV/roster/commit/ecd40b257eda6fa2d744cd6945bdfbc4ca9ba68d))
* **cooldown:** tick countdown every second in the final minute ([b663248](https://github.com/kWAYTV/roster/commit/b663248730337c1c06e65cee4ca8e0c784dbf7dc))
* **intake:** split multi-line pastes for username and bare-token entries ([567e57a](https://github.com/kWAYTV/roster/commit/567e57a7dea6d3e0f5409fc8f7c860b54ebbef14))
* **release:** bump Cargo.lock via bumpp files list ([0a683e2](https://github.com/kWAYTV/roster/commit/0a683e26e4a5d7ed6d017b915ac72860a12c15a2))
* **release:** improve signing key handling in GitHub Actions workflow ([e8e0071](https://github.com/kWAYTV/roster/commit/e8e0071547479f8e2cc786af52f63af8c4693ab0))
* **release:** include tauri version files in bumpp commit ([73ce82d](https://github.com/kWAYTV/roster/commit/73ce82d25c35ed6306d9b033ae01454cb9fe6dbf))
* **release:** regenerate Cargo.lock and stop bumpp corrupting crate versions ([dedb9bc](https://github.com/kWAYTV/roster/commit/dedb9bc915b3b65c149a11c05cf552a98496ed32))
* **release:** streamline signing key handling in GitHub Actions workflow ([ee980c4](https://github.com/kWAYTV/roster/commit/ee980c49707b00a9d31a4a18454dfc84cca223e8))
* **roster:** avoid empty-state flash and confirm cooldown sign-ins ([30d5b51](https://github.com/kWAYTV/roster/commit/30d5b51001f88e3c389f27df392b6bd528b88151))
* **status:** coalesce concurrent sweep requests instead of dropping them ([cfe9915](https://github.com/kWAYTV/roster/commit/cfe991574b05826cda7c6bf606a7ac387cb63d47))
* **steam-client:** serialize Steam mutations behind a global lock ([55b1702](https://github.com/kWAYTV/roster/commit/55b170275d339534ea2031bc28d3c6f97c9c9273))
* **steam-config:** never rebuild local.vdf over existing token data ([16762be](https://github.com/kWAYTV/roster/commit/16762be1cd14a75f75896bb698ddd10a86de7e50))
* **store:** preserve corrupt metadata and preferences files ([3586d62](https://github.com/kWAYTV/roster/commit/3586d621ff5e6bddeb3af5e19a353d80e29d4980))
* **ui:** restore visible button hover states ([b503930](https://github.com/kWAYTV/roster/commit/b503930f51d28dcbdf49b490f35139e8afbd5779))
