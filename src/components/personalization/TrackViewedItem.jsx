"use client";

import { useEffect } from "react";
import { usePersonalization } from "@/context/PersonalizationContext";

export default function TrackViewedItem({ item }) {
  const { trackRecent } = usePersonalization();

  useEffect(() => {
    trackRecent(item);
  }, [item, trackRecent]);

  return null;
}
