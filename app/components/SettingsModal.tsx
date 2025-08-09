'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

type Settings = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: number;
  sidebarVisible: boolean;
  autoSave: boolean;
  confirmOnExit: boolean;
  restoreSession: boolean;
  shortcuts: boolean;
  defaultModel: string;
  streaming: boolean;
  tokenLimit: number;
  temperature: number;
  autoAgentSelect: boolean;
  notifications: boolean;
  sounds: boolean;
  volume: number;
  reminders: boolean;
  logging: boolean;
  encryption: boolean;
  autoCleanup: boolean;
  passwordProtection: boolean;
  performanceMode: 'low' | 'balanced' | 'high';
  gpuAcceleration: boolean;
  ramLimit: number;
  betaFeatures: boolean;
  debugMode: boolean;
  apiEndpoint: string;
};

export default function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => setSettings(data))
        .catch((err) => console.error('Failed to load settings:', err));
    }
  }, [open]);

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [key]: value };
      setHasChanges(true);
      return updated;
    });
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await fetch('/api/settings', {
        method: 'POST', // ✅ Fix: Komma entfernt, Semikolonfehler behoben
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!open || !settings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[800px] max-w-[95vw] max-h-[90vh] bg-background rounded-lg shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 py-2">
          <h2 className="text-lg font-semibold">Einstellungen</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appearance" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-6 border-b">
            <TabsTrigger value="appearance">Aussehen</TabsTrigger>
            <TabsTrigger value="behavior">Verhalten</TabsTrigger>
            <TabsTrigger value="ai">KI</TabsTrigger>
            <TabsTrigger value="notifications">Hinweise</TabsTrigger>
            <TabsTrigger value="privacy">Datenschutz</TabsTrigger>
            <TabsTrigger value="advanced">Erweitert</TabsTrigger>
          </TabsList>

          {/* Aussehen */}
          <TabsContent value="appearance" className="p-4 space-y-4">
            <div>
              <Label>Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(val) => updateSetting('theme', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Theme auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Hell</SelectItem>
                  <SelectItem value="dark">Dunkel</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sprache</Label>
              <Input
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
              />
            </div>
            <div>
              <Label>Schriftgröße</Label>
              <Slider
                value={[settings.fontSize]}
                min={10}
                max={24}
                step={1}
                onValueChange={(val) => updateSetting('fontSize', val[0])}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Sidebar anzeigen</Label>
              <Switch
                checked={settings.sidebarVisible}
                onCheckedChange={(val) => updateSetting('sidebarVisible', val)}
              />
            </div>
          </TabsContent>

          {/* Verhalten */}
          <TabsContent value="behavior" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Automatisch speichern</Label>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(val) => updateSetting('autoSave', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Bestätigung beim Beenden</Label>
              <Switch
                checked={settings.confirmOnExit}
                onCheckedChange={(val) => updateSetting('confirmOnExit', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Letzte Sitzung wiederherstellen</Label>
              <Switch
                checked={settings.restoreSession}
                onCheckedChange={(val) => updateSetting('restoreSession', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Tastenkürzel aktivieren</Label>
              <Switch
                checked={settings.shortcuts}
                onCheckedChange={(val) => updateSetting('shortcuts', val)}
              />
            </div>
          </TabsContent>

          {/* KI */}
          <TabsContent value="ai" className="p-4 space-y-4">
            <div>
              <Label>Standardmodell</Label>
              <Input
                value={settings.defaultModel}
                onChange={(e) => updateSetting('defaultModel', e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Streaming aktivieren</Label>
              <Switch
                checked={settings.streaming}
                onCheckedChange={(val) => updateSetting('streaming', val)}
              />
            </div>
            <div>
              <Label>Token Limit</Label>
              <Slider
                value={[settings.tokenLimit]}
                min={256}
                max={8192}
                step={128}
                onValueChange={(val) => updateSetting('tokenLimit', val[0])}
              />
            </div>
            <div>
              <Label>Temperatur</Label>
              <Slider
                value={[settings.temperature]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={(val) => updateSetting('temperature', val[0])}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Auto-Agent Auswahl</Label>
              <Switch
                checked={settings.autoAgentSelect}
                onCheckedChange={(val) => updateSetting('autoAgentSelect', val)}
              />
            </div>
          </TabsContent>

          {/* Hinweise */}
          <TabsContent value="notifications" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Benachrichtigungen</Label>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(val) => updateSetting('notifications', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Sounds</Label>
              <Switch
                checked={settings.sounds}
                onCheckedChange={(val) => updateSetting('sounds', val)}
              />
            </div>
            <div>
              <Label>Lautstärke</Label>
              <Slider
                value={[settings.volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(val) => updateSetting('volume', val[0])}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Erinnerungen</Label>
              <Switch
                checked={settings.reminders}
                onCheckedChange={(val) => updateSetting('reminders', val)}
              />
            </div>
          </TabsContent>

          {/* Datenschutz */}
          <TabsContent value="privacy" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Logging aktivieren</Label>
              <Switch
                checked={settings.logging}
                onCheckedChange={(val) => updateSetting('logging', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Verschlüsselung</Label>
              <Switch
                checked={settings.encryption}
                onCheckedChange={(val) => updateSetting('encryption', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Automatisches Aufräumen</Label>
              <Switch
                checked={settings.autoCleanup}
                onCheckedChange={(val) => updateSetting('autoCleanup', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Passwortschutz</Label>
              <Switch
                checked={settings.passwordProtection}
                onCheckedChange={(val) => updateSetting('passwordProtection', val)}
              />
            </div>
          </TabsContent>

          {/* Erweitert */}
          <TabsContent value="advanced" className="p-4 space-y-4">
            <div>
              <Label>Performance Modus</Label>
              <Select
                value={settings.performanceMode}
                onValueChange={(val) => updateSetting('performanceMode', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Performance Modus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="balanced">Ausgeglichen</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>GPU-Beschleunigung</Label>
              <Switch
                checked={settings.gpuAcceleration}
                onCheckedChange={(val) => updateSetting('gpuAcceleration', val)}
              />
            </div>
            <div>
              <Label>RAM-Limit (MB)</Label>
              <Input
                type="number"
                value={settings.ramLimit}
                onChange={(e) => updateSetting('ramLimit', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Beta Features</Label>
              <Switch
                checked={settings.betaFeatures}
                onCheckedChange={(val) => updateSetting('betaFeatures', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Debug Modus</Label>
              <Switch
                checked={settings.debugMode}
                onCheckedChange={(val) => updateSetting('debugMode', val)}
              />
            </div>
            <div>
              <Label>API Endpoint</Label>
              <Input
                value={settings.apiEndpoint}
                onChange={(e) => updateSetting('apiEndpoint', e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end border-t px-4 py-2">
          <Button
            variant="secondary"
            className="mr-2"
            onClick={onClose}
          >
            Abbrechen
          </Button>
          <Button
            onClick={saveSettings}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </div>
    </div>
  );
}
