import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-50">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-2 text-sm text-ink-70">
        The address may have changed. Head back to the start.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">
          Go to the start
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
