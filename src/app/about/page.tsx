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
          <p>Frontend engineer</p>
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
            I build interfaces that help people get things done. My work
            connects frontend architecture, design systems, and the small
            interaction details that make a product intuitive.
          </p>
          <p>
            Across web and mobile, I care about performance, accessibility and
            maintainability. A good interface should work well today and give
            the next developer a clear place to start tomorrow.
          </p>
          <p>
            This is my space to share what I learn, publish useful tools, and
            experiment with ideas — sometimes in the form of a spaceship
            fighting bugs.
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
