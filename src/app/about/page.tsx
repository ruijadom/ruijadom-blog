import PageHeader from "@/components/page-header";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { SOCIALS } from "@/constants";
import { Metadata } from "next";
import { Layers, Code2, Smartphone } from "lucide-react";
import s from "@/styles/site.module.css";
export const metadata: Metadata = { title: "About" };
export default function AboutPage() {
  return (
    <div className={s.page}>
      <PageHeader
        title="Behind the code"
        description="The craft matters. So do the people using what we build."
      />
      <div className={s.aboutGrid}>
        <div className={s.profile}>
          <Image src={siteConfig.authorImage} alt="Rui Domingues" priority />
          <span className={s.eyebrow}>HELLO, I’M RUI</span>
          <h2>
            Rui Domingues<span>.</span>
          </h2>
          <p>Software engineer</p>
          <div className={s.socials}>
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.path}
                rel="noreferrer"
                target="_blank"
                aria-label={social.label}
              >
                <social.icon className="size-5" />
              </a>
            ))}
          </div>
        </div>
        <div className={s.biography}>
          <span className={s.eyebrow}>THOUGHTFUL BY DESIGN</span>
          <h2>
            Making complex things
            <br />
            <em>feel simple.</em>
          </h2>
          <p>
            I&apos;m a software engineer with a decade of building products
            that grow without breaking.
          </p>
          <p>
            I work where architecture meets the interface: micro-frontends,
            design systems shared across brands, real-time communication and,
            lately, interfaces where people and AI agents work together.
          </p>
          <p>
            I care about the decisions that last: code that is still easy to
            change on day five hundred, and a clear place to start for whoever
            comes next.
          </p>
          <p>
            This is where I share what I learn, publish tools, and experiment,
            sometimes with a spaceship fighting bugs.
          </p>
        </div>
      </div>
      <div className={s.focusGrid}>
        {[
          {
            icon: Layers,
            title: "Design systems",
            text: "Shared foundations for consistent, accessible product experiences.",
          },
          {
            icon: Code2,
            title: "Frontend architecture",
            text: "Clear boundaries and maintainable code that can grow with a product.",
          },
          {
            icon: Smartphone,
            title: "Web & mobile",
            text: "Responsive interactions that feel considered on every screen.",
          },
        ].map((item) => (
          <div key={item.title}>
            <item.icon size={24} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
