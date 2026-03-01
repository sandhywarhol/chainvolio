import { Suspense } from "react";
import { LandingPageClient } from "@/components/landing/LandingPageClient";

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LandingPageClient />
    </Suspense>
  );
}
