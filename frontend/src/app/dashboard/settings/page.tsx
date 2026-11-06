"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface Health {
  models_loaded: string[];
  max_length: number;
  device: string;
}

export default function SettingsPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [healthError, setHealthError] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch(`${baseUrl}/api/health`)
      .then((r) => (r.ok ? (r.json() as Promise<Health>) : Promise.reject()))
      .then(setHealth)
      .catch(() => setHealthError(true));
  }, []);

  function deleteHistory() {
    try {
      localStorage.removeItem("tsektxt_analyses_v2");
      setNotice("History deleted from this browser.");
    } catch {
      setNotice("Could not delete history in this browser.");
    }
  }

  return (
    <div className="mx-auto w-full space-y-5 lg:w-1/2">
      <div>
        <h1 className="text-4xl font-black tracking-[0.015em]">Settings</h1>
        <p className="mt-2 text-muted">Model server status and your local history.</p>
      </div>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Model server</h2>
        {health ? (
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted">Status</dt><dd className="font-semibold text-credible">Running</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Models loaded</dt><dd>{health.models_loaded.join(", ")}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Max length</dt><dd>{health.max_length} tokens</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Device</dt><dd>{health.device}</dd></div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted">{healthError ? "Not reachable. Start the backend (README, step 3)." : "Checking..."}</p>
        )}
      </Card>
      <Card className="border-critical/30 p-5">
        <h2 className="text-xl font-semibold">History and data</h2>
        <p className="mt-2 text-muted">History, saved checks and feedback notes are stored only in this browser. Nothing is uploaded.</p>
        <Button className="mt-4" variant="danger" onClick={deleteHistory}>Delete history</Button>
        {notice ? <p className="mt-3 text-sm text-credible" role="status">{notice}</p> : null}
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">About this demo</h2>
        <p className="mt-2 text-sm text-muted">
          Research demo for the TsekTxt thesis. Models: hansjio/tsektxt-roberta-tagalog, hansjio/tsektxt-mbert, hansjio/tsektxt-xlmr. Explanations: Captum Integrated Gradients. No accounts, no external AI service.
        </p>
      </Card>
    </div>
  );
}
