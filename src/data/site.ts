export const SITE = {
  name: 'Bloc Microfinance Bank',
  short: 'Bloc MFB',
  url: (import.meta.env.SITE as string) || 'https://blocmfb.com',
  tagline: 'Banking for individuals and businesses',
  rc: '7187722',
  licence: 'FPR/LAD/CON/MFB/010/066',
  email: 'support@blocmfb.com',
  phone: '07042047811',
  phoneIntl: '+2347042047811',
  address: {
    street: '59B Igboukwu Plaza, Sokoto Gate, Tradefair Complex, Lagos-Badagry Expressway',
    city: 'Lagos',
    region: 'Lagos',
    country: 'NG',
  },
  addressLine:
    '59B Igboukwu Plaza, Sokoto Gate, Tradefair Complex, Lagos-Badagry Expressway, Lagos',
  business: 'https://ibank.blocmfb.com',
  stores: {
    apple: 'https://apps.apple.com/app/bloc-microfinance-bank/id6788473815',
    google: 'https://play.google.com/store/apps/details?id=com.blocmfb.mobile',
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/blocmfb/',
    instagram: 'https://www.instagram.com/blocmfb',
    facebook: 'https://www.facebook.com/share/1GZiSisMNX/',
    x: 'https://twitter.com/blocmfb',
  },
  gtm: (import.meta.env.PUBLIC_GTM_ID as string) || '',
  contactEndpoint: (import.meta.env.PUBLIC_CONTACT_ENDPOINT as string) || '',
};
