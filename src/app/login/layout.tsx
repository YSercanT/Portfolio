import type { Metadata } from "next";
import { RootDocument } from "@/components/layout/root-document";
import { baseMetadata, baseViewport } from "@/lib/site";

export const metadata: Metadata = baseMetadata;
export const viewport = baseViewport;

// login has its own root layout, English only like the admin
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
