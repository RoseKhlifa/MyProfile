import { ChinaGlobe } from "@/components/motion/china-globe";
import { ContactDetails } from "@/components/motion/contact-details";
import { Dock, Reveal } from "@/components/motion/enhancements";
import { Stack } from "@/components/motion/stack";
import { VisitCounter } from "@/components/motion/visit-counter";
import { Section } from "@/components/ui/section";
import { BLOG_URL, RESUME_DATA } from "@/data/resume-data";
import { getProjectCatalog } from "@/lib/project-stars";
import { generateResumeStructuredData } from "@/lib/structured-data";
import { Contribute } from "./components/contribute";
import { Education } from "./components/education";
import { Header } from "./components/header";
import { Projects } from "./components/projects";
import { Skills } from "./components/skills";
import { Summary } from "./components/summary";
import { WorkExperience } from "./components/work-experience";

export const revalidate = 3600;

export default async function ResumePage() {
  const projects = await getProjectCatalog();
  const structuredData = generateResumeStructuredData();
  const sections = [
    { key: "summary", content: <Summary summary={RESUME_DATA.summary} /> },
    { key: "work", content: <WorkExperience work={RESUME_DATA.work} /> },
    {
      key: "education",
      content: <Education education={RESUME_DATA.education} />,
    },
    { key: "skills", content: <Skills skills={RESUME_DATA.skills} /> },
    { key: "projects", content: <Projects projects={projects} /> },
  ] as const;

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <main
        className="container relative mx-auto scroll-my-12 overflow-auto p-4 print:p-0 md:p-16"
        id="main-content"
      >
        <section
          className="mx-auto w-full max-w-5xl space-y-8 print:max-w-none print:space-y-3"
          aria-label="Resume Content"
        >
          <Reveal>
            <Header />
          </Reveal>

          {sections
            .filter(({ key }) => RESUME_DATA[key].length > 0)
            .map(({ key, content }, index) => (
              <div
                key={key}
                className={
                  key === "summary" ? "space-y-8 print:space-y-3" : undefined
                }
              >
                <Reveal delay={(index + 1) * 0.075}>{content}</Reveal>
                {key === "summary" && (
                  <>
                    <Reveal delay={0.12}>
                      <Contribute />
                    </Reveal>
                    <Reveal delay={0.15}>
                      <Stack />
                    </Reveal>
                  </>
                )}
              </div>
            ))}
          <Reveal delay={0.2}>
            <Section title="Contact" titleId="contact-details">
              <div className="cv-contact-layout text-sm text-body">
                <ContactDetails />
                <ChinaGlobe />
              </div>
            </Section>
          </Reveal>
          <Reveal delay={0.25}>
            <VisitCounter />
          </Reveal>
        </section>

        <Dock blogUrl={BLOG_URL} />
      </main>
    </>
  );
}
