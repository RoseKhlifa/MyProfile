import {
  ArrowUpRight,
  BookOpen,
  Github,
  GlobeIcon,
  Linkedin,
  MailIcon,
  PhoneIcon,
  X,
} from "lucide-react";
import type React from "react";
import { Magnetic, TextLoop } from "@/components/motion/enhancements";
import {
  InteractiveName,
  ProfileAvatar,
} from "@/components/motion/profile-avatar";
import { BLOG_URL, PROFILE_ROLES, RESUME_DATA } from "@/data/resume-data";
import {
  type ContactIcon,
  type ContactLink,
  getContactLinks,
} from "@/lib/resume";
import "./header.css";

const ICON_MAP: Record<
  ContactIcon,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  github: Github,
  linkedin: Linkedin,
  x: X,
  globe: GlobeIcon,
  mail: MailIcon,
  phone: PhoneIcon,
};

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

interface SocialButtonProps {
  href: string;
  iconType: ContactIcon;
  label: string;
}

function SocialButton({ href, iconType, label }: SocialButtonProps) {
  const IconComponent = ICON_MAP[iconType];

  return (
    <a
      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
    >
      <IconComponent className="size-4" aria-hidden="true" />
    </a>
  );
}

interface ContactLinksProps {
  links: ContactLink[];
}

function ContactButtons({ links }: ContactLinksProps) {
  return (
    <div className="cv-header-actions pt-1 print:hidden">
      <ul className="flex gap-x-1" aria-label="Contact links">
        {links.map(({ href, label, icon }) => (
          <li key={label}>
            <Magnetic>
              <SocialButton href={href} iconType={icon} label={label} />
            </Magnetic>
          </li>
        ))}
      </ul>
      <Magnetic>
        <a
          className="cv-header-blog text-xs"
          href={BLOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="阅读博客（新标签页）"
        >
          <BookOpen size={14} strokeWidth={1.5} aria-hidden="true" />
          <span>阅读博客</span>
          <ArrowUpRight
            className="cv-header-blog-arrow"
            size={12}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </a>
      </Magnetic>
      {!links.some(({ icon }) => icon === "mail") && (
        <Magnetic>
          <a
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
            href="#contact-details"
            aria-label="联系信息"
          >
            <MailIcon className="size-4" />
          </a>
        </Magnetic>
      )}
    </div>
  );
}

function PrintContact({ links }: ContactLinksProps) {
  return (
    <div className="hidden flex-wrap gap-x-2 text-sm text-muted-foreground print:flex print:text-[12px] print:leading-tight">
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

        <ContactButtons links={contactLinks} />

        <PrintContact links={contactLinks} />
      </div>

      <ProfileAvatar src={RESUME_DATA.avatar} name={RESUME_DATA.name} />
    </header>
  );
}
