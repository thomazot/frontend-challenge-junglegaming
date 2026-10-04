import { useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

/**
 * Dev-only panel to control mock scenarios and reset the database.
 * Rendered only when import.meta.env.DEV is true.
 */
export function MockControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [scenario, setScenario] = useState(() => window.__mocks?.current() ?? "default");

  if (!import.meta.env.DEV || !window.__mocks) return null;

  const handleScenarioChange = (id: string) => {
    window.__mocks?.setScenario(id);
    setScenario(id);
  };

  const handleReset = async () => {
    await window.__mocks?.reset(scenario);
    window.location.reload();
  };

  return (
    <div className="fixed bottom-20 right-4 z-9998 font-mono text-xs">
      {isOpen ? (
        <div className="bg-card border border-border rounded-lg p-4 shadow-xl flex flex-col gap-3 min-w-48">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-foreground">Mocks</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="mock-scenario" className="text-muted-foreground">
              Cenário
            </label>
            <Select value={scenario} onValueChange={handleScenarioChange}>
              <SelectTrigger id="mock-scenario" className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {window.__mocks.scenarios.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button size="sm" variant="outline" onClick={handleReset} className="h-8 text-xs">
            Resetar DB
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-ink-deep px-3 py-2 rounded-lg shadow-lg hover:bg-primary-dark transition-colors font-bold"
          aria-label="Abrir controles de mock"
        >
          ⚙️ Mocks
        </button>
      )}
    </div>
  );
}
