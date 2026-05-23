import type { Metadata } from "next";
import { ShowcaseShell } from "./ShowcaseShell";
import { getShowcaseData } from "./_shared/data";

export const metadata: Metadata = {
  title: "Showcase — Paradise Beach",
  description: "Three redesign directions for Paradise Beach.",
};

export default function ShowcasePage() {
  const data = getShowcaseData();
  return <ShowcaseShell data={data} />;
}
