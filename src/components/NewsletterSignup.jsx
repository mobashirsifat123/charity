"use client";
import { useState } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function NewsletterSignup({ compact = false }) {
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!email.trim()) {
      setMessage({ type: "danger", text: "Please enter your email address." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), source: compact ? "footer" : "homepage" }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to subscribe right now.");
      }

      setEmail("");
      setMessage({ type: "success", text: settings.newsletter_success_message || "You are subscribed for new articles and fatwas." });
    } catch (error) {
      setMessage({ type: "danger", text: error.message || "Subscription failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? "" : "card border-0 shadow-sm rounded-4"}>
      <div className={compact ? "" : "card-body p-4"}>
        {!compact ? <h5 className="fw-bold mb-2">{settings.newsletter_title || "Stay Updated"}</h5> : null}
        <p className={`text-muted ${compact ? "small mb-2" : "mb-3"}`}>
          {settings.newsletter_description || "Get notified when new Islamic insights and fatwas are published."}
        </p>
        {message.text ? <div className={`alert alert-${message.type} py-2 small`}>{message.text}</div> : null}
        <form onSubmit={handleSubmit}>
          <div className={`input-group ${compact ? "" : "input-group-lg"}`}>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Joining...
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
