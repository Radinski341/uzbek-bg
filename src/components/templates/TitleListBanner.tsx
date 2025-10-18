type Props = { data: any };
export default function TitleListBanner({ data }: Props) {
  const { title, items = [], image, accent = "amber" } = data || {};
  return (
    <div data-template="title-list" className={`tpl full accent-${accent}`}>
      {image && <img className="side" src={image} alt="side" />}
      <div className="panel">
        {title && <h1 className="title">{title}</h1>}
        <ul className="items">
          {Array.isArray(items) && items.map((t: string, i: number) => <li key={i} className="item">{t}</li>)}
        </ul>
      </div>
    </div>
  );
}
