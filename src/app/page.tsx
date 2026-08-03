import { Metadata } from "next";
import { parseParams } from "../lib/urlState";
import { buildMetadata } from "../lib/metadata";

import { Calculator } from "../components/Calculator";

export const revalidate = 3600; // Revalidate every hour (ISR)

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const state = parseParams(searchParams);
  return buildMetadata(state);
}

export default function Home({ searchParams }: PageProps) {
  const initialState = parseParams(searchParams);

  return (
    <main className="min-h-screen bg-[#f8faf9] dark:bg-zinc-950 transition-colors duration-300">
      <Calculator initialState={initialState} />
    </main>
  );
}
