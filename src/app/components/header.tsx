import { ArrowUpRight, Github, GlobeIcon } from "lucide-react";
import { Magnetic, TextLoop } from "@/components/motion/enhancements";
import { HeaderContact } from "@/components/motion/header-contact";
import {
  InteractiveName,
  ProfileAvatar,
} from "@/components/motion/profile-avatar";
import { CONTACT_QR_IMAGES } from "@/data/contact-qr";
import { PROFILE_REPOSITORY } from "@/data/projects";
import { BLOG_URL, PROFILE_ROLES, RESUME_DATA } from "@/data/resume-data";
import { type ContactLink, getContactLinks } from "@/lib/resume";
import "./header.css";

interface LocationLinkProps {
  location: string;
  locationLink: string;
}

function LocationLink({ location, locationLink }: LocationLinkProps) {
  return (
    <p className="max-w-md items-center text-pretty text-xs text-foreground">
      <a
        className="inline-flex gap-x-1.5 align-baseline leading-none hover:underline"
        href={locationLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Location: ${location}`}
      >
        <GlobeIcon className="size-3" aria-hidden="true" />
        {location}
      </a>
    </p>
  );
}

interface ContactLinksProps {
  links: ContactLink[];
}

function ContactButtons() {
  return (
    <div className="cv-header-actions pt-1 print:hidden">
      <HeaderContact qrImages={CONTACT_QR_IMAGES} />
      <span className="cv-header-divider" aria-hidden="true" />
      <Magnetic>
        <a
          className="cv-header-source"
          href={PROFILE_REPOSITORY}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="MyProfile 源码（GitHub，新标签页）"
        >
          <Github size={16} strokeWidth={1.5} aria-hidden="true" />
        </a>
      </Magnetic>
      <span className="cv-header-divider" aria-hidden="true" />
      <Magnetic>
        <a
          className="cv-header-blog text-xs"
          href={BLOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="阅读博客（新标签页）"
        >
          <span>Blog</span>
          <ArrowUpRight
            className="cv-header-blog-arrow"
            size={12}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </a>
      </Magnetic>
    </div>
  );
}

function PrintContact({ links }: ContactLinksProps) {
  return (
    <div
      data-print-contacts="true"
      className="hidden flex-wrap gap-x-2 text-sm text-muted-foreground print:flex print:text-[12px] print:leading-tight"
    >
      {links.map(({ label, href, text }, index) => (
        <span key={label} className="inline-flex gap-x-2">
          <a className="text-foreground underline" href={href}>
            {text}
          </a>
          {index < links.length - 1 && <span aria-hidden="true">/</span>}
        </span>
      ))}
    </div>
  );
}

export function Header() {
  const contactLinks = getContactLinks(RESUME_DATA);

  return (
    <header className="flex items-center justify-between gap-x-4">
      <div className="min-w-0 flex-1 space-y-1.5 print:space-y-1">
        <h1
          className="font-pixel text-[28px] leading-none sm:text-[32px]"
          id="resume-name"
        >
          <InteractiveName name={RESUME_DATA.name} />
        </h1>
        <p className="max-w-md text-pretty text-sm text-body print:text-[12px] print:leading-tight">
          <TextLoop words={PROFILE_ROLES} />
        </p>

        {RESUME_DATA.location && RESUME_DATA.locationLink && (
          <LocationLink
            location={RESUME_DATA.location}
            locationLink={RESUME_DATA.locationLink}
          />
        )}

        <ContactButtons />

        <PrintContact links={contactLinks} />
      </div>

      <ProfileAvatar src={RESUME_DATA.avatar} name={RESUME_DATA.name} />
    </header>
  );
}
