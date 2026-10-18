const env = import.meta.env;

/** Typed, defaulted view of the storefront environment. Missing optional keys disable features. */
export const config = {
  siteUrl: (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, ''),
  whatsappFallback: env.VITE_WHATSAPP_NUMBER || '',
  adminUrl: (env.VITE_ADMIN_URL || 'http://localhost:5174').replace(/\/$/, ''),
  emailjs: {
    publicKey: env.VITE_EMAILJS_PUBLIC_KEY || '',
    serviceId: env.VITE_EMAILJS_SERVICE_ID || '',
    templateCustomer: env.VITE_EMAILJS_TEMPLATE_CUSTOMER || '',
    templateStore: env.VITE_EMAILJS_TEMPLATE_STORE || '',
  },
  tawk:
    env.VITE_TAWK_PROPERTY_ID && env.VITE_TAWK_WIDGET_ID
      ? { propertyId: env.VITE_TAWK_PROPERTY_ID, widgetId: env.VITE_TAWK_WIDGET_ID }
      : null,
  clarityId: env.VITE_CLARITY_PROJECT_ID || '',
  recaptchaSiteKey: env.VITE_RECAPTCHA_SITE_KEY || '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || '',
  vercelAnalytics: env.VITE_ENABLE_VERCEL_ANALYTICS !== 'false',
} as const;
