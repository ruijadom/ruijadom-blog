import s from "@/styles/site.module.css";
interface PageHeaderProps {
  title: string;
  description?: string;
}
export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className={s.pageHeader}>
      <span className={s.eyebrow}>RUI DOMINGUES / {title.toUpperCase()}</span>
      <h1>
        {title}
        <span>.</span>
      </h1>
      {description && <p>{description}</p>}
    </div>
  );
}
