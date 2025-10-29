import { MetadataRoute } from "next";
import { appConfig } from "@/config/app.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appConfig.url.replace(/\/$/, "");
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    "",
    "/food",
    "/grocery",
    "/orders",
    "/about",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  return routes;
}


