import { PageTransition } from "@/components/motion/page-transition";

// A template remounts on every navigation (a layout doesn't), which is what we
// need for the page fade-in. The header lives in the layout so it stays put.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
