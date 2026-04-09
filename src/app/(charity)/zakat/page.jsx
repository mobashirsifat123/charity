import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';
import ZakatCalculator from '@/components/zakat/ZakatCalculator';
import { getLiveMetalPrices } from '@/lib/server/metals';
import { startZakatCheckout } from '@/app/(charity)/zakat/actions';

export const metadata = {
  title: 'Zakat Calculator | IRWA',
  description: 'Calculate your Zakat using live gold and silver prices, then pay securely through Stripe.',
};

export default async function ZakatPage() {
  const pricing = await getLiveMetalPrices();

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title="Zakat Calculator"
        links={[
          { name: 'Home', link: '/' },
          { name: 'Zakat Calculator', link: '/zakat' },
        ]}
      />

      <div className="container py-5">
        <div className="row justify-content-center mb-5">
          <div className="col-xl-10">
            <div className="text-center mb-4">
              <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill mb-3">
                Charity Tools
              </span>
              <h1 className="fw-bold mb-3">Interactive Zakat Calculator</h1>
              <p className="lead text-muted mb-0">
                Estimate your zakatable wealth using live precious metal pricing, review your Nisab status,
                and continue directly to Stripe when you are ready to pay.
              </p>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="content-panel p-4 h-100">
                  <p className="text-muted text-uppercase small fw-semibold mb-2">Gold price</p>
                  <h4 className="fw-bold mb-1">
                    £{pricing.goldPricePerGram.toFixed(2)}
                  </h4>
                  <p className="text-muted small mb-0">Per gram</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="content-panel p-4 h-100">
                  <p className="text-muted text-uppercase small fw-semibold mb-2">Silver price</p>
                  <h4 className="fw-bold mb-1">
                    £{pricing.silverPricePerGram.toFixed(2)}
                  </h4>
                  <p className="text-muted small mb-0">Per gram</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="content-panel p-4 h-100">
                  <p className="text-muted text-uppercase small fw-semibold mb-2">Silver Nisab</p>
                  <h4 className="fw-bold mb-1">
                    £{pricing.silverNisabValue.toFixed(2)}
                  </h4>
                  <p className="text-muted small mb-0">
                    Conservative threshold based on silver
                  </p>
                </div>
              </div>
            </div>

            <ZakatCalculator pricing={pricing} payZakatAction={startZakatCheckout} />
          </div>
        </div>
      </div>

      <FooterOne />
    </section>
  );
}
