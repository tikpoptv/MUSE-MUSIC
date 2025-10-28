import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  // Disallow importing next/document anywhere except pages/_document.tsx
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/document",
              message:
                "Do not import from next/document in the App Router. Use <html> and <body> in app/layout.tsx. Allowed only in src/pages/_document.tsx.",
            },
          ],
        },
      ],
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // General code quality rules
      "no-console": "warn",
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-unused-expressions": "error",
      "prefer-const": "error",
      "no-var": "error",
      
      // React specific rules
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  // Allow next/document import specifically in the legacy Pages Router _document file
  {
    files: ["src/pages/_document.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  // Test files specific rules
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}", "**/tests/**/*.{ts,tsx}", "jest.setup.js"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
  // Development files specific rules
  {
    files: ["**/test/**/*.{ts,tsx}", "**/debug/**/*.{ts,tsx}"],
    rules: {
      "no-console": "off",
    },
  },
];

export default eslintConfig;
