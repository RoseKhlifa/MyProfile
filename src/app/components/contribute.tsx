import { ContributionGraph } from "@/components/motion/contribution-graph";
import { Section } from "@/components/ui/section";
import { getGitHubContributions } from "@/lib/github-contributions";

export async function Contribute() {
  const { calendar, source } = await getGitHubContributions();

  return (
    <Section title="Contribute" titleId="contribute-section">
      <ContributionGraph calendar={calendar} source={source} />
    </Section>
  );
}
