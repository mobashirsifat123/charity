const fs = require('fs');

const file = 'src/components/DonateModal.jsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('import toast from "react-hot-toast";')) {
    content = content.replace(
      'import { useLanguage } from "@/context/LanguageContext";',
      'import { useLanguage } from "@/context/LanguageContext";\nimport toast from "react-hot-toast";'
    );
  }

  content = content.replace(
    /setError\(t\('invalidDonationAmount', 'Please enter a valid amount of at least \$1\.'\)\);/g,
    'toast.error(t(\'invalidDonationAmount\', \'Please enter a valid amount of at least $1.\'));'
  );

  content = content.replace(
    /setError\(data\.message \|\| t\('unableToStartCheckout', 'Unable to start checkout\.'\)\);/g,
    'toast.error(data.message || t(\'unableToStartCheckout\', \'Unable to start checkout.\'));'
  );

  content = content.replace(
    /setError\(err\.message \|\| t\('checkoutFailed', 'Checkout failed\.'\)\);/g,
    'toast.error(err.message || t(\'checkoutFailed\', \'Checkout transaction failed.\'));'
  );

  // Remove the old red alert banner that shifts the UI down!
  content = content.replace(/\{error && <div className="alert alert-danger py-2 small">\{error\}<\/div>\}/g, '');

  fs.writeFileSync(file, content);
}
