"use client";

import { useEffect } from "react";
import { usePersonalization } from "@/context/PersonalizationContext";

export default function TrackFeature({ feature }) {
  const { trackFeature } = usePersonalization();

  useEffect(() => {
    trackFeature(feature);
  }, [feature, trackFeature]);

  return null;
}
