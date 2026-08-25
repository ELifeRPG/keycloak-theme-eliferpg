# eliferpg Keycloak Theme

A Keycloakify-based Keycloak theme for eliferpg, covering login, account,
admin, and email. Distributed as a theme JAR (see Releases / CI artifacts) —
this repo does not run or own a Keycloak deployment.

## Prerequisites

Keycloakify's build tooling shells out to Maven internally, so a working
build needs Maven + Java on `PATH` in addition to Node. This repo includes a
`.devcontainer/` (added specifically because this development machine didn't
have Maven/Java installed) that provides both — see "Build" below for the
recommended way to build without installing anything extra on the host.

Docker is required either way: it's how the recommended devcontainer path
(below) provides Maven/Java without a host install, and it's also used
directly by the local preview command further down.

- Node.js (LTS)
- Docker (recommended path: runs the devcontainer that provides Maven/Java;
  also used directly by `npx keycloakify start-keycloak` for local preview)

If you already have Maven and Java installed and prefer to build directly on
the host instead of using the devcontainer:

- Maven >= 3.1.1 and Java >= 7 on `PATH`

## Local preview

Full preview against a real, Dockerized Keycloak, with hot reload:

```bash
npx keycloakify start-keycloak
```

Faster, no-Docker preview of individual pages:

```bash
npx keycloakify add-story
npm run storybook
```

## Build

The full build pipeline is `npm run build-keycloak-theme`, which runs
`tsc && vite build` (compiles the React/CSS theming — this is the step that
actually produces the themed output) followed by `keycloakify build` (which
packages the result into theme JARs). Running `keycloakify build` on its own
skips the Vite step and produces a stale/broken jar, so always use the npm
script.

Recommended: build inside the provided devcontainer, so you don't need Maven
or Java on the host:

```bash
docker build -t keycloak-theme-eliferpg-devcontainer:latest -f .devcontainer/Dockerfile .devcontainer
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd)":/workspace -w /workspace keycloak-theme-eliferpg-devcontainer:latest npm install
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd)":/workspace -w /workspace keycloak-theme-eliferpg-devcontainer:latest npm run build-keycloak-theme
```

(`npm install` is a separate step because `node_modules` is gitignored and
the Dockerfile only installs Maven at image-build time — it doesn't install
JS dependencies. Without this step the build fails inside the container with
`vite: not found` / `tsc: not found` on a fresh clone.)

The `-u "$(id -u):$(id -g)"` matters: without it, Docker writes the build
output into the repo as root, which then blocks any subsequent host-level
command (including your own editor/git) that touches those same files with a
permission error. This bit multiple tasks during development.

If you have Maven and Java on the host already:

```bash
npm install
npm run build-keycloak-theme
```

Either way, this produces JARs in `dist_keycloak/`:

- `keycloak-theme-for-kc-all-other-versions.jar` — Keycloak 11–21 and 26+
- `keycloak-theme-for-kc-22-to-25.jar` — Keycloak 22–25

Use whichever matches your target Keycloak version.

CI (`.github/workflows/ci.yml`) builds and lints the theme on every push to
`main` and every pull request. A separate workflow
(`.github/workflows/release.yml`) runs whenever a GitHub Release is
published: it rebuilds the theme from the release's tag, attaches both jars
to that release, and builds/pushes a container image (see "Container image"
below).

## Deploying

Drop the appropriate JAR into your Keycloak instance's `providers/`
directory, then run `bin/kc.sh build`. Select the `eliferpg` theme for
each theme type (Login, Account, Admin, Email) in Realm Settings ->
Themes.

### Container image

Every published release also builds and pushes a ready-to-run Keycloak image
with the theme baked in: `ghcr.io/eliferpg/keycloak-theme-eliferpg:<version>`
(plus a `:latest` tag, for non-prerelease releases). It's
`quay.io/keycloak/keycloak:26.0` with
`keycloak-theme-for-kc-all-other-versions.jar` copied into `providers/` —
nothing else configured. This is a convenience artifact for consumers on
Keycloak 26.x; anyone on Keycloak 22–25 should use the
`keycloak-theme-for-kc-22-to-25.jar` release asset directly instead, since
this image is pinned to a KC 26 base.

This theme has no light variant — it always renders dark, and the generated
`theme.properties` for account/admin default the realm's "Dark Mode" setting
to `true` for that reason. If a realm admin manually disables Dark Mode
(Realm Settings -> Themes), the account/admin consoles do not fall back to
an actual light theme; they render a broken hybrid of PatternFly's
light-theme component values combined with this theme's forced dark
background/text colors. Leave Dark Mode enabled.

### Logo

`src/login/logo.png`, `src/account/logo.png`, and `src/admin/logo.png` are
currently placeholders — 330-byte solid-color PNGs, not a real logo. The
email theme embeds the same placeholder inline as a base64 data URI in
`src/email/html/template.ftl`. Replace all four before shipping this theme
for real use.

## Localization

English and German both work out of the box — Keycloakify ships translations
for ~30 languages by default (English and German included), and this covers
all four theme types without any theme-side configuration. Nothing in this
repo was added or edited to make German work; it's already present in the
generated `locales=` line of every theme type's build output.

To let end users actually switch to German, a realm admin must still enable
Internationalization for the realm and add `de` to its supported locales
(Realm Settings -> Localization) in Keycloak's Admin Console — that's a
deployment-time step outside this repo, not something this project does.

## SPI plugin pages

[`keycloak-bohemia-gameaccount`](https://github.com/ELifeRPG/keycloak-bohemia-gameaccount)
is a Keycloak SPI plugin that adds a required-action page
(`link-bohemia-gameaccount.ftl`) for its `link-bohemia-gameaccount` required
action. It ships that page via Keycloak's `theme-resources/` classpath
convention (`theme-resources/templates/`, `.../messages/`), not a named theme —
so with that plugin's jar deployed in `providers/` alongside this theme's jar,
the page is automatically available under `eliferpg` (or any other active
theme) with no configuration in this repo. This is also how any future SPI
plugin with its own login/account/admin page would compose: each just ships
its own `theme-resources/` tree, since Keycloak searches every registered
theme-resource provider rather than requiring them to chain through a
theme's single `parent=`.

## Brand tokens

Colors live in `src/shared/brand-tokens.css`. Run `npm run check:contrast`
after changing any of them to verify WCAG AA contrast is maintained.
