import { PropsWithChildren } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import SiteHeader from "@/components/site-header";
import { siteConfig } from "@/config/site";
import s from "@/styles/site.module.css";

export default function App({ children }: PropsWithChildren) {
  return (
    <div className={s.shell}>
      <a className={s.skip} href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={s.content}>
        {children}
      </main>
      <footer className={s.footer}>
        <div>
          <Link href="/" className={s.wordmark}>
            <Image
              src="/icon.ico"
              alt=""
              width={28}
              height={28}
              unoptimized
              className={s.brandIcon}
            />{" "}
            ruijadom
            <span className={s.markDot}>.</span>
          </Link>
          <p>Thoughtful interfaces. Resilient systems.</p>
        </div>
        <div className={s.footerLinks}>
          <a href={siteConfig.social.github} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={14} />
          </a>
          <a href={siteConfig.social.linkedin} target="_blank" rel="noreferrer">
            LinkedIn <ArrowUpRight size={14} />
          </a>
          <span>© {new Date().getFullYear()} Rui Domingues</span>
        </div>
      </footer>
    </div>
  );
}
