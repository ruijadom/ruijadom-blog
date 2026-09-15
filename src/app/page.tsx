import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Layers,
  Radio,
  Terminal,
  Rocket,
} from "lucide-react";
import { blogs as allBlogs } from "#site/content";
import ArticleCard from "@/components/article-card";
import s from "@/styles/site.module.css";
export default function Home() {
  const latest = allBlogs
    .filter((blog) => blog.published)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 3);
  return (
    <div className={s.page}>
      <section className={s.hero} id="site-hero">
        <div className={s.heroCopy}>
          <span className={s.eyebrow}>
            <i /> RUI DOMINGUES · FRONTEND ENGINEER
          </span>
          <h1>
            Interfaces with purpose.
            <br />
            <em>Systems built to last.</em>
          </h1>
          <p>
            Exploring the craft behind great software. Notes on frontend
            architecture, design systems, and the details that make an
            experience feel right.
          </p>
          <div className={s.actions}>
            <Link href="/blog" className={s.primary}>
              Explore the writing <ArrowRight size={17} />
            </Link>
            <Link href="/about" className={s.textLink}>
              A little about me <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className={s.disciplines}>
            <span>REACT & TYPESCRIPT</span>
            <span>DESIGN SYSTEMS</span>
            <span>WEB & MOBILE</span>
          </div>
        </div>
        <div className={s.orbitPanel} aria-hidden="true">
          <div className={s.panelCaption}>
            <span>THE ENGINEERING ORBIT</span>
            <span>01 — ∞</span>
          </div>
          <div className={s.orbitScene}>
            <div className={s.orbitRing} />
            <div className={s.orbitRing2} />
            <div className={s.orbitCore}>
              <Code2 size={45} strokeWidth={1} />
            </div>
            <span className={s.orbitNode1}>
              <Layers size={19} /> Design
            </span>
            <span className={s.orbitNode2}>
              <Terminal size={19} /> Build
            </span>
            <span className={s.orbitNode3}>
              <Radio size={19} /> Improve
            </span>
            <i className={s.orbitStar} />
          </div>
          <div className={s.panelFoot}>
            <span>
              <i /> ALWAYS ITERATING
            </span>
            <span>craft → code → impact</span>
          </div>
        </div>
      </section>
      <section className={s.writing}>
        <div className={s.sectionHeading}>
          <div>
            <span className={s.eyebrow}>FROM THE WORKBENCH</span>
            <h2>
              Recent field notes<span>.</span>
            </h2>
          </div>
          <Link href="/blog" className={s.textLink}>
            All articles <ArrowRight size={16} />
          </Link>
        </div>
        {latest.length ? (
          <div className={s.homeArticles}>
            {latest.map((article, index) => (
              <ArticleCard key={article.slug} article={article} index={index} />
            ))}
          </div>
        ) : (
          <p className={s.empty}>New field notes are on the way.</p>
        )}
      </section>
      <section className={s.gameFeature}>
        <div className={s.gameArtwork} aria-hidden="true">
          <div className={s.gameOrbit} />
          <Rocket size={85} strokeWidth={1} />
          <span>
            DEV SPACE
            <br />
            <small>SOFTPHONE ODYSSEY</small>
          </span>
        </div>
        <div className={s.gameCopy}>
          <span className={s.eyebrow}>A DIFFERENT WAY TO EXPLORE</span>
          <h2>
            Good code gets you started.
            <br />
            <em>Good systems keep you going.</em>
          </h2>
          <p>
            Take your softphone from prototype to production. Fix bugs, invest
            in automation, and put the development cycle into play.
          </p>
          <div className={s.actions}>
            <Link href="/game" className={s.primary}>
              Launch Dev Space <ArrowUpRight size={17} />
            </Link>
            <span className={s.gameDuration}>
              4 stages · 2 minutes of flight
            </span>
          </div>
        </div>
      </section>
      <div className={s.exploreGrid}>
        <Link href="/packages">
          <Terminal size={24} />
          <div>
            <h2>Tools from the workshop</h2>
            <p>Open-source packages made to be useful.</p>
          </div>
          <ArrowUpRight size={20} />
        </Link>
        <Link href="/about">
          <Code2 size={24} />
          <div>
            <h2>The person behind the code</h2>
            <p>A little context on how I think and build.</p>
          </div>
          <ArrowUpRight size={20} />
        </Link>
      </div>
    </div>
  );
}
