import { PROJECT_CATALOG } from "@/data/projects";
import type { Project } from "@/lib/types";

export async function getProjectCatalog(): Promise<Project[]> {
  return Promise.all(
    PROJECT_CATALOG.map(async (project) => {
      if (!project.repository) return project;
      try {
        const repository = new URL(project.repository);
        if (repository.hostname !== "github.com") return project;
        const response = await fetch(
          `https://api.github.com/repos${repository.pathname}`,
          {
            headers: {
              Accept: "application/vnd.github+json",
              "User-Agent": "RoseKhlifa-Portfolio",
            },
            next: { revalidate: 86400 },
            signal: AbortSignal.timeout(5000),
          }
        );
        if (!response.ok) return project;
        const data = await response.json();
        if (
          data.private !== false ||
          !Number.isSafeInteger(data.stargazers_count) ||
          data.stargazers_count < 0
        )
          return project;
        const date = response.headers.get("date");
        return {
          ...project,
          stars: data.stargazers_count,
          starsUpdatedAt:
            date && Number.isFinite(Date.parse(date))
              ? new Date(date).toISOString()
              : new Date().toISOString(),
        };
      } catch {
        return project;
      }
    })
  );
}
