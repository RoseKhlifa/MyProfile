import { GraduationCap } from "lucide-react";
import { PROFILE_EDUCATION, SECTION_TITLES } from "@/data/resume-data";
import { Section } from "../../components/ui/section";
import "./summary.css";

interface AboutProps {
  summary: string;
  className?: string;
}

export function Summary({ summary, className }: AboutProps) {
  return (
    <Section
      title={SECTION_TITLES.summary}
      titleId="about-section"
      className={className}
    >
      <article
        className="cv-about-education text-sm text-body"
        aria-label={summary}
      >
        <GraduationCap size={16} strokeWidth={1.4} aria-hidden="true" />
        <div className="cv-about-education-copy">
          <p className="cv-about-school">{PROFILE_EDUCATION.school}</p>
          <p className="cv-about-meta text-xs text-muted-foreground">
            <span>{PROFILE_EDUCATION.major}</span>
            <span className="cv-about-divider" aria-hidden="true" />
            <span>{PROFILE_EDUCATION.classOf} 届</span>
          </p>
        </div>
      </article>
    </Section>
  );
}
