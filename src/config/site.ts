import authorAvatar from "../../public/images/author/ruijadom.png";
export const siteConfig = {
  name: "@ruijadom",
  description: "Crafting responsive and scalable front-end architectures",
  author: "ruijadom",
  authorImage: authorAvatar,
  social: {
    github: "https://github.com/ruijadom",
    linkedin: "https://www.linkedin.com/in/ruijadomingues/",
  },
  comments: {
    repo: "ruijadom/ruijadom-blog" as `${string}/${string}`,
    repoId: "R_kgDONC_g5Q",
    category: "Announcements",
    categoryId: "DIC_kwDONC_g5c4DHHfr",
  },
};

export type SiteConfig = typeof siteConfig;
