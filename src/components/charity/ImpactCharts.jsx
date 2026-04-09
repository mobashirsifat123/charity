"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = ["#0b3d2e", "#145a32", "#c8a951", "#2d6b57", "#6e8b7b"];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function ImpactCharts({ monthlyRaised = [], categoryBreakdown = [] }) {
  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm rounded-4 h-100">
          <div className="card-body p-4 p-lg-5">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
              <div>
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-3">
                  Giving momentum
                </span>
                <h3 className="fw-bold mb-1">Monthly completed donations</h3>
                <p className="text-muted mb-0">A quick view of how support has been building over recent months.</p>
              </div>
            </div>

            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <AreaChart data={monthlyRaised}>
                  <defs>
                    <linearGradient id="impactAreaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0b3d2e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0b3d2e" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,61,46,0.1)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${Math.round(Number(value || 0)).toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: "16px", border: "1px solid rgba(11,61,46,0.12)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#0b3d2e"
                    fill="url(#impactAreaFill)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="card border-0 shadow-sm rounded-4 h-100">
          <div className="card-body p-4 p-lg-5">
            <span className="badge bg-warning bg-opacity-10 text-warning-emphasis rounded-pill mb-3">
              Project mix
            </span>
            <h3 className="fw-bold mb-1">Completed projects by category</h3>
            <p className="text-muted mb-4">Which causes have already reached completion.</p>

            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="campaignCount"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={entry.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, item) => [`${value} projects`, item?.payload?.category || "Category"]}
                    contentStyle={{ borderRadius: "16px", border: "1px solid rgba(11,61,46,0.12)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="d-flex flex-column gap-2 mt-3">
              {categoryBreakdown.map((entry, index) => (
                <div key={entry.category} className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle"
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                        display: "inline-block",
                      }}
                    />
                    <span className="small fw-semibold">{entry.category}</span>
                  </div>
                  <span className="small text-muted">{entry.campaignCount} complete</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
