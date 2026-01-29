import { useState } from "react";
import { ExternalLink, Monitor, Play, X, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_URL = "https://danielepl.github.io/PrometheusPartnershipDemo/enterprise/";

export function ProductDemoStep() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Product Demo</h2>
          <p className="mt-1 text-muted-foreground">
            Walk through the Prometheus Enterprise platform with the prospect
          </p>
        </div>

        {/* Launch Card */}
        <button
          type="button"
          onClick={() => setShowDemo(true)}
          className="group w-full rounded-2xl border border-muted/30 bg-gradient-to-br from-primary/5 to-orange-600/5 p-8 text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-600 shadow-lg shadow-primary/20">
              <Presentation className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                Prometheus Enterprise Presentation
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                8 interactive slides — navigate with arrow keys or swipe
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Play className="h-5 w-5 text-primary ml-0.5" />
            </div>
          </div>
        </button>

        {/* External link fallback */}
        <div className="flex items-center justify-center">
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open in new tab instead
          </a>
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {showDemo && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Monitor className="h-4 w-4 text-white/60" />
              <span className="text-sm text-white/60">
                Prometheus Enterprise Demo — arrow keys or swipe to navigate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                New tab
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDemo(false)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Full iframe */}
          <iframe
            src={DEMO_URL}
            title="Prometheus Enterprise Demo"
            className="flex-1 w-full border-0"
            allow="fullscreen"
          />
        </div>
      )}
    </>
  );
}
