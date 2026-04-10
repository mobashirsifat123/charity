const stripTrailingSlash = (value = '') => String(value).replace(/\/+$/, '');

const resolveForwardedHeader = (value, fallback = 'https') => {
  if (Array.isArray(value)) {
    return value[0] || fallback;
  }

  return String(value || fallback).split(',')[0].trim() || fallback;
};

function resolveFrontendUrl(req) {
  const configuredFrontendUrl = stripTrailingSlash(process.env.FRONTEND_URL);
  if (configuredFrontendUrl) {
    return configuredFrontendUrl;
  }

  const configuredSiteUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL);
  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }

  const vercelUrl = stripTrailingSlash(process.env.VERCEL_URL);
  if (vercelUrl) {
    return vercelUrl.startsWith('https') ? vercelUrl : `https://${vercelUrl}`;
  }

  const forwardedHost = resolveForwardedHeader(req?.headers?.['x-forwarded-host'] || req?.headers?.host, '');
  const forwardedProto = resolveForwardedHeader(req?.headers?.['x-forwarded-proto'], 'https');
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return 'https://irwaa.com';
}

module.exports = {
  resolveFrontendUrl,
};
