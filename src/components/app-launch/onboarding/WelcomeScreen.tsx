import { Button } from "@/components/ui/button";
import { Rocket, Sparkles, Shield, Zap } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
      {/* Hero Icon */}
      <div className="mb-8 relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-2xl">
          <Rocket className="h-12 w-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">
        Willkommen bei Launchpad
      </h1>

      {/* Subtitle */}
      <p className="text-xl text-muted-foreground mb-8 max-w-lg">
        Ich helfe dir deine App in die Stores zu bringen - Schritt für Schritt,
        von der Idee bis zum Launch.
      </p>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 w-full">
        <div className="glass rounded-xl p-4 text-left">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
            <Zap className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="font-semibold mb-1">AI-Geführt</h3>
          <p className="text-sm text-muted-foreground">
            Der AI-Assistent führt dich durch jeden Schritt und beantwortet alle Fragen.
          </p>
        </div>

        <div className="glass rounded-xl p-4 text-left">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
            <Shield className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="font-semibold mb-1">Alles an einem Ort</h3>
          <p className="text-sm text-muted-foreground">
            Screenshots, Icons, Beschreibungen, Compliance - alles zentral verwaltet.
          </p>
        </div>

        <div className="glass rounded-xl p-4 text-left">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
            <Rocket className="h-5 w-5 text-purple-500" />
          </div>
          <h3 className="font-semibold mb-1">Schneller launchen</h3>
          <p className="text-sm text-muted-foreground">
            Automatisierte Checklisten und Vorlagen sparen dir Tage an Arbeit.
          </p>
        </div>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        onClick={onStart}
        className="h-14 px-8 text-lg font-semibold rounded-xl"
      >
        Los geht's
        <Rocket className="ml-2 h-5 w-5" />
      </Button>

      <p className="text-sm text-muted-foreground mt-4">
        Dauert nur 2-3 Minuten
      </p>
    </div>
  );
}
