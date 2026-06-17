"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Dumbbell,
  Droplets,
  UtensilsCrossed,
  MessageCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: CalendarDays, label: "Home" },
  { href: "/sport", icon: Dumbbell, label: "Workout" },
  { href: "/nutrition", icon: UtensilsCrossed, label: "Food" },
  { href: "/hydration", icon: Droplets, label: "Wasser" },
  { href: "/chat", icon: MessageCircle, label: "Coach" },
  { href: "/profile", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-lg">
        <div className="mx-3 mb-3 rounded-2xl glass-strong px-1 py-1">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs transition-all duration-300",
                    isActive
                      ? "text-neon"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full gradient-neon" />
                  )}
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive && "scale-110 drop-shadow-[0_0_6px_rgba(0,230,118,0.5)]"
                    )}
                  />
                  <span className={cn(
                    "text-[9px] tracking-wide",
                    isActive && "font-bold"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
