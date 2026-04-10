const fs = require('fs');

const file = 'src/components/NewsletterSignup.jsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Inject toast logic
  if (!content.includes('import toast from "react-hot-toast";')) {
    content = content.replace(
      'import { useSiteSettings } from "@/context/SiteSettingsContext";',
      'import { useSiteSettings } from "@/context/SiteSettingsContext";\nimport toast from "react-hot-toast";'
    );
  }

  // Swap verbose alerts for toasts
  content = content.replace(
    'setMessage({ type: "danger", text: t(\'pleaseEnterEmail\', \'Please enter your email address.\') });',
    'toast.error(t(\'pleaseEnterEmail\', \'Please enter your valid email address.\'));'
  );
  
  content = content.replace(
    'setMessage({ type: "success", text: settings.newsletter_success_message || "You are subscribed for new articles and fatwas." });',
    'toast.success(settings.newsletter_success_message || "Success! You are now subscribed to our newsletter.");'
  );

  content = content.replace(
    'setMessage({ type: "danger", text: error.message || t(\'subscriptionFailed\', \'Subscription failed.\') });',
    'toast.error(error.message || t(\'subscriptionFailed\', \'Oops, subscription failed. Try again later.\'));'
  );
  
  // Clean up component alert UI leaving just toasts
  content = content.replace(
    /\{message\.text \? <div className=\{`alert alert-\$\{message\.type\} py-2 small`\}>\{message\.text\}<\/div> : null\}/g,
    ''
  );

  fs.writeFileSync(file, content);
}
