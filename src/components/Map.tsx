"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { useState } from "react";

type TooltipDirection = "right" | "left" | "top" | "bottom" | "center" | "auto";

const HIGH_COLOR = "#ff4d4d";
const LOW_COLOR  = "#4ade80";

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  if (target) map.flyTo(target, 6, { duration: 1.2 });
  return null;
}

export default function Map({ ports }: { ports: any[] }) {
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const tickerItems = [
    ...ports.map((p: any) => ({ label: `${p.port} · Risk ${p.risk}`, kind: p.risk === "HIGH" ? "high" : "low" })),
    { label: "Red Sea corridor · Elevated disruption",   kind: "high"    },
    { label: "Strait of Hormuz · Monitoring active",     kind: "neutral" },
    { label: "Cape of Good Hope reroutes · +14% volume", kind: "neutral" },
    { label: "Singapore throughput · 42,100 TEU/hr",     kind: "low"     },
    { label: "Mumbai → Dubai ETA · 14h nominal",         kind: "low"     },
  ];

  return (
    <>
      <style>{`
        .map-shell {
          display: flex;
          height: 600px;
          background: #0a1a0f;
          overflow: hidden;
          font-family: 'DM Sans', 'Inter', sans-serif;
        }
        .map-sidebar {
          width: 232px; flex-shrink: 0;
          border-right: 1px solid rgba(74,222,128,0.1);
          background: #060e08;
          display: flex; flex-direction: column; overflow: hidden;
        }
        .map-sidebar-head {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(74,222,128,0.08);
          flex-shrink: 0;
        }
        .map-sidebar-label { font-size: 10px; font-weight: 500; color: #4ade80; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 2px; }
        .map-sidebar-title { font-size: 13px; font-weight: 600; color: #e8f0ea; }
        .map-port-list {
          overflow-y: auto; flex: 1; padding: 6px;
          scrollbar-width: thin; scrollbar-color: #1c3a22 transparent;
        }
        .map-port-list::-webkit-scrollbar { width: 3px; }
        .map-port-list::-webkit-scrollbar-thumb { background: #1c3a22; border-radius: 4px; }
        .map-port-row {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 7px; cursor: pointer;
          border: 1px solid transparent; margin-bottom: 2px;
          transition: background .15s, border-color .15s;
        }
        .map-port-row:hover  { background: #0f2416; border-color: rgba(74,222,128,0.1); }
        .map-port-row.active { background: #122b18; border-color: rgba(74,222,128,0.22); }
        .map-port-led { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .map-port-info { flex: 1; min-width: 0; }
        .map-port-name    { font-size: 12px; font-weight: 500; color: #d4e8d8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .map-port-country { font-size: 10px; color: #4a7a54; text-transform: uppercase; letter-spacing: .04em; margin-top: 1px; }
        .map-port-badge { font-size: 9px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; padding: 1px 6px; border-radius: 20px; flex-shrink: 0; }
        .map-port-badge.h { background: rgba(255,77,77,.12); color: #ff4d4d; border: 1px solid rgba(255,77,77,.2); }
        .map-port-badge.l { background: rgba(74,222,128,.10); color: #4ade80; border: 1px solid rgba(74,222,128,.2); }

        .map-right { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .map-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 9px 14px;
          border-bottom: 1px solid rgba(74,222,128,0.1);
          background: #0a1a0f; flex-shrink: 0;
        }
        .map-topbar-title { font-size: 11px; font-weight: 600; color: #c8deca; letter-spacing: .06em; text-transform: uppercase; }
        .map-legend { display: flex; align-items: center; gap: 14px; }
        .map-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #6b8f72; }
        .map-legend-dot  { width: 7px; height: 7px; border-radius: 50%; }

        .map-shell .leaflet-container { background: #0d1f12 !important; flex: 1; width: 100%; }
        .map-shell .leaflet-tile { filter: invert(1) hue-rotate(148deg) brightness(0.35) saturate(0.6); }
        .map-shell .leaflet-control-zoom { border: 1px solid rgba(74,222,128,0.2)!important; border-radius: 6px!important; overflow: hidden; }
        .map-shell .leaflet-control-zoom a { background: #0f2416!important; color: #4ade80!important; border-bottom: 1px solid rgba(74,222,128,0.15)!important; width: 28px!important; height: 28px!important; line-height: 28px!important; }
        .map-shell .leaflet-control-zoom a:hover { background: #1a3d22!important; }
        .leaflet-popup-content-wrapper { background: #0f2416!important; border: 1px solid rgba(74,222,128,0.2)!important; border-radius: 8px!important; box-shadow: 0 8px 32px rgba(0,0,0,.6)!important; color: #e8f0ea!important; padding: 0!important; }
        .leaflet-popup-content { margin: 0!important; padding: 12px 16px!important; }
        .leaflet-popup-tip { background: #0f2416!important; }
        .leaflet-popup-close-button { color: #4a7a54!important; top: 6px!important; right: 6px!important; }
        .leaflet-tooltip { background: #0a1a0f!important; border: 1px solid rgba(74,222,128,0.25)!important; color: #c8deca!important; font-size: 11px!important; font-weight: 500!important; border-radius: 5px!important; padding: 3px 8px!important; letter-spacing: .04em; text-transform: uppercase; }
        .leaflet-tooltip::before { display: none; }
        .leaflet-control-attribution { background: rgba(10,26,15,.7)!important; color: #2a4a30!important; font-size: 9px!important; }
        .leaflet-control-attribution a { color: #3a6a40!important; }
        .pm-port    { font-size: 13px; font-weight: 700; color: #e8f0ea; margin-bottom: 2px; }
        .pm-country { font-size: 10px; color: #6b8f72; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 8px; }
        .pm-risk    { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; padding: 2px 8px; border-radius: 20px; }
        .pm-risk.high { background: rgba(255,77,77,.12); color: #ff4d4d; border: 1px solid rgba(255,77,77,.25); }
        .pm-risk.low  { background: rgba(74,222,128,.10); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
        .pm-risk-dot  { width: 4px; height: 4px; border-radius: 50%; background: currentColor; }

        .map-ticker { flex-shrink: 0; background: #040a06; border-top: 1px solid rgba(74,222,128,0.08); padding: 7px 0; overflow: hidden; position: relative; }
        .map-ticker::before, .map-ticker::after { content:''; position:absolute; top:0; bottom:0; width:60px; z-index:2; pointer-events:none; }
        .map-ticker::before { left:0; background:linear-gradient(to right,#040a06,transparent); }
        .map-ticker::after  { right:0; background:linear-gradient(to left,#040a06,transparent); }
        .map-ticker-track { display:flex; width:max-content; animation: mticker 40s linear infinite; }
        .map-ticker-track:hover { animation-play-state: paused; }
        @keyframes mticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .map-tick-item { display:flex; align-items:center; gap:6px; padding:0 22px; font-size:11px; font-weight:500; color:#5a7a60; letter-spacing:.05em; white-space:nowrap; border-right:1px solid rgba(74,222,128,0.06); }
        .map-tick-dot { width:4px; height:4px; border-radius:50%; }
        .map-tick-dot.high    { background:#ff4d4d; }
        .map-tick-dot.low     { background:#4ade80; }
        .map-tick-dot.neutral { background:#3a5a40; }
      `}</style>

      <div className="map-shell">

        {/* Sidebar */}
        <div className="map-sidebar">
          <div className="map-sidebar-head">
            <div className="map-sidebar-label">· Ports</div>
            <div className="map-sidebar-title">Port Directory</div>
          </div>
          <div className="map-port-list">
            {ports.map((port: any, i: number) => {
              const isHigh = port.risk === "HIGH";
              return (
                <div
                  key={i}
                  className={`map-port-row${activeIdx === i ? " active" : ""}`}
                  onClick={() => { setFlyTarget([port.lat, port.lng]); setActiveIdx(i); }}
                >
                  <div className="map-port-led" style={{ background: isHigh ? HIGH_COLOR : LOW_COLOR }} />
                  <div className="map-port-info">
                    <div className="map-port-name">{port.port}</div>
                    <div className="map-port-country">{port.country}</div>
                  </div>
                  <div className={`map-port-badge ${isHigh ? "h" : "l"}`}>{port.risk}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: map + ticker */}
        <div className="map-right">
          <div className="map-topbar">
            <div className="map-topbar-title">Live Risk View</div>
            <div className="map-legend">
              <div className="map-legend-item"><div className="map-legend-dot" style={{ background: HIGH_COLOR }} />High Risk</div>
              <div className="map-legend-item"><div className="map-legend-dot" style={{ background: LOW_COLOR  }} />Low Risk</div>
            </div>
          </div>

          <MapContainer center={[20, 78]} zoom={3} style={{ flex: 1, width: "100%", minHeight: 0 }}>
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
                    <div className="pm-port">{port.port}</div>
                    <div className="pm-country">{port.country}</div>
                    <div className={`pm-risk ${isHigh ? "high" : "low"}`}>
                      <div className="pm-risk-dot" />
                      Risk: {port.risk}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          <div className="map-ticker">
            <div className="map-ticker-track">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <div key={i} className="map-tick-item">
                  <div className={`map-tick-dot ${item.kind}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
