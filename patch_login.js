const fs = require('fs');

const file = 'src/app/login/page.js';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
      /<button[\s\S]*?onClick=\{handleResetPassword\}[\s\S]*?>[\s\S]*?\{t\('forgotPassword', 'Forgot Password\?'\)\}[\s\S]*?<\/button>/,
      `<Link href="/forgot-password" className="text-decoration-none small text-primary p-0">\n  {t('forgotPassword', 'Forgot Password?')}\n</Link>`
  );

  fs.writeFileSync(file, content);
  console.log("Login patched");
}
