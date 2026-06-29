import { Link, useLocation } from "wouter";
import {
  Crosshair, Car, Lock, Users, Target,
  Plane, Home as Garage, Building, ShoppingCart,
  Users2, Trophy, Activity, MessageSquare, Bell,
  User, Settings, HelpCircle, LogOut, Crown, X, ShieldOff
} from "lucide-react";
import { useGetJailStatus, useGetPlayer } from "@workspace/api-client-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { data: jailStatus } = useGetJailStatus();
  const { data: player } = useGetPlayer();

  const inJail = !!(jailStatus?.inJail);
  const hasUnreadMessages = false; // placeholder

  const navGroups = [
    {
      title: "MAIN",
      items: [
        {
          label: "Crimes",
          href: "/crimes",
          icon: Crosshair,
          badge: inJail ? "JAILED" : undefined,
          badgeColor: "bg-red-600",
        },
        { label: "Car Theft", href: "/car-theft", icon: Car },
        { label: "Heist", href: "/heist", icon: Lock },
        { label: "Group Crimes", href: "/group-crimes", icon: Users },
        { label: "Missions", href: "/missions", icon: Target },
      ],
    },
    {
      title: "CITY",
      items: [
        { label: "Travel", href: "/travel", icon: Plane },
        { label: "Garage", href: "/garage", icon: Garage },
        { label: "Properties", href: "/properties", icon: Building },
        { label: "Black Market", href: "/black-market", icon: ShoppingCart },
      ],
    },
    {
      title: "COMMUNITY",
      items: [
        { label: "Family", href: "/family", icon: Users2 },
        { label: "Rankings", href: "/rankings", icon: Trophy },
        { label: "Activity", href: "/activity", icon: Activity },
        { label: "Messages", href: "/messages", icon: MessageSquare },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { label: "My Account", href: "/account", icon: User },
        { label: "Settings", href: "/settings", icon: Settings },
        { label: "Support", href: "/support", icon: HelpCircle },
        { label: "Log Out", href: "/logout", icon: LogOut },
      ],
    },
  ];

  return (
    <aside
      className={`
        w-64 bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0 flex flex-col overflow-y-auto z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      <div className="p-5 flex items-center justify-between border-b border-sidebar-border/50 shrink-0">
        <Link href="/" onClick={onClose} className="flex items-center gap-3 cursor-pointer">
          <Crown className="w-7 h-7 text-primary shrink-0" />
          <span className="text-xl font-bold tracking-widest text-primary">UNDERWORLD</span>
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-close-sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Jail Alert Banner */}
      {inJail && (
        <Link
          href="/jail"
          onClick={onClose}
          className="mx-3 mt-3 flex items-center gap-2 bg-red-950/60 border border-red-500/40 rounded-md px-3 py-2.5 hover:bg-red-950/80 transition-colors"
        >
          <ShieldOff className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider">In Jail</p>
            <p className="text-[10px] text-red-300/70 truncate">Tap to bail out or bust free</p>
          </div>
        </Link>
      )}

      <div className="flex-1 py-4">
        {navGroups.map((group, idx) => (
          <div key={idx} className="mb-5 px-4">
            <h3 className="text-xs font-bold text-muted-foreground tracking-widest mb-2 px-2">
              {group.title}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item, itemIdx) => {
                const isActive = location === item.href || (location === "/" && item.href === "/");
                const Icon = item.icon;
                const badge = (item as any).badge;
                const badgeColor = (item as any).badgeColor ?? "bg-primary";
                return (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    onClick={onClose}
                    data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {badge && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${badgeColor} text-white tracking-wider`}>
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Jail nav item */}
        <div className="px-4 mb-5">
          <h3 className="text-xs font-bold text-muted-foreground tracking-widest mb-2 px-2">STATUS</h3>
          <Link
            href="/jail"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              location === "/jail"
                ? "bg-primary/10 text-primary"
                : inJail
                ? "text-red-400 hover:bg-red-950/30"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <ShieldOff className={`w-4 h-4 shrink-0 ${inJail ? "animate-pulse" : ""}`} />
            <span className="text-sm font-medium flex-1">Jail</span>
            {inJail && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-600 text-white tracking-wider">
                LOCKED
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="p-5 border-t border-sidebar-border/50 mt-auto">
        <p className="text-xs text-center text-muted-foreground font-medium tracking-widest">
          UNDERWORLD IS YOURS
        </p>
      </div>
    </aside>
  );
}
