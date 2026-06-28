import { Link, useLocation } from "wouter";
import {
  Crosshair, Car, Lock, Users, Target,
  Plane, Home as Garage, Building, ShoppingCart,
  Users2, Trophy, Activity, MessageSquare, Bell,
  User, Settings, HelpCircle, LogOut, Crown, X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const navGroups = [
    {
      title: "MAIN",
      items: [
        { label: "Crimes", href: "/crimes", icon: Crosshair },
        { label: "Car Theft", href: "/car-theft", icon: Car },
        { label: "Heist", href: "/heist", icon: Lock },
        { label: "Group Crimes", href: "/group-crimes", icon: Users },
        { label: "Missions", href: "/missions", icon: Target },
      ]
    },
    {
      title: "CITY",
      items: [
        { label: "Travel", href: "/travel", icon: Plane },
        { label: "Garage", href: "/garage", icon: Garage },
        { label: "Properties", href: "/properties", icon: Building },
        { label: "Black Market", href: "/black-market", icon: ShoppingCart },
      ]
    },
    {
      title: "COMMUNITY",
      items: [
        { label: "Family", href: "/family", icon: Users2 },
        { label: "Rankings", href: "/rankings", icon: Trophy },
        { label: "Activity", href: "/activity", icon: Activity },
        { label: "Messages", href: "/messages", icon: MessageSquare },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ]
    },
    {
      title: "ACCOUNT",
      items: [
        { label: "My Account", href: "/account", icon: User },
        { label: "Settings", href: "/settings", icon: Settings },
        { label: "Support", href: "/support", icon: HelpCircle },
        { label: "Log Out", href: "/logout", icon: LogOut },
      ]
    }
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
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 border-t border-sidebar-border/50 mt-auto">
        <p className="text-xs text-center text-muted-foreground font-medium tracking-widest">
          UNDERWORLD IS YOURS
        </p>
      </div>
    </aside>
  );
}
