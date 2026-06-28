import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { Bell, ShieldAlert, Zap, Trophy, History, CheckCircle2 } from "lucide-react";

export default function Notifications() {
  const { notifyEnabled, requestPermission, settings, updateSetting } = useNotifications();

  const handleToggleAll = async (checked: boolean) => {
    if (checked && !notifyEnabled) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    updateSetting("enabled", checked);
  };

  const mockHistory = [
    {
      id: 1,
      title: "Crime Successful",
      body: "You successfully mugged a tourist for $500.",
      time: "2 minutes ago",
      type: "success",
    },
    {
      id: 2,
      title: "Daily Reward",
      body: "Your daily reward is ready to claim!",
      time: "1 hour ago",
      type: "reward",
    },
    {
      id: 3,
      title: "Energy Full",
      body: "Your energy has been fully restored.",
      time: "3 hours ago",
      type: "energy",
    },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black tracking-widest text-primary uppercase">
            Notifications
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-bold tracking-widest uppercase">
                  Push Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold uppercase tracking-wider">
                      Enable Game Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive alerts even when you are not playing.
                    </p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={handleToggleAll}
                    data-testid="switch-notifications-enabled"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                    Notification Types
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-4 h-4 text-primary" />
                        <Label className="text-sm">Daily Reward Ready</Label>
                      </div>
                      <Switch
                        checked={settings.dailyReward}
                        onCheckedChange={(v) => updateSetting("dailyReward", v)}
                        disabled={!settings.enabled}
                        data-testid="switch-notify-daily"
                      />
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <Label className="text-sm">Energy Full</Label>
                      </div>
                      <Switch
                        checked={settings.energyFull}
                        onCheckedChange={(v) => updateSetting("energyFull", v)}
                        disabled={!settings.enabled}
                        data-testid="switch-notify-energy"
                      />
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <Label className="text-sm">Nerve Regenerated</Label>
                      </div>
                      <Switch
                        checked={settings.nerveRegen}
                        onCheckedChange={(v) => updateSetting("nerveRegen", v)}
                        disabled={!settings.enabled}
                        data-testid="switch-notify-nerve"
                      />
                    </div>
                  </div>
                </div>

                {!notifyEnabled && settings.enabled && (
                  <Button
                    className="w-full text-xs font-bold tracking-widest uppercase"
                    variant="outline"
                    onClick={requestPermission}
                  >
                    Request Browser Permission
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <History className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-sm font-bold tracking-widest uppercase">
                Notification History
              </h2>
            </div>
            <div className="space-y-3">
              {mockHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-card border border-border/50 rounded-lg flex gap-4 items-start hover:border-primary/30 transition-colors"
                  data-testid={`notification-history-${item.id}`}
                >
                  <div className="mt-1">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center gap-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
