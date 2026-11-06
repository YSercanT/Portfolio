import { ExternalLink } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import type { Dictionary, Locale } from "@/i18n";
import { formatDateRange, formatMonthYear } from "@/lib/format";
import type { Education, Publication, WorkExperience } from "@/repositories/interfaces/resume-repositories";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 pb-24">
      <h2 className="mb-8 text-2xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

// one timeline entry, dates on the left (stacked on mobile)
function TimelineItem({ when, children }: { when: string; children: React.ReactNode }) {
  return (
    <Reveal
      as="li"
      className="group relative grid gap-1 border-l border-border pl-6 sm:grid-cols-[160px_1fr] sm:gap-6 sm:border-l-0 sm:pl-0"
    >
      <p className="text-sm text-muted-foreground tabular-nums sm:pt-0.5">{when}</p>
      <div className="relative sm:border-l sm:pl-6">
        {/* the dot, turns cyan on hover */}
        <span
          aria-hidden
          className="absolute top-1.5 -left-[29px] size-2 rounded-full border border-border bg-background transition-[background-color,border-color,box-shadow] duration-300 group-hover:border-primary group-hover:bg-primary group-hover:shadow-glow-sm sm:-left-[4.5px]"
        />
        {children}
      </div>
    </Reveal>
  );
}

type SectionProps<T> = { items: T[]; locale: Locale; dict: Dictionary };

export function ExperienceSection({ items, locale, dict }: SectionProps<WorkExperience>) {
  if (items.length === 0) return null;
  return (
    <Section id="experience" title={dict.sections.experience}>
      <ol className="grid gap-10">
        {items.map((x) => (
          <TimelineItem key={x.id} when={formatDateRange(x.startDate, x.endDate, locale, dict.dates.present)}>
            <h3 className="font-medium">
              {x.role} <span className="text-muted-foreground">· {x.company}</span>
            </h3>
            {x.description && (
              <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">{x.description}</p>
            )}
            {x.techStack.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {x.techStack.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </TimelineItem>
        ))}
      </ol>
    </Section>
  );
}

export function EducationSection({ items, locale, dict }: SectionProps<Education>) {
  if (items.length === 0) return null;
  return (
    <Section id="education" title={dict.sections.education}>
      <ol className="grid gap-10">
        {items.map((e) => (
          <TimelineItem key={e.id} when={formatDateRange(e.startDate, e.endDate, locale, dict.dates.present)}>
            <h3 className="font-medium">{e.degree}</h3>
            <p className="text-sm text-muted-foreground">{e.institution}</p>
            {e.description && (
              <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">{e.description}</p>
            )}
          </TimelineItem>
        ))}
      </ol>
    </Section>
  );
}

export function PublicationsSection({ items, locale, dict }: SectionProps<Publication>) {
  if (items.length === 0) return null;
  return (
    <Section id="publications" title={dict.sections.publications}>
      <ol className="grid gap-8">
        {items.map((p) => (
          <TimelineItem key={p.id} when={formatMonthYear(p.publishedOn, locale)}>
            <h3 className="font-medium text-balance">
              {p.url ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1.5 hover:text-primary"
                >
                  {p.title}
                  <ExternalLink className="mt-1 size-3.5 shrink-0" />
                </a>
              ) : (
                p.title
              )}
            </h3>
            <p className="text-sm text-primary/90">{p.publisher}</p>
            {p.abstract && <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">{p.abstract}</p>}
          </TimelineItem>
        ))}
      </ol>
    </Section>
  );
}
