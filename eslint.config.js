import typescriptEslint from "typescript-eslint";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import js from "@eslint/js";
import storybook from "eslint-plugin-storybook";

export default typescriptEslint.config(
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  eslintConfigPrettier,
  ...storybook.configs["flat/recommended"],
  {
    // dist/**, public/** are build output. The rest are vendored/generated
    // sources materialized by `keycloakify sync-extensions` (postinstall)
    // from @keycloakify/keycloak-admin-ui, @keycloakify/keycloak-account-ui,
    // and @keycloakify/keycloak-ui-shared -- not hand-authored by this
    // project, and not this project's code to lint. The handful of files
    // this project *did* claim ownership of within these trees
    // (src/account/colorScheme.ts, src/account/KcAccountUi.tsx,
    // src/admin/colorScheme.ts -- see each file's "claimed for ownership"
    // header) are already lint-clean, so excluding their containing
    // directories doesn't hide any real issue.
    ignores: [
      "dist/**",
      "public/**",
      "src/admin/**",
      "src/account/**",
      "src/shared/@patternfly/**",
      "src/shared/keycloak-ui-shared/**",
      "src/shared/SessionExpirationWarningOverlay.tsx",
    ],
  },
  {
    plugins: {
      "react-refresh": reactRefresh,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-redeclare": "off",
      "no-labels": "off",
    },
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.stories.*"],
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },
);
