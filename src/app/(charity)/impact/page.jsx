import Link from "next/link";

import BreadcrumbOne from "@/components/BreadcrumbOne";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import ImpactCharts from "@/components/charity/ImpactCharts";
import LiveDonationToast from "@/components/charity/LiveDonationToast";
import { getImpactDashboardData } from "@/lib/server/impact";

export const revalidate = 300;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default async function ImpactPage() {
  const impact = await getImpactDashboardData();
  const { totals, monthlyRaised, categoryBreakdown, completedCampaigns, dataSource } = impact;

  return (
    <section className="page-wrapper">
      <LiveDonationToast />
      <HeaderOne />
      <BreadcrumbOne
        title="Impact Dashboard"
        links={[
          { name: "Home", link: "/" },
          { name: "Impact", link: "/impact" },
        ]}
      />

      <div className="container py-5">
        {dataSource === "fallback" ? (
          <div className="alert alert-warning border rounded-4 mb-4">
            Live impact data is temporarily unavailable. Showing safe fallback values until the data connection recovers.
          </div>
        ) : null}
        <div className="row g-4 align-items-center mb-5">
          <div className="col-lg-7">
            <span className="badge bg-success bg-opacity-10 text-success rounded-pill mb-3">
              Charity transparency
            </span>
            <h1 className="fw-bold mb-3">See how support is turning into measurable impact.</h1>
            <p className="lead text-muted mb-0">
              This dashboard brings together completed donations, finished campaigns, and category-level outcomes so supporters can follow the mission with confidence.
            </p>
          </div>
          <div className="col-lg-5">
            <div className="content-panel h-100" style={{ background: 'var(--surface-alt)' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Why this matters</h5>
                <p className="text-muted mb-0">
                  Donors should be able to see where momentum is building, which causes are reaching completion, and how the wider effort is progressing over time.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="text-muted small text-uppercase fw-semibold mb-2">Funds raised</div>
                <div className="display-6 fw-bold mb-1">{formatCurrency(totals.totalFundsRaised)}</div>
                <div className="text-muted">Completed donations processed through IRWA.</div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="text-muted small text-uppercase fw-semibold mb-2">Campaigns completed</div>
                <div className="display-6 fw-bold mb-1">{totals.totalCampaignsCompleted}</div>
                <div className="text-muted">Projects that reached their goal or were marked complete.</div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="text-muted small text-uppercase fw-semibold mb-2">Completed donations</div>
                <div className="display-6 fw-bold mb-1">{totals.totalCompletedDonations}</div>
                <div className="text-muted">Successful gifts reflected in the dashboard totals.</div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="text-muted small text-uppercase fw-semibold mb-2">Impact categories</div>
                <div className="display-6 fw-bold mb-1">{totals.activeCategories}</div>
                <div className="text-muted">Cause areas with completed campaign outcomes.</div>
              </div>
            </div>
          </div>
        </div>

        <ImpactCharts
          monthlyRaised={monthlyRaised}
          categoryBreakdown={categoryBreakdown}
        />

        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mt-5 mb-4">
          <div>
            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-3">
              Completed projects
            </span>
            <h2 className="fw-bold mb-1">Impact by category</h2>
            <p className="text-muted mb-0">A plain-language breakdown of completed work across the charity program.</p>
          </div>
          <Link href="/donation" className="btn btn-primary btn-ripple rounded-pill px-4">
            Support a cause
          </Link>
        </div>

        <div className="row g-4 mb-5">
          {categoryBreakdown.length ? (
            categoryBreakdown.map((category) => (
              <div key={category.category} className="col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div>
                        <div className="text-muted small text-uppercase fw-semibold mb-2">Category</div>
                        <h4 className="fw-bold mb-0">{category.category}</h4>
                      </div>
                      <span className="badge bg-success rounded-pill">
                        {category.campaignCount} complete
                      </span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Raised</span>
                        <strong>{formatCurrency(category.totalRaised)}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Combined target</span>
                        <strong>{formatCurrency(category.totalGoal)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-light border rounded-4 mb-0">
                No completed campaign categories are available yet.
              </div>
            </div>
          )}
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4 p-lg-5">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
              <div>
                <h3 className="fw-bold mb-1">Recently completed campaigns</h3>
                <p className="text-muted mb-0">A snapshot of projects that have already crossed the line.</p>
              </div>
              <span className="badge bg-light border rounded-pill">
                {completedCampaigns.length} total
              </span>
            </div>

            <div className="row g-3">
              {completedCampaigns.length ? (
                completedCampaigns.slice(0, 6).map((campaign) => (
                  <div key={campaign.id} className="col-lg-4 col-md-6">
                    <div className="border rounded-4 h-100 p-4">
                      <div className="text-muted small text-uppercase fw-semibold mb-2">
                        {campaign.category || "General"}
                      </div>
                      <h5 className="fw-bold mb-2">{campaign.title}</h5>
                      <div className="d-flex justify-content-between small text-muted">
                        <span>Raised</span>
                        <span>{formatCurrency(campaign.raised_amount)}</span>
                      </div>
                      <div className="d-flex justify-content-between small text-muted mt-2">
                        <span>Target</span>
                        <span>{formatCurrency(campaign.goal_amount)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-light border rounded-4 mb-0">
                    Campaign completion data will appear here as projects reach their targets.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FooterOne />
    </section>
  );
}
