const env = import.meta.env;

export const config = {
  storeUrl: (env.VITE_STORE_URL || 'http://localhost:5173').replace(/\/$/, ''),
  cloudinary: {
    cloudName: env.VITE_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
    folder: env.VITE_CLOUDINARY_FOLDER || 'areqa',
  },
  emailjs: {
    publicKey: env.VITE_EMAILJS_PUBLIC_KEY || '',
    serviceId: env.VITE_EMAILJS_SERVICE_ID || '',
    templateCustomer: env.VITE_EMAILJS_TEMPLATE_CUSTOMER || '',
  },
} as const;
