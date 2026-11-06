// English UI text. tr.ts has to have the same keys, TypeScript checks that.
export const en = {
  meta: {
    siteDescription:
      "AI & full-stack engineering portfolio: curated projects, research publications and an interactive AI playground.",
  },
  nav: {
    projects: "Projects",
    experience: "Experience",
    publications: "Publications",
    language: "Language",
  },
  hero: {
    viewProjects: "View projects",
  },
  sections: {
    projects: "Projects",
    experience: "Experience",
    publications: "Publications",
    education: "Education",
  },
  projects: {
    emptyTitle: "No published projects yet",
    emptyBody: "Projects created in the admin panel will appear here.",
    allProjects: "All projects",
    liveDemo: "Live Demo",
    github: "GitHub",
    kaggle: "Kaggle",
    notFound: "Project not found",
  },
  dates: {
    present: "Present",
  },
  og: {
    portfolio: "Portfolio",
    project: "Project",
    footer: "Projects · Publications · Playground",
    chips: ["AI / ML", "Bioinformatics", "Full-Stack", "Rust"],
  },
};

export type Dictionary = typeof en;
