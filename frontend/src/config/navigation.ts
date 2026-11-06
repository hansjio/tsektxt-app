import { BarChart3, BookOpen, Bookmark, Clock3, Home, Sparkles } from "lucide-react";

export const marketingNavigation = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/methodology", label: "Methodology" },
  { href: "/privacy", label: "Privacy" },
];

export const appNavigation = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/checker", label: "New analysis", icon: Sparkles },
  { href: "/dashboard/history", label: "History", icon: Clock3 },
  { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
  { href: "/dashboard/methods", label: "Methods", icon: BookOpen },
];

export const dashboardStats = [
  { label: "Total analyses", key: "total", icon: BarChart3, imageSrc: "/caps-illus/dashboard/total-analyses.svg" },
  { label: "All 3: credible", key: "credible", icon: BarChart3, imageSrc: "/caps-illus/dashboard/not-suspicious.svg" },
  { label: "All 3: not credible", key: "notCredible", icon: BarChart3, imageSrc: "/caps-illus/dashboard/highly-suspicious.svg" },
  { label: "Models disagree", key: "uncertain", icon: BarChart3, imageSrc: "/caps-illus/dashboard/suspicious.svg" },
] as const;
