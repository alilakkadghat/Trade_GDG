"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { useState } from "react";

type TooltipDirection = "right" | "left" | "top" | "bottom" | "center" | "auto";

const HIGH_COLOR = "#ff4d4d";
const LOW_COLOR  = "#4ade80";

/* ── fly-to helper (must live inside MapContainer) ── */
function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  if (target) map.flyTo(target, 6, { duration: 1.2 });
  return null;
}

/* ── fly-to selected signal ── */
function FlyToSelected({ selected }: { selected: any }) {
  const map = useMap();

  if (selected) {
    const coords: [number, number] = [
      selected.lat || 20,
      selected.lng || 0,
    ];

    map.flyTo(coords, 5, { duration: 1.2 });
  }

  return null;
}

export default function Map({ ports, selected }: { ports: any[]; selected?: any }) {
  const highRisk = ports.filter((p) => p.risk === "HIGH").length;
  const lowRisk  = ports.filter((p) => p.risk !== "HIGH").length;

  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  function handleSidebarClick(port: any, i: number) {
    setFlyTarget([port.lat, port.lng]);
    setActiveIdx(i);
  }

  const tickerItems = [
    ...ports.map((p: any) => ({ label: `${p.port} · Risk ${p.risk}`, kind: p.risk === "HIGH" ? "high" : "low" })),
    { label: "Red Sea corridor · Elevated disruption",         kind: "high"    },
    { label: "Strait of Hormuz · Monitoring active",           kind: "neutral" },
    { label: "Cape of Good Hope reroutes · +14% volume",       kind: "neutral" },
    { label: "Singapore throughput · 42,100 TEU/hr",           kind: "low"     },
    { label: "Mumbai → Dubai ETA · 14h nominal",               kind: "low"     },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── shell ── */
        .prm-wrapper {
          font-family: 'DM Sans', sans-serif;
          background: #0a1a0f;
          height: 100vh;
          color: #e8f0ea;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── top bar ── */
        .prm-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 32px;
          border-bottom: 1px solid rgba(74,222,128,0.12);
          background: rgba(10,26,15,0.97);
          backdrop-filter: blur(12px);
          flex-shrink: 0;
          z-index: 1100;
        }
        .prm-logo { display: flex; align-items: center; gap: 12px; }
        .prm-logo-box {
          width: 36px; height: 36px;
          background: #1c3a22; border: 1px solid rgba(74,222,128,0.3); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: #4ade80;
        }
        .prm-logo-text  { display: flex; flex-direction: column; line-height: 1; }
        .prm-logo-name  { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #e8f0ea; letter-spacing: .02em; }
        .prm-logo-sub   { font-size: 10px; color: #4ade80; letter-spacing: .12em; text-transform: uppercase; margin-top: 2px; }
        .prm-topbar-right { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 500; color: #6b8f72; letter-spacing: .08em; text-transform: uppercase; }
        .prm-live-dot { width: 6px; height: 6px; background: #4ade80; border-radius: 50%; animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }

        /* ── content row ── */
        .prm-content { display: flex; flex: 1; min-height: 0; }

        /* ── sidebar ── */
        .prm-sidebar {
          width: 272px; flex-shrink: 0;
          border-right: 1px solid rgba(74,222,128,0.1);
          background: #060e08;
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .prm-sidebar-head {
          padding: 22px 20px 14px;
          border-bottom: 1px solid rgba(74,222,128,0.08);
          flex-shrink: 0;
        }
        .prm-sidebar-eyebrow { font-size: 10px; font-weight: 500; color: #4ade80; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 4px; }
        .prm-sidebar-title   { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #e8f0ea; }

        .prm-stat-row { display: flex; gap: 8px; padding: 14px 16px; border-bottom: 1px solid rgba(74,222,128,0.08); flex-shrink: 0; }
        .prm-mini-stat { flex:1; background:#0f2416; border:1px solid rgba(74,222,128,0.1); border-radius:10px; padding:10px 12px; }
        .prm-mini-label { font-size: 9px; font-weight: 500; color: #4a7a54; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 3px; }
        .prm-mini-val   { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; line-height: 1; }
        .prm-mini-val.r { color: #ff4d4d; }
        .prm-mini-val.g { color: #4ade80; }
        .prm-mini-val.w { color: #e8f0ea; }

        .prm-port-list {
          overflow-y: auto; flex: 1; padding: 10px 10px;
          scrollbar-width: thin; scrollbar-color: #1c3a22 transparent;
        }
        .prm-port-list::-webkit-scrollbar { width: 3px; }
        .prm-port-list::-webkit-scrollbar-thumb { background: #1c3a22; border-radius: 4px; }

        .prm-port-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px; cursor: pointer;
          border: 1px solid transparent; margin-bottom: 3px;
          transition: background .15s, border-color .15s;
        }
        .prm-port-row:hover  { background: #0f2416; border-color: rgba(74,222,128,0.1); }
        .prm-port-row.active { background: #122b18; border-color: rgba(74,222,128,0.22); }
        .prm-port-led { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .prm-port-info { flex: 1; min-width: 0; }
        .prm-port-name    { font-size: 13px; font-weight: 500; color: #d4e8d8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .prm-port-country { font-size: 10px; color: #4a7a54; letter-spacing: .05em; text-transform: uppercase; margin-top: 1px; }
        .prm-port-badge {
          font-size: 9px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase;
          padding: 2px 7px; border-radius: 20px; flex-shrink: 0;
        }
        .prm-port-badge.h { background: rgba(255,77,77,.12); color: #ff4d4d; border: 1px solid rgba(255,77,77,.22); }
        .prm-port-badge.l { background: rgba(74,222,128,.10); color: #4ade80; border: 1px solid rgba(74,222,128,.22); }

        /* ── right panel ── */
        .prm-right { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }

        .prm-map-area { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 24px 24px 0; }

        .prm-header { margin-bottom: 18px; flex-shrink: 0; }
        .prm-eyebrow  { font-size: 11px; font-weight: 500; color: #4ade80; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 6px; }
        .prm-title    { font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800; color: #e8f0ea; line-height: 1.1; margin-bottom: 4px; }
        .prm-title span { color: #4ade80; }
        .prm-subtitle { font-size: 13px; color: #6b8f72; font-weight: 300; }

        .prm-map-card {
          flex: 1; min-height: 0;
          border: 1px solid rgba(74,222,128,0.14); border-bottom: none;
          border-radius: 14px 14px 0 0;
          overflow: hidden; background: #0f2416;
          display: flex; flex-direction: column;
        }
        .prm-map-card-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 20px;
          border-bottom: 1px solid rgba(74,222,128,0.1);
          flex-shrink: 0;
        }
        .prm-map-card-title { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; color:#c8deca; letter-spacing:.06em; text-transform:uppercase; }
        .prm-legend { display:flex; align-items:center; gap:16px; }
        .prm-legend-item { display:flex; align-items:center; gap:6px; font-size:11px; color:#6b8f72; }
        .prm-legend-dot  { width:7px; height:7px; border-radius:50%; }

        /* leaflet */
        .prm-map-card .leaflet-container { background:#0d1f12 !important; flex:1; width:100%; height:100%; min-height:300px; }
        .prm-map-card .leaflet-tile { filter:invert(1) hue-rotate(148deg) brightness(0.35) saturate(0.6); }
        .prm-map-card .leaflet-control-zoom { border:1px solid rgba(74,222,128,0.2)!important; border-radius:8px!important; overflow:hidden; }
        .prm-map-card .leaflet-control-zoom a { background:#0f2416!important; color:#4ade80!important; border-bottom:1px solid rgba(74,222,128,0.15)!important; width:32px!important; height:32px!important; line-height:32px!important; }
        .prm-map-card .leaflet-control-zoom a:hover { background:#1a3d22!important; }
        .leaflet-popup-content-wrapper { background:#0f2416!important; border:1px solid rgba(74,222,128,0.2)!important; border-radius:10px!important; box-shadow:0 8px 32px rgba(0,0,0,.6)!important; color:#e8f0ea!important; padding:0!important; }
        .leaflet-popup-content { margin:0!important; padding:14px 18px!important; }
        .leaflet-popup-tip { background:#0f2416!important; }
        .leaflet-popup-close-button { color:#4a7a54!important; font-size:18px!important; top:8px!important; right:8px!important; }
        .leaflet-tooltip { background:#0a1a0f!important; border:1px solid rgba(74,222,128,0.25)!important; color:#c8deca!important; font-family:'DM Sans',sans-serif!important; font-size:11px!important; font-weight:500!important; border-radius:6px!important; padding:4px 9px!important; box-shadow:0 4px 12px rgba(0,0,0,.5)!important; letter-spacing:.04em; text-transform:uppercase; }
        .leaflet-tooltip::before { display:none; }
        .leaflet-control-attribution { background:rgba(10,26,15,.7)!important; color:#2a4a30!important; font-size:9px!important; }
        .leaflet-control-attribution a { color:#3a6a40!important; }

        .pm-popup-port    { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#e8f0ea; margin-bottom:2px; }
        .pm-popup-country { font-size:11px; color:#6b8f72; letter-spacing:.06em; text-transform:uppercase; margin-bottom:10px; }
        .pm-popup-risk    { display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:500; letter-spacing:.08em; text-transform:uppercase; padding:3px 10px; border-radius:20px; }
        .pm-popup-risk.high { background:rgba(255,77,77,.12); color:#ff4d4d; border:1px solid rgba(255,77,77,.25); }
        .pm-popup-risk.low  { background:rgba(74,222,128,.10); color:#4ade80; border:1px solid rgba(74,222,128,.25); }
        .pm-popup-risk-dot  { width:5px; height:5px; border-radius:50%; background:currentColor; }

        /* ── ticker ── */
        .prm-ticker {
          flex-shrink: 0;
          background: #040a06;
          border-top: 1px solid rgba(74,222,128,0.09);
          padding: 9px 0;
          overflow: hidden;
          position: relative;
        }
        .prm-ticker::before,
        .prm-ticker::after {
          content:''; position:absolute; top:0; bottom:0; width:72px; z-index:2; pointer-events:none;
        }
        .prm-ticker::before { left:0;  background:linear-gradient(to right,#040a06,transparent); }
        .prm-ticker::after  { right:0; background:linear-gradient(to left, #040a06,transparent); }

        .prm-ticker-track {
          display: flex; width: max-content;
          animation: ticker 42s linear infinite;
        }
        .prm-ticker-track:hover { animation-play-state: paused; }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        .prm-tick-item {
          display: flex; align-items: center; gap: 7px;
          padding: 0 28px;
          font-size: 11px; font-weight: 500; color: #5a7a60;
          letter-spacing: .06em; white-space: nowrap;
          border-right: 1px solid rgba(74,222,128,0.07);
        }
        .prm-tick-dot { width:5px; height:5px; border-radius:50%; }
        .prm-tick-dot.high    { background:#ff4d4d; }
        .prm-tick-dot.low     { background:#4ade80; }
        .prm-tick-dot.neutral { background:#3a5a40; }
      `}</style>

      <div className="prm-wrapper">

        {/* top bar */}
        <div className="prm-topbar">
          <div className="prm-logo">
            <div className="prm-logo-box">T</div>
            <div className="prm-logo-text">
              <span className="prm-logo-name">TradeBot</span>
              <span className="prm-logo-sub">Export Intelligence</span>
            </div>
          </div>
          <div className="prm-topbar-right">
            <div className="prm-live-dot" />
            Live · Global Trade Net
          </div>
        </div>

        {/* content */}
        <div className="prm-content">

          {/* sidebar */}
          <div className="prm-sidebar">
            <div className="prm-sidebar-head">
              <div className="prm-sidebar-eyebrow">· Ports</div>
              <div className="prm-sidebar-title">Port Directory</div>
            </div>

            <div className="prm-stat-row">
              <div className="prm-mini-stat"><div className="prm-mini-label">Total</div><div className="prm-mini-val w">{ports.length}</div></div>
              <div className="prm-mini-stat"><div className="prm-mini-label">High</div><div className="prm-mini-val r">{highRisk}</div></div>
              <div className="prm-mini-stat"><div className="prm-mini-label">Low</div><div className="prm-mini-val g">{lowRisk}</div></div>
            </div>

            <div className="prm-port-list">
              {ports.map((port: any, i: number) => {
                const isHigh = port.risk === "HIGH";
                return (
                  <div
                    key={i}
                    className={`prm-port-row${activeIdx === i ? " active" : ""}`}
                    onClick={() => handleSidebarClick(port, i)}
                  >
                    <div className="prm-port-led" style={{ background: isHigh ? HIGH_COLOR : LOW_COLOR }} />
                    <div className="prm-port-info">
                      <div className="prm-port-name">{port.port}</div>
                      <div className="prm-port-country">{port.country}</div>
                    </div>
                    <div className={`prm-port-badge ${isHigh ? "h" : "l"}`}>{port.risk}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* right */}
          <div className="prm-right">
            <div className="prm-map-area">

              <div className="prm-header">
                <div className="prm-eyebrow">· Port Risk Intelligence</div>
                <h1 className="prm-title">Global Port <span>Risk Map.</span></h1>
                <p className="prm-subtitle">
                  Live risk signals across {ports.length} monitored ports — streamed to one calm gateway.
                </p>
              </div>

              <div className="prm-map-card">
                <div className="prm-map-card-head">
                  <div className="prm-map-card-title">Live Risk View</div>
                  <div className="prm-legend">
                    <div className="prm-legend-item"><div className="prm-legend-dot" style={{ background: HIGH_COLOR }} />High Risk</div>
                    <div className="prm-legend-item"><div className="prm-legend-dot" style={{ background: LOW_COLOR  }} />Low Risk</div>
                  </div>
                </div>

                <MapContainer center={[20, 78]} zoom={3} style={{ flex: 1, width: "100%", minHeight: "300px" }}>
                  <FlyTo target={flyTarget} />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  {ports.map((port: any, i: number) => {
                    const offsetLat = ((i % 3) - 1) * 0.1;
                    const offsetLng = ((Math.floor(i / 3) % 3) - 1) * 0.1;
                    const isHigh = port.risk === "HIGH";
                    return (
                      <CircleMarker
                        key={i}
                        center={[port.lat + offsetLat, port.lng + offsetLng] as [number, number]}
                        // @ts-ignore
                        radius={(isHigh ? 11 : 7) as number}
                        pathOptions={{
                          color: isHigh ? "rgba(255,77,77,0.5)" : "rgba(74,222,128,0.4)",
                          weight: 2,
                          fillColor: isHigh ? HIGH_COLOR : LOW_COLOR,
                          fillOpacity: isHigh ? 0.9 : 0.75,
                        }}
                        eventHandlers={{ click: () => setActiveIdx(i) }}
                      >
                        {/* @ts-ignore */}
                        <Tooltip direction={"top" as TooltipDirection} offset={[0, -6] as [number, number]} opacity={1}>
                          {port.port}
                        </Tooltip>
                        <Popup>
                          <div className="pm-popup-port">{port.port}</div>
                          <div className="pm-popup-country">{port.country}</div>
                          <div className={`pm-popup-risk ${isHigh ? "high" : "low"}`}>
                            <div className="pm-popup-risk-dot" />
                            Risk: {port.risk}
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>

            {/* ticker */}
            <div className="prm-ticker">
              <div className="prm-ticker-track">
                {[...tickerItems, ...tickerItems].map((item, i) => (
                  <div key={i} className="prm-tick-item">
                    <div className={`prm-tick-dot ${item.kind}`} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

          </div>{/* /right */}
        </div>{/* /content */}
      </div>
    </>
  );
}
