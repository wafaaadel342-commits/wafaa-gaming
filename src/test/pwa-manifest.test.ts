import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("PWA Progressive Web App Configuration", () => {
  const publicDir = path.resolve(__dirname, "../../public");

  it("has a valid manifest.webmanifest with all required PWA fields", () => {
    const manifestPath = path.join(publicDir, "manifest.webmanifest");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const content = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(content);

    expect(manifest.name).toBe("العب وتعلم");
    expect(manifest.short_name).toBe("العب وتعلم");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.lang).toBe("ar");
    expect(manifest.dir).toBe("rtl");
    expect(manifest.theme_color).toBe("#101a2c");
    expect(manifest.background_color).toBe("#fbfbf8");

    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);

    interface ManifestIcon {
      src: string;
      sizes: string;
      type: string;
      purpose: string;
    }

    const has192 = manifest.icons.some(
      (icon: ManifestIcon) => icon.sizes === "192x192" && icon.purpose === "any",
    );
    const has512 = manifest.icons.some(
      (icon: ManifestIcon) => icon.sizes === "512x512" && icon.purpose === "any",
    );
    const hasMaskable192 = manifest.icons.some(
      (icon: ManifestIcon) => icon.sizes === "192x192" && icon.purpose === "maskable",
    );
    const hasMaskable512 = manifest.icons.some(
      (icon: ManifestIcon) => icon.sizes === "512x512" && icon.purpose === "maskable",
    );

    expect(has192).toBe(true);
    expect(has512).toBe(true);
    expect(hasMaskable192).toBe(true);
    expect(hasMaskable512).toBe(true);
  });

  it("has generated all required PNG icon files on disk", () => {
    const iconFiles = [
      "icons/icon-192x192.png",
      "icons/icon-512x512.png",
      "icons/icon-maskable-192x192.png",
      "icons/icon-maskable-512x512.png",
      "icons/apple-touch-icon.png",
      "apple-touch-icon.png",
      "icons/favicon-32x32.png",
      "icons/favicon-16x16.png",
    ];

    for (const relPath of iconFiles) {
      const fullPath = path.join(publicDir, relPath);
      expect(fs.existsSync(fullPath), `Missing icon: ${relPath}`).toBe(true);
      const stats = fs.statSync(fullPath);
      expect(stats.size).toBeGreaterThan(100);
    }
  });

  it("has an offline.html fallback page with Arabic guidance", () => {
    const offlinePath = path.join(publicDir, "offline.html");
    expect(fs.existsSync(offlinePath)).toBe(true);

    const content = fs.readFileSync(offlinePath, "utf-8");
    expect(content).toContain("أنت غير متصل بالإنترنت");
    expect(content).toContain("الذكاء الاصطناعي");
    expect(content).toContain("إعادة المحاولة");
  });

  it("has a valid Service Worker script", () => {
    const swPath = path.join(publicDir, "sw.js");
    expect(fs.existsSync(swPath)).toBe(true);

    const content = fs.readFileSync(swPath, "utf-8");
    expect(content).toContain("CACHE_VERSION");
    expect(content).toContain("install");
    expect(content).toContain("activate");
    expect(content).toContain("fetch");
    expect(content).toContain("offline.html");
    // Ensure security rule is present
    expect(content).toContain("openrouter.ai");
  });
});
