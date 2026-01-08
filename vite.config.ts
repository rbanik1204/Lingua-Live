import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function stripVersionedPackageImports(): Plugin {
  const strip = (id: string): string | null => {
    if (id.startsWith(".") || id.startsWith("/") || id.includes("://")) return null;

    let basePart = id;
    let rest = "";

    if (id.startsWith("@")) {
      const firstSlash = id.indexOf("/");
      if (firstSlash === -1) return null;
      const secondSlash = id.indexOf("/", firstSlash + 1);
      if (secondSlash !== -1) {
        basePart = id.slice(0, secondSlash);
        rest = id.slice(secondSlash);
      }
    } else {
      const firstSlash = id.indexOf("/");
      if (firstSlash !== -1) {
        basePart = id.slice(0, firstSlash);
        rest = id.slice(firstSlash);
      }
    }

    const lastAt = basePart.lastIndexOf("@");
    if (lastAt <= 0) return null;

    const maybeVersion = basePart.slice(lastAt + 1);
    if (!/^\d+\.\d+\.\d+/.test(maybeVersion)) return null;

    return `${basePart.slice(0, lastAt)}${rest}`;
  };

  return {
    name: "strip-versioned-package-imports",
    async resolveId(source, importer, options) {
      const stripped = strip(source);
      if (!stripped || stripped === source) return null;
      return this.resolve(stripped, importer, { ...options, skipSelf: true });
    },
  };
}

export default defineConfig({
  plugins: [stripVersionedPackageImports(), react(), tailwindcss()],
});
