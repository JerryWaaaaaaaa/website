type Wordmark = {
  name: string;
  /* Optional monogram tile shown before the name (echoes the source logos
     without shipping third-party brand assets). */
  monogram?: string;
  tile?: string;
};

function Wordmark({ name, monogram, tile }: Wordmark) {
  return (
    <span className="pm-wordmark">
      {monogram && (
        <span className="pm-wordmark-tile" style={tile ? { background: tile } : undefined}>
          {monogram}
        </span>
      )}
      {name}
    </span>
  );
}

export function PositioningMatrix() {
  return (
    <section className="section-full pm-section">
      <PositioningMatrixStage />
    </section>
  );
}

export function PositioningMatrixStage() {
  return (
    <div className="pm-stage" role="img" aria-label="Positioning matrix: asset depth versus initialization efficiency">
        {/* Axes + trajectory layer */}
        <svg
          className="pm-axes"
          viewBox="0 0 1024 630"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="pm-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" fill="var(--color-blue)" />
            </marker>
          </defs>

          {/* Horizontal axis */}
          <line
            x1="200"
            y1="330"
            x2="915"
            y2="330"
            stroke="var(--color-blue)"
            strokeWidth="2"
            markerEnd="url(#pm-arrow)"
          />
          {/* Vertical axis */}
          <line
            x1="520"
            y1="560"
            x2="520"
            y2="90"
            stroke="var(--color-blue)"
            strokeWidth="2"
            markerEnd="url(#pm-arrow)"
          />
        </svg>

        {/* Axis titles */}
        <span className="pm-axis-title pm-axis-title--y">Asset Depth</span>
        <span className="pm-axis-title pm-axis-title--x">Initialization Efficiency</span>

        {/* Axis end labels */}
        <span className="pm-axis-end pm-end-top">System asset</span>
        <span className="pm-axis-end pm-end-bottom">One-time draft</span>
        <span className="pm-axis-end pm-end-left">Manual</span>
        <span className="pm-axis-end pm-end-right">AI-generated</span>

        {/* Quadrant: Office Suite (top-left) */}
        <div className="pm-group pm-group--office">
          <span className="pm-group-heading">Office Suite</span>
          <div className="pm-card">
            <Wordmark name="Excel" monogram="X" tile="#1d6f42" />
            <Wordmark name="Google" monogram="G" tile="#4285f4" />
            <Wordmark name="Zoho" />
          </div>
        </div>

        {/* Quadrant: Zoom Productivity Suite (top-right) — site logo, accent card */}
        <div className="pm-group pm-group--zoom">
          <div className="pm-card pm-card--accent">
            <img
              className="pm-zoom-logo"
              src="/zm-prod-suite-stacked-color01.svg"
              alt="Zoom Productivity Suite"
            />
          </div>
        </div>

        {/* Quadrant: General AI Generation (bottom-right) */}
        <div className="pm-group pm-group--ai">
          <span className="pm-group-heading">General AI Generation</span>
          <div className="pm-card">
            <Wordmark name="manus" monogram="m" tile="#222222" />
            <Wordmark name="Genspark" monogram="G" tile="#0c5cff" />
          </div>
        </div>

        {/* Ecosystem Plugins (bottom-center) */}
        <div className="pm-group pm-group--plugins">
          <span className="pm-group-heading">Ecosystem Plugins</span>
          <div className="pm-card pm-card--stacked">
            <Wordmark name="Claude by Anthropic" monogram="✳" tile="#d97757" />
            <span className="pm-card-sub">in Excel</span>
          </div>
        </div>
    </div>
  );
}
