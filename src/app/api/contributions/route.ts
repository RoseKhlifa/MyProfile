import { getGitHubContributions } from "@/lib/github-contributions";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const result = await getGitHubContributions();
  return Response.json(result, {
    headers: {
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=300",
    },
  });
}
