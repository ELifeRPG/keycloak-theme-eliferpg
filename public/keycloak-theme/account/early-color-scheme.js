/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260700.0.3.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/early-color-scheme.js" --public --revert
 *
 * early-color-scheme.js is a special file that will be imported in the head automatically by Keycloakify.
 * Note that this file is not loaded in Storybook or when using the Vite DEV server.
 * To test it you can use `NO_DEV_SERVER=true npx keycloakify start-keycloak` (NO_DEV_SERVER is only relevant for Account SPA and Admin themes)
 */

{
    // eliferpg brand override (Task 5): this theme has no light variant, so
    // it should always render dark. BACKGROUND_COLOR_DARK_MODE is matched to
    // the brand's --color-bg (src/shared/brand-tokens.css) so this early
    // (pre-stylesheet) paint doesn't itself introduce a color mismatch flash.
    const BACKGROUND_COLOR_DARK_MODE = "#1b1b1b";
    const BACKGROUND_COLOR_LIGHT_MODE = "#FFFFFF";
    const DARK_THEME_CLASS = "pf-v5-theme-dark";

    const isDarkModeEnabled = (() => {
        // The realm-level "Dark Mode" admin override is honored, matching
        // colorScheme.ts's startColorSchemeManagement(): if it's explicitly
        // disabled, render light -- no OS-preference branch either way.
        if (typeof kcContext !== "undefined" && kcContext.darkMode === false) {
            return false;
        }

        return true;
    })();

    {
        const element = document.createElement("style");

        element.id = "root-color-scheme-style";

        element.innerHTML = `:root { color-scheme: ${isDarkModeEnabled ? "dark" : "light"}; }`;

        document.head.appendChild(element);
    }

    document.documentElement.style.backgroundColor = isDarkModeEnabled
        ? BACKGROUND_COLOR_DARK_MODE
        : BACKGROUND_COLOR_LIGHT_MODE;

    if (isDarkModeEnabled) {
        document.documentElement.classList.add(DARK_THEME_CLASS);
    }
}
