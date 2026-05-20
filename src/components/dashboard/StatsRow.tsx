"use client";

import { motion } from "framer-motion";
import { Calendar, Ticket, Users, TrendingUp } from "lucide-react";

export interface StatItem {
  label: string;
  value: string;
  icon: "calendar" | "ticket" | "users" | "trending";
}

const ICON_MAP = {
  calendar: Calendar,
  ticket: Ticket,
  users: Users,
  trending: TrendingUp,
};

export function StatsRow({ stats }: { stats: StatItem[] }) {
  return (
    <div
      style={{ gap: 16 }}
      className="grid grid-cols-2 md:grid-cols-4"
    >
      {stats.map((stat, i) => {
        const Icon = ICON_MAP[stat.icon];
        return (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: i * 0.08,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              background: "var(--surface)",
              borderRadius: 16,
              padding: "20px 22px",
              boxShadow: "var(--tier-1)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Icon circle */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--accent-tint-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={17} color="var(--accent)" strokeWidth={2.2} />
            </div>

            {/* Value + label */}
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "var(--text)",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-3)",
                  marginTop: 5,
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
