const stripTrailingSlash = (value = '') => String(value).replace(/\/+$/, '');

export function resolveServerSiteUrl(request) {
  const configuredUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL);
  if (configuredUrl) {
    return configuredUrl;
  }

  const vercelUrl = stripTrailingSlash(process.env.VERCEL_URL);
  if (vercelUrl) {
    return vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
  }

  const forwardedHost = request?.headers?.get('x-forwarded-host') || request?.headers?.get('host');
  const forwardedProto = request?.headers?.get('x-forwarded-proto') || 'http';
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return 'https://irwaa.com';
}
