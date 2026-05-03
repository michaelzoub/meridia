import type { Metadata } from "next";
import { GraphicsStudio } from "@/components/dashboard/GraphicsStudio";

export const metadata: Metadata = { title: "Graphics — Dashboard" };

export default function DashboardGraphicsPage() {
  return (
    <main className="min-h-[calc(100vh-52px)]">
      <GraphicsStudio />
    </main>
  );
}
