type Row = { name: string; price: number };
type Props = { data: any };
export default function PriceBoardBanner({ data }: Props) {
  const { title, rows = [], note } = data || {};
  return (
    <div data-template="price-board" className="tpl full">
      <div className="board">
        {title && <h1 className="title">{title}</h1>}
        <div className="rows">
          {Array.isArray(rows) && rows.map((r: Row, i: number) => (
            <div className="row" key={i}>
              <span className="name">{r.name}</span>
              <span className="dots" />
              <span className="price">{Number(r.price).toFixed(2)} лв</span>
            </div>
          ))}
        </div>
        {note && <div className="note">{note}</div>}
      </div>
    </div>
  );
}
