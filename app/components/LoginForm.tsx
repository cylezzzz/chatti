"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

/**
 * LoginForm zeigt ein einfaches Eingabefeld für das Passwort und einen
 * Button zum Absenden. Beim Klicken wird das Passwort per POST an
 * `/api/auth/login` gesendet.  Bei Erfolg wird ein Session‑Cookie
 * (`ai-app-session`) gesetzt und die Seite neu geladen, damit die
 * Authentifizierung greift.  Bei falschem Passwort erscheint eine
 * Fehlermeldung.
 */
export default function LoginForm() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      if (res.ok) {
        toast({ title: "✅ Erfolgreich eingeloggt" });
        // Nach erfolgreichem Login neu laden, damit der Cookie ausgewertet wird
        router.replace("/");
      } else {
        toast({ title: "❌ Falsches Passwort", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "💥 Serverfehler beim Login", variant: "destructive" });
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-32 p-6 bg-gray-900 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-center mb-4">🔐 Login</h2>
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Gib dein <strong>Admin</strong>- oder <strong>Gast</strong>-Passwort ein.
      </p>
      <Input
        type="password"
        placeholder="Passwort"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4"
      />
      <Button onClick={handleLogin} className="w-full">
        Einloggen
      </Button>
    </div>
  );
}