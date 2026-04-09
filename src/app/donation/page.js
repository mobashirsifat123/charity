"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import BreadcrumbOne from "@/components/BreadcrumbOne";

const quickAmounts = [10, 25, 50, 100, 250];

export default function DonationPage() {
  const [campaign, setCampaign] = useState(null);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [amount, setAmount] = useState("25");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [campaignId, setCampaignId] = useState(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setCampaignId(params.get("campaign"));
  }, []);

  useEffect(() => {
    let active = true;

    const fetchCampaign = async () => {
      if (!campaignId) {
        setCampaign(null);
        return;
      }

      setCampaignLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from("campaigns")
          .select("id, title, description")
          .eq("id", campaignId)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (active) {
          setCampaign(data || null);
          if (!data) {
            setError(t('campaignNotFound', 'Campaign Not Found'));
          }
        }
      } catch (fetchError) {
        if (active) {
          setCampaign(null);
          setError(fetchError.message || t('unableToLoadCampaign', 'Unable to load the selected campaign.'));
        }
      } finally {
        if (active) setCampaignLoading(false);
      }
    };

    fetchCampaign();

    return () => {
      active = false;
    };
  }, [campaignId, t]);

  const selectedTitle = useMemo(() => campaign?.title || "General Donation", [campaign]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const donationAmount = Number(amount);
    if (!Number.isFinite(donationAmount) || donationAmount < 1) {
      setError(t('invalidDonationAmount', 'Please enter a valid amount of at least $1.'));
      return;
    }

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/donation${campaignId ? `?campaign=${campaignId}` : ""}`)}`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: donationAmount,
          campaignId: campaign?.id || null,
          campaignTitle: selectedTitle,
          userEmail: user.email,
          userName: user.user_metadata?.full_name || user.name || user.email,
          userId: user.id,
          successUrl: `${window.location.origin}/donation/success`,
          cancelUrl: `${window.location.origin}/donation${campaignId ? `?campaign=${campaignId}` : ""}`,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success || !data?.url) {
        throw new Error(data?.message || t('unableToStartCheckout', 'Unable to start checkout.'));
      }

      setSuccess(t('redirectingToStripe', 'Redirecting you to Stripe...'));
      window.location.href = data.url;
    } catch (submitError) {
      setError(submitError.message || t('unableToStartCheckout', 'Unable to start checkout.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title={t('donation', 'Donation')}
        links={[
          { name: t('home', 'Home'), link: "/" },
          { name: t('donation', 'Donation'), link: "/donation" },
        ]}
      />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-2">{t('completeYourDonation', 'Complete Your Donation')}</h2>
                  <p className="text-muted mb-0">
                    {campaignLoading
                      ? t('loadingCampaignDetails', 'Loading campaign details...')
                      : t('supportingCampaign', 'You are supporting: {title}').replace('{title}', selectedTitle)}
                  </p>
                </div>

                {campaign?.description ? (
                  <div className="alert alert-light border mb-4">
                    <strong className="d-block mb-1">{campaign.title}</strong>
                    <span className="text-muted small">
                      {campaign.description.slice(0, 180)}
                      {campaign.description.length > 180 ? "..." : ""}
                    </span>
                  </div>
                ) : null}

                {error ? <div className="alert alert-danger">{error}</div> : null}
                {success ? <div className="alert alert-success">{success}</div> : null}
                {!user ? (
                  <div className="alert alert-warning">
                    {t('loginBeforeStripe', 'Please log in before continuing to Stripe.')}
                  </div>
                ) : null}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">{t('selectAmount', 'Select an amount')}</label>
                    <div className="d-flex flex-wrap gap-2">
                      {quickAmounts.map((quickAmount) => (
                        <button
                          key={quickAmount}
                          type="button"
                          className={`btn btn-ripple ${amount === String(quickAmount) ? "btn-primary hover-glow-primary" : "btn-outline-primary"}`}
                          onClick={() => setAmount(String(quickAmount))}
                        >
                          ${quickAmount}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="donationAmount" className="form-label fw-semibold">
                      {t('customAmount', 'Custom amount')}
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">$</span>
                      <input
                        id="donationAmount"
                        name="donationAmount"
                        type="number"
                        min="1"
                        step="0.01"
                        className="form-control"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-ripple hover-glow-primary w-100 py-3 fw-semibold" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        {t('redirectingToStripe', 'Redirecting to Stripe...')}
                      </>
                    ) : (
                      <>
                        {t('continueToStripe', 'Continue to Stripe')} <i className="fa-solid fa-arrow-right ms-2" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <Link href={campaignId ? `/cause-details/${campaignId}` : "/#campaigns"} className="text-decoration-none fw-semibold">
                    <i className="fa-solid fa-arrow-left me-2" />
                    {campaignId ? t('backToCampaign', 'Back to campaign') : t('browseCampaigns', 'Browse campaigns')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterOne />
    </section>
  );
}
