import { useEffect, useState, useCallback } from "react";
import { useGetDailyReward } from "@workspace/api-client-react";

interface NotificationSettings {
  enabled: boolean;
  dailyReward: boolean;
  energyFull: boolean;
  nerveRegen: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  dailyReward: true,
  energyFull: true,
  nerveRegen: true,
};

const STORAGE_KEY = "uw-notification-settings";

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const { data: dailyReward } = useGetDailyReward();

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) return false;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      updateSetting("enabled", true);
      return true;
    }
    return false;
  };

  const checkAndNotify = useCallback(() => {
    if (!settings.enabled || Notification.permission !== "granted") return;

    if (settings.dailyReward && dailyReward?.canClaim) {
      new Notification("Daily Reward Ready!", {
        body: "Your daily reward is waiting for you in Underworld.",
        icon: "/favicon.svg",
      });
    }
  }, [settings, dailyReward]);

  useEffect(() => {
    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, [checkAndNotify]);

  return {
    notifyEnabled: settings.enabled && Notification.permission === "granted",
    requestPermission,
    settings,
    updateSetting,
  };
}
