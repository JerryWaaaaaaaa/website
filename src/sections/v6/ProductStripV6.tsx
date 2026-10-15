import './ProductStripV6.css';

const PRODUCTS = [
  { key: 'slides', label: 'Slides' },
  { key: 'sheets', label: 'Sheets' },
  { key: 'datatable', label: 'Data table' },
  { key: 'canvas', label: 'Canvas' },
  { key: 'paper', label: 'Paper' },
  { key: 'hub', label: 'Hub' },
  { key: 'mail', label: 'Mail' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'meeting', label: 'Meeting' },
];

/** V6 product strip (Figma 200:75468): gradient lead line + the full Zoom app row. */
export function ProductStripV6() {
  return (
    <section className="v6-strip" aria-label="The Zoom product family">
      <div className="v6-strip-inner">
        <p className="v6-strip-lead v6-text-gradient">
          Get maximum productivity with the whole Zoom products
        </p>
        <ul className="v6-strip-list" role="list">
          {PRODUCTS.map((p) => (
            <li key={p.key} className="v6-strip-item">
              <img src={`/v6/product-strip/${p.key}.svg`} alt="" width={48} height={48} />
              <span>{p.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
