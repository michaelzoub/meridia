/** 28×28 viewBox icons: fill #e8b87a, stroke #c9722a, stroke-width 1 */

const COMMON = {
  fill: "#e8b87a",
  stroke: "#c9722a",
  strokeWidth: 1 as const,
} as const;

export function ResourcePoolIcons() {
  const items = [
    {
      title: "Energy",
      node: (
        <path
          {...COMMON}
          d="M14 4 L20 14 H16 L17 22 L10 11 H14 Z"
          strokeLinejoin="round"
        />
      ),
    },
    {
      title: "Focus blocks",
      node: (
        <>
          <rect {...COMMON} x="7" y="8" width="6" height="12" />
          <rect {...COMMON} x="15" y="5" width="6" height="15" />
        </>
      ),
    },
    {
      title: "Time windows",
      node: (
        <>
          <circle {...COMMON} cx="14" cy="14" r="9" />
          <line
            stroke={COMMON.stroke}
            strokeWidth={COMMON.strokeWidth}
            x1="14"
            y1="14"
            x2="14"
            y2="8"
          />
          <circle cx="14" cy="8" r="1.2" fill={COMMON.stroke} stroke="none" />
        </>
      ),
    },
    {
      title: "Context stack",
      node: (
        <>
          <rect {...COMMON} x="6" y="16" width="16" height="5" />
          <rect {...COMMON} x="8" y="11" width="12" height="5" />
          <rect {...COMMON} x="10" y="6" width="8" height="5" />
        </>
      ),
    },
    {
      title: "Buffer",
      node: (
        <>
          <line {...COMMON} x1="6" y1="14" x2="22" y2="14" strokeLinecap="round" />
          <path
            d="M10 18 L14 10 L18 18"
            fill="none"
            stroke={COMMON.stroke}
            strokeWidth={COMMON.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle {...COMMON} cx="6" cy="14" r="2" />
          <circle {...COMMON} cx="22" cy="14" r="2" />
        </>
      ),
    },
    {
      title: "Routing",
      node: (
        <>
          <circle {...COMMON} cx="8" cy="14" r="3" />
          <circle {...COMMON} cx="20" cy="14" r="3" />
          <line
            stroke={COMMON.stroke}
            strokeWidth={COMMON.strokeWidth}
            strokeLinecap="round"
            x1="11"
            y1="14"
            x2="17"
            y2="14"
          />
          <polyline
            fill="none"
            stroke={COMMON.stroke}
            strokeWidth={COMMON.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            points="16,11 19,14 16,17"
          />
        </>
      ),
    },
    {
      title: "Signal",
      node: (
        <>
          <path
            fill="none"
            stroke={COMMON.stroke}
            strokeWidth={COMMON.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 18 L9 12 L13 17 L17 9 L21 13"
          />
          <circle {...COMMON} cx="5" cy="18" r="1.8" />
          <circle {...COMMON} cx="21" cy="13" r="1.8" />
        </>
      ),
    },
    {
      title: "Pool",
      node: (
        <>
          <path
            fill="none"
            stroke={COMMON.stroke}
            strokeWidth={COMMON.strokeWidth}
            strokeLinecap="round"
            d="M6 20 C10 14 18 14 22 20"
          />
          <line
            stroke={COMMON.stroke}
            strokeWidth={COMMON.strokeWidth}
            strokeLinecap="round"
            x1="7"
            y1="20"
            x2="21"
            y2="20"
          />
          <ellipse {...COMMON} cx="10" cy="11" rx="2" ry="2.5" />
          <ellipse {...COMMON} cx="14" cy="10" rx="2" ry="2.8" />
          <ellipse {...COMMON} cx="18" cy="11" rx="2" ry="2.5" />
        </>
      ),
    },
  ];

  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-5">
      {items.map(({ title, node }) => (
        <div
          key={title}
          className="flex flex-col items-center gap-2"
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#9a6b3a",
          }}
        >
          <svg width={28} height={28} viewBox="0 0 28 28" aria-hidden>
            {node}
          </svg>
          <span className="max-w-[76px] text-center leading-snug">{title}</span>
        </div>
      ))}
    </div>
  );
}
