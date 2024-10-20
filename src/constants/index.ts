import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site";

export const NAV_LIST = [
  { label: "Blog", path: "/blog", icon: null },
  { label: "About", path: "/about", icon: null },
];

export const SOCIALS = [
  { label: "Github", path: siteConfig.social.github, icon: Icons.github },
  { label: "linkedin", path: siteConfig.social.linkedin, icon: Icons.linkedin },
];
