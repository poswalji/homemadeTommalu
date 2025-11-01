import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-console": "off",
      "eqeqeq": "warn",
      "curly": "off",
      "quotes": "off",
      "@typescript-eslint/quotes": "off",
      "semi": "off",
      "no-debugger": "warn",
      "no-alert": "warn",
      "no-undef": "off",
      "no-redeclare": "warn",
      "no-unused-expressions": "warn",
      "no-shadow": "warn",
      "no-duplicate-case": "warn",
      "no-fallthrough": "warn",
      "no-inner-declarations": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
