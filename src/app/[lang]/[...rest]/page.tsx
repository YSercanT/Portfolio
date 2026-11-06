import { notFound } from "next/navigation";

// Catches unknown URLs like /en/nope so they get our translated 404 page.
// Without this Next would want a top level app/layout.tsx, which we don't have.
export default function CatchAll() {
  notFound();
}
