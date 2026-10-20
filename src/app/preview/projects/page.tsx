import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Contribute } from "@/app/components/contribute";
import { Header } from "@/app/components/header";
import { Projects } from "@/app/components/projects";
import { Summary } from "@/app/components/summary";
import { ChinaGlobe } from "@/components/motion/china-globe";
import { ContactDetails } from "@/components/motion/contact-details";
import { Dock, Reveal } from "@/components/motion/enhancements";
import { Stack } from "@/components/motion/stack";
import { Section } from "@/components/ui/section";
import { PROJECT_DEMO } from "@/data/project-demo";
import { BLOG_URL, RESUME_DATA } from "@/data/resume-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "8 个项目的布局预览 · RoseKhlifa",
  robots: { index: false, follow: false },
};

export default function ProjectsPreview() {
  return (
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
        <Reveal delay={0.06}>
          <Summary summary={RESUME_DATA.summary} />
        </Reveal>
        <Reveal delay={0.1}>
          <Contribute />
        </Reveal>
        <Reveal delay={0.1}>
          <Stack />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="space-y-2 border-l border-border pl-3 text-xs text-body">
            <p>8 个项目的布局预览：2 项真实项目，6 项示例。</p>
            <p className="text-muted-foreground">
              默认展开全部；筛选和项目详情都可操作。
            </p>
            <Link
              className="inline-flex items-center gap-1 hover:underline"
              href="/"
            >
              <ArrowLeft className="size-3" />
              返回个人主页
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <Projects projects={PROJECT_DEMO} initialExpanded={true} />
        </Reveal>
        <Reveal>
          <Section title="Contact" titleId="contact-details">
            <div className="cv-contact-layout text-sm text-body">
              <ContactDetails />
              <ChinaGlobe />
            </div>
          </Section>
        </Reveal>
      </section>
      <Dock blogUrl={BLOG_URL} />
    </main>
  );
}
