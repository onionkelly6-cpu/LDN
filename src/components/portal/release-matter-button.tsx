"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReleaseMatterButton({ matterId }: { matterId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRelease() {
    const confirmed = window.confirm(
      "Release this case to Available Clients? Another solicitor will be able to take it on, and you'll lose access until it's assigned back to you."
    );
    if (!confirmed) return;

    setPending(true);
    setError(null);

    try {
      const res = await fetch(`/api/matters/${matterId}/release`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not release this case");
      }
      // The assigned-attorney check on the detail page would 404 now that
      // it's released, so go back to the docket where it shows in the pool.
      router.push("/firm/matters");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not release this case");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        onClick={handleRelease}
        disabled={pending}
        className="px-3 py-1.5 text-xs text-muted-foreground"
      >
        <UserMinus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        {pending ? "Releasing…" : "Release to Available Clients"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
