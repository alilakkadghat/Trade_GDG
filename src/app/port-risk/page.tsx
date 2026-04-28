"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function PortRiskPage() {
  const [ports, setPorts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/port-risk")
      .then((res) => res.json())
      .then((data) => setPorts(data));
  }, []);

  return <Map ports={ports} />;
}
