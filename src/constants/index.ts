import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { Book, User } from "lucide-react";

export const NAV_LIST = [
  { label: "Blog", path: "/blog", icon: Book },
  { label: "About", path: "/about", icon: User },
];

export const SOCIALS = [
  { label: "Github", path: siteConfig.social.github, icon: Icons.github },
  { label: "linkedin", path: siteConfig.social.linkedin, icon: Icons.linkedin },
];
