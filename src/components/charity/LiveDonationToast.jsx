"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

const DEFAULT_CURRENCY = "USD";
const TOAST_DURATION_MS = 6000;

function formatAmount(amount, currency = DEFAULT_CURRENCY) {
  const numericAmount = Number(amount || 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency || DEFAULT_CURRENCY).toUpperCase(),
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

function formatDonorName(record = {}) {
  const donorName = String(record.donor_name || "").trim();
  const privacyFlag =
    record.is_anonymous === true ||
    record.anonymous === true ||
    String(record.privacy_preference || "").toLowerCase() === "anonymous" ||
    String(record.donor_preference || "").toLowerCase() === "anonymous" ||
    donorName.toLowerCase() === "anonymous";

  if (privacyFlag) return "An anonymous donor";
  if (!donorName) return "A donor";

  const parts = donorName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1]?.charAt(0);

  return lastInitial ? `${firstName} ${lastInitial}.` : firstName;
}

async function resolveCampaignTitle(record, campaignCacheRef) {
  if (record.campaign_title) return record.campaign_title;

  const campaignId = record.campaign_id;
  if (!campaignId) return "IRWA Campaign";

  if (campaignCacheRef.current[campaignId]) {
    return campaignCacheRef.current[campaignId];
  }

  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("title")
      .eq("id", campaignId)
      .maybeSingle();

    if (error) throw error;

    const title = data?.title || "IRWA Campaign";
    campaignCacheRef.current[campaignId] = title;
    return title;
  } catch (error) {
    console.error("Unable to resolve campaign title for donation toast:", error);
    return "IRWA Campaign";
  }
}

function ToastCard({ toast, onDismiss }) {
  return (
    <div
      className="toast show border-0 shadow-lg rounded-4 overflow-hidden"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        minWidth: "320px",
        maxWidth: "380px",
        background: "linear-gradient(135deg, rgba(11,61,46,0.98) 0%, rgba(20,90,50,0.98) 100%)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="p-3 p-md-4">
        <div className="d-flex align-items-start gap-3">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: "44px",
              height: "44px",
              background: "rgba(200,169,81,0.18)",
              color: "#f6e7b8",
            }}
          >
            <i className="fa-solid fa-hand-holding-heart" />
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
              <div>
                <div className="small text-white-50 text-uppercase fw-semibold">Live support</div>
                <div className="fw-bold">New completed donation</div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-link text-white-50 p-0 text-decoration-none"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss donation toast"
              >
                <i className="fa-solid fa-xmark fs-5" />
              </button>
            </div>
            <p className="mb-0">
              <strong>{toast.donorLabel}</strong> just contributed{" "}
              <strong>{toast.amountLabel}</strong> to{" "}
              <strong>{toast.campaignTitle}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveDonationToast() {
  const [toasts, setToasts] = useState([]);
  const seenDonationIdsRef = useRef(new Set());
  const campaignCacheRef = useRef({});

  useEffect(() => {
    let active = true;

    const dismissToast = (id) => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    };

    async function maybePushToast(record) {
      if (!active || !record?.id) return;

      const isCompleted = String(record.payment_status || "").toLowerCase() === "completed";
      if (!isCompleted || seenDonationIdsRef.current.has(record.id)) return;

      seenDonationIdsRef.current.add(record.id);

      const campaignTitle = await resolveCampaignTitle(record, campaignCacheRef);
      if (!active) return;

      const toastId = `${record.id}-${Date.now()}`;
      const nextToast = {
        id: toastId,
        donorLabel: formatDonorName(record),
        amountLabel: formatAmount(record.amount, record.currency || DEFAULT_CURRENCY),
        campaignTitle,
      };

      setToasts((current) => [nextToast, ...current].slice(0, 3));

      window.setTimeout(() => {
        dismissToast(toastId);
      }, TOAST_DURATION_MS);
    }

    const channel = supabase
      .channel("live-donations-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "donations" },
        async (payload) => {
          await maybePushToast(payload.new);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "donations" },
        async (payload) => {
          const nextStatus = String(payload.new?.payment_status || "").toLowerCase();
          const previousStatus = String(payload.old?.payment_status || "").toLowerCase();

          if (nextStatus === "completed" && previousStatus !== "completed") {
            await maybePushToast(payload.new);
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Supabase realtime channel failed for live donations.");
        }
      });

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const visibleToasts = useMemo(() => toasts.slice(0, 3), [toasts]);

  if (!visibleToasts.length) return null;

  return (
    <div
      className="position-fixed top-0 end-0 p-3"
      style={{ zIndex: 1080, pointerEvents: "none" }}
    >
      <div className="d-flex flex-column gap-3" style={{ pointerEvents: "auto" }}>
        {visibleToasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onDismiss={(id) => setToasts((current) => current.filter((item) => item.id !== id))}
          />
        ))}
      </div>
    </div>
  );
}
