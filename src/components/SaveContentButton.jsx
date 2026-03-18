"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getContentCategory,
  getContentPath,
  getContentTitle,
  readSavedContent,
  writeSavedContent,
} from "@/lib/content-utils";

export default function SaveContentButton({ item, type, className = "btn btn-outline-secondary rounded-pill" }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const userKey = useMemo(() => user?.id || "guest", [user?.id]);

  useEffect(() => {
    const savedItems = readSavedContent(userKey);
    setSaved(savedItems.some((entry) => entry.type === type && String(entry.id) === String(item?.id)));
  }, [item?.id, type, userKey]);

  const handleToggle = () => {
    const existing = readSavedContent(userKey);
    const isAlreadySaved = existing.some((entry) => entry.type === type && String(entry.id) === String(item?.id));

    if (isAlreadySaved) {
      const nextItems = existing.filter((entry) => !(entry.type === type && String(entry.id) === String(item?.id)));
      writeSavedContent(userKey, nextItems);
      setSaved(false);
      return;
    }

    const nextItems = [
      {
        id: item?.id,
        type,
        title: getContentTitle(item, type),
        href: getContentPath(type, item),
        category: getContentCategory(item),
        savedAt: new Date().toISOString(),
      },
      ...existing,
    ];

    writeSavedContent(userKey, nextItems);
    setSaved(true);
  };

  return (
    <button type="button" className={className} onClick={handleToggle}>
      <i className={`fa-${saved ? "solid" : "regular"} fa-bookmark me-2`}></i>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
