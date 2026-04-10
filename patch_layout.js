const fs = require('fs');

const file = 'src/app/layout.jsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Add import for Toaster
  if (!content.includes('import { Toaster } from "react-hot-toast"')) {
    content = content.replace(
      'import ClientProviders from "@/components/ClientProviders";',
      'import ClientProviders from "@/components/ClientProviders";\nimport { Toaster } from "react-hot-toast";'
    );
  }

  // Insert Toaster component
  if (!content.includes('<Toaster position="bottom-right" />')) {
    content = content.replace(
      '<ClientProviders>',
      '<Toaster position="bottom-right" toastOptions={{ duration: 4000, style: { background: "#333", color: "#fff", } }} />\n        <ClientProviders>'
    );
  }

  fs.writeFileSync(file, content);
}
