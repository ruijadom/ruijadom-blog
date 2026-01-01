import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { Book, User, Package, Gamepad2 } from "lucide-react";

export const NAV_LIST = [
  { label: "Blog", path: "/blog", icon: Book },
  { label: "Packages", path: "/packages", icon: Package },
  { label: "Play", path: "/#play", icon: Gamepad2 },
  { label: "About", path: "/about", icon: User },
];

export const SOCIALS = [
  { label: "Github", path: siteConfig.social.github, icon: Icons.github },
  { label: "linkedin", path: siteConfig.social.linkedin, icon: Icons.linkedin },
];
