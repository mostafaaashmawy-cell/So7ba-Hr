export type Locale = 'ar' | 'en';

export interface NavLink {
  href: string;
  label: string;
}

export interface HeroContent {
  eyebrow: string;
  h1: string;
  subhead: string;
  cta1: string;
  cta2: string;
  trustBadges: string[];
}

export interface StatItem {
  value: string;
  description: string;
  isNumber?: boolean;
  numericValue?: number;
}

export interface PillarItem {
  number: string;
  title: string;
  description: string;
  footerText: string;
  footerHref?: string;
  badge?: string;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface TestimonialItem {
  quote: string;
  initials: string;
  name: string;
  role: string;
  isPilot?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ComparisonRow {
  criteria: string;
  excel: string;
  legacy: string;
  humai: string;
}

export interface BlueprintItem {
  title: string;
  benefit: string;
  features: string[];
  icon: string;
}

export interface PricingPlan {
  name: string;
  subtitle: string;
  cta: string;
  ctaHref: string;
  isPopular?: boolean;
}

export interface PricingFeature {
  name: string;
  starter: string;
  growth: string;
  enterprise: string;
}

export interface SecurityPillar {
  title: string;
  description: string;
}

export interface SiteDictionary {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  // Layout
  nav: {
    logo: string;
    logoTagline: string;
    links: NavLink[];
    login: string;
    cta: string;
  };
  footer: {
    tagline: string;
    quickLinksTitle: string;
    legalTitle: string;
    legalLinks: string[];
    contactTitle: string;
    email: string;
    phone: string;
    location: string;
    bookDemo: string;
    copyright: string;
    statusText: string;
  };
  // Home Page
  home: {
    meta: { title: string; description: string };
    hero: HeroContent;
    stats: {
      sectionTitle: string;
      sectionSubtitle: string;
      items: StatItem[];
    };
    pillars: {
      badge: string;
      title: string;
      subtitle: string;
      items: PillarItem[];
    };
    whatsappDemo: {
      badge: string;
      title: string;
      subtitle: string;
      chatDisclaimer?: string;
    };
    howItWorks: {
      badge: string;
      title: string;
      subtitle: string;
      steps: StepItem[];
    };
    comparison: {
      badge: string;
      title: string;
      subtitle: string;
      headers: string[];
      rows: ComparisonRow[];
    };
    testimonials: {
      badge: string;
      title: string;
      subtitle: string;
      items: TestimonialItem[];
      pilotLabel: string;
    };
    cta: {
      title: string;
      description: string;
      button: string;
    };
  };
  // Blueprints Page
  blueprints: {
    meta: { title: string; description: string };
    hero: { title: string; description: string };
    items: BlueprintItem[];
    whyTitle: string;
    whyItems: { title: string; description: string }[];
    cta: { title: string; description: string; button: string };
  };
  // WhatsApp Assistant Page
  whatsapp: {
    meta: { title: string; description: string };
    hero: { title: string; description: string };
    capabilitiesTitle: string;
    chatDisclaimer?: string;
    security: { title: string; items: { title: string; description: string }[] };
    plans: { title: string; items: { plan: string; limit: string }[] };
    cta: { title: string; description: string; button: string };
  };
  // Pricing Page
  pricing: {
    meta: { title: string; description: string };
    hero: { title: string; description: string; badges: string[] };
    plans: PricingPlan[];
    features: PricingFeature[];
    faq: FAQItem[];
    cta: { title: string; description: string; button: string };
  };
  // Security Page
  security: {
    meta: { title: string; description: string };
    hero: { title: string; description: string };
    pillars: SecurityPillar[];
    cta: { title: string; description: string; button: string };
  };
  // Contact Page
  contact: {
    meta: { title: string; description: string };
    hero: { title: string; description: string };
    form: {
      name: string;
      company: string;
      email: string;
      phone: string;
      employees: string;
      message: string;
      submit: string;
    };
    whatsappLabel: string;
    whatsappNumber: string;
    benefits: string[];
  };
  // Shared
  shared: {
    faq: {
      sectionTitle: string;
      items: FAQItem[];
    };
  };
}
