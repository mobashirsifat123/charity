"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { useAuth } from '@/context/AuthContext';
import {
  GOLD_NISAB_GRAMS,
  SILVER_NISAB_GRAMS,
} from '@/lib/server/metals';

const steps = [
  { id: 1, label: 'Cash & Assets' },
  { id: 2, label: 'Gold & Silver' },
  { id: 3, label: 'Review & Pay' },
];

const formatCurrency = (value, currency = 'GBP') =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(Number(value || 0));

const parseInput = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function PayZakatButton({ disabled, amount, currency }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="btn btn-primary btn-ripple btn-lg w-100 rounded-pill fw-semibold"
      disabled={disabled || pending}
    >
      {pending
        ? 'Redirecting to Stripe...'
        : `Pay your Zakat Now (${formatCurrency(amount, currency)})`}
    </button>
  );
}

export default function ZakatCalculator({
  pricing,
  payZakatAction,
}) {
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({
    cash: '',
    bank: '',
    businessAssets: '',
    debts: '',
    goldGrams: '',
    silverGrams: '',
  });

  const computed = useMemo(() => {
    const cash = parseInput(values.cash);
    const bank = parseInput(values.bank);
    const businessAssets = parseInput(values.businessAssets);
    const debts = parseInput(values.debts);
    const goldGrams = parseInput(values.goldGrams);
    const silverGrams = parseInput(values.silverGrams);

    const goldValue = goldGrams * pricing.goldPricePerGram;
    const silverValue = silverGrams * pricing.silverPricePerGram;
    const totalAssets = cash + bank + businessAssets + goldValue + silverValue;
    const netZakatable = Math.max(totalAssets - debts, 0);
    const nisabThreshold = pricing.silverNisabValue;
    const zakatDue = netZakatable >= nisabThreshold ? netZakatable * 0.025 : 0;

    return {
      cash,
      bank,
      businessAssets,
      debts,
      goldGrams,
      silverGrams,
      goldValue,
      silverValue,
      totalAssets,
      netZakatable,
      nisabThreshold,
      zakatDue,
      isAboveNisab: netZakatable >= nisabThreshold,
    };
  }, [pricing, values]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const nextStep = () => setStep((previous) => Math.min(previous + 1, steps.length));
  const previousStep = () => setStep((previous) => Math.max(previous - 1, 1));

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="card-header bg-white border-0 p-4 pb-0">
        <div className="d-flex flex-wrap gap-2">
          {steps.map((item) => (
            <span
              key={item.id}
              className={`badge rounded-pill px-3 py-2 ${item.id === step ? 'bg-primary' : 'bg-light text-dark border'}`}
            >
              {item.id}. {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="card-body p-4 p-lg-5">
        {step === 1 ? (
          <>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Cash on hand</label>
                <div className="input-group">
                  <span className="input-group-text">£</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    name="cash"
                    value={values.cash}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Bank account balances</label>
                <div className="input-group">
                  <span className="input-group-text">£</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    name="bank"
                    value={values.bank}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Business inventory / shares</label>
                <div className="input-group">
                  <span className="input-group-text">£</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    name="businessAssets"
                    value={values.businessAssets}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Deductible debts / liabilities</label>
                <div className="input-group">
                  <span className="input-group-text">£</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    name="debts"
                    value={values.debts}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button type="button" className="btn btn-primary btn-ripple rounded-pill px-4" onClick={nextStep}>
                Continue to Gold & Silver
              </button>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="row g-4 align-items-stretch">
              <div className="col-lg-6">
                <div className="border rounded-4 h-100 p-4 bg-light-subtle">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Gold</h5>
                    <span className="badge bg-warning rounded-pill">
                      {formatCurrency(pricing.goldPricePerGram, pricing.currency)}/g
                    </span>
                  </div>
                  <label className="form-label fw-semibold">Gold owned (grams)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control mb-3"
                    name="goldGrams"
                    value={values.goldGrams}
                    onChange={handleChange}
                    placeholder="0"
                  />
                  <p className="text-muted mb-2 small">
                    Gold Nisab reference: {GOLD_NISAB_GRAMS}g
                  </p>
                  <h6 className="fw-bold mb-0">
                    Market value: {formatCurrency(computed.goldValue, pricing.currency)}
                  </h6>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="border rounded-4 h-100 p-4 bg-light-subtle">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Silver</h5>
                    <span className="badge bg-success rounded-pill">
                      {formatCurrency(pricing.silverPricePerGram, pricing.currency)}/g
                    </span>
                  </div>
                  <label className="form-label fw-semibold">Silver owned (grams)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control mb-3"
                    name="silverGrams"
                    value={values.silverGrams}
                    onChange={handleChange}
                    placeholder="0"
                  />
                  <p className="text-muted mb-2 small">
                    Silver Nisab reference: {SILVER_NISAB_GRAMS}g
                  </p>
                  <h6 className="fw-bold mb-0">
                    Market value: {formatCurrency(computed.silverValue, pricing.currency)}
                  </h6>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button type="button" className="btn btn-outline-secondary btn-ripple rounded-pill px-4" onClick={previousStep}>
                Back
              </button>
              <button type="button" className="btn btn-primary btn-ripple rounded-pill px-4" onClick={nextStep}>
                Review Calculation
              </button>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <form action={payZakatAction}>
            <input type="hidden" name="zakatAmount" value={computed.zakatDue.toFixed(2)} />
            <input type="hidden" name="zakatableWealth" value={computed.netZakatable.toFixed(2)} />
            <input type="hidden" name="currency" value={pricing.currency} />
            <input type="hidden" name="donorEmail" value={user?.email || ''} />
            <input type="hidden" name="donorName" value={user?.user_metadata?.full_name || user?.name || user?.email || ''} />
            <input type="hidden" name="donorId" value={user?.id || ''} />

            <div className="row g-4">
              <div className="col-lg-7">
                <div className="border rounded-4 p-4 h-100">
                  <h4 className="fw-bold mb-4">Your Zakat Summary</h4>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Cash and bank balances</span>
                    <strong>{formatCurrency(computed.cash + computed.bank, pricing.currency)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Gold value</span>
                    <strong>{formatCurrency(computed.goldValue, pricing.currency)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Silver value</span>
                    <strong>{formatCurrency(computed.silverValue, pricing.currency)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Business inventory / shares</span>
                    <strong>{formatCurrency(computed.businessAssets, pricing.currency)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3" style={{ color: '#8d3d31' }}>
                    <span>Deductible debts</span>
                    <strong>-{formatCurrency(computed.debts, pricing.currency)}</strong>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-semibold">Net zakatable wealth</span>
                    <strong>{formatCurrency(computed.netZakatable, pricing.currency)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Silver Nisab threshold</span>
                    <strong>{formatCurrency(computed.nisabThreshold, pricing.currency)}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <span className="fs-5 fw-bold">Zakat due (2.5%)</span>
                    <span className="fs-3 fw-bold text-success">
                      {formatCurrency(computed.zakatDue, pricing.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="border rounded-4 p-4 h-100 bg-light-subtle">
                  <h5 className="fw-bold mb-3">Ready to pay?</h5>
                  <p className="text-muted small mb-3">
                    Live pricing source: {pricing.source === 'live' ? 'market feed' : 'fallback pricing'}.
                    {' '}Rates cached at {new Date(pricing.fetchedAt).toLocaleString('en-GB')}.
                  </p>

                  {!computed.isAboveNisab ? (
                    <div className="alert alert-warning mb-3">
                      Your net zakatable wealth is currently below the Nisab threshold, so no Zakat is due right now.
                    </div>
                  ) : null}

                  {!loading && !user ? (
                    <div className="alert alert-info">
                      Please <Link href="/login?next=/zakat" className="fw-semibold">log in</Link> to continue to Stripe and pay your Zakat.
                    </div>
                  ) : null}

                  <PayZakatButton
                    disabled={!user || !computed.isAboveNisab || computed.zakatDue < 1}
                    amount={computed.zakatDue}
                    currency={pricing.currency}
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-ripple rounded-pill w-100 mt-3"
                    onClick={previousStep}
                  >
                    Back to edit values
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
