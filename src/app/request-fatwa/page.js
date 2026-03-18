"use client";
import { useState } from "react";
import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import BreadcrumbOne from "@/components/BreadcrumbOne";
import { FATWA_CATEGORY_OPTIONS } from "@/lib/content-utils";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function RequestFatwaPage() {
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "General",
    question: "",
    details: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      const response = await fetch("/api/fatwa-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit your request.");
      }

      setFormData({
        name: "",
        email: "",
        category: "General",
        question: "",
        details: "",
      });
      setMessage({ type: "success", text: settings.request_fatwa_success_message || "Your question has been submitted successfully." });
    } catch (error) {
      setMessage({ type: "danger", text: error.message || "Submission failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title="Request a Fatwa"
        links={[
          { name: "Home", link: "/" },
          { name: "Request a Fatwa", link: "/request-fatwa" },
        ]}
      />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-md-5">
                <h2 className="fw-bold mb-2">{settings.request_fatwa_heading || "Ask a Question"}</h2>
                <p className="text-muted mb-4">
                  {settings.request_fatwa_description || "Submit your question and the team can review it for a future published ruling."}
                </p>
                {message.text ? <div className={`alert alert-${message.type}`}>{message.text}</div> : null}
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Name</label>
                      <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email</label>
                      <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Category</label>
                      <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                        {FATWA_CATEGORY_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Question</label>
                      <input type="text" name="question" className="form-control" value={formData.question} onChange={handleChange} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Additional details</label>
                      <textarea name="details" rows="6" className="form-control" value={formData.details} onChange={handleChange}></textarea>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg mt-4" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Question <i className="fa-solid fa-paper-plane ms-2"></i>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterOne />
    </section>
  );
}
