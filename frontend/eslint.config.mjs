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
    },
  },
  // Allow next/document import specifically in the legacy Pages Router _document file
  {
    files: ["src/pages/_document.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
