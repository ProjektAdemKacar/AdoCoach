"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  UtensilsCrossed,
  Droplets,
  Dumbbell,
  MessageCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: CalendarDays, label: "Plan" },
  { href: "/nutrition", icon: UtensilsCrossed, label: "Essen" },
  { href: "/hydration", icon: Droplets, label: "Wasser" },
  { href: "/sport", icon: Dumbbell, label: "Sport" },
  { href: "/chat", icon: MessageCircle, label: "Coach" },
  { href: "/profile", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-300",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-primary/10 glow-sm animate-scale-in" />
              )}
              <item.icon
                className={cn(
                  "relative h-5 w-5 transition-transform duration-300",
                  isActive && "scale-110 stroke-[2.5]"
                )}
              />
              <span className={cn("relative text-[10px]", isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
