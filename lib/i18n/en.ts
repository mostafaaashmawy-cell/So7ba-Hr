import type { SiteDictionary } from './types';

export const en: SiteDictionary = {
  locale: 'en',
  dir: 'ltr',
  nav: {
    logo: 'HumAi',
    logoTagline: 'Smart HR & Automation',
    links: [
      { href: '/en', label: 'Core Platform' },
      { href: '/en/blueprints', label: 'HR Blueprints' },
      { href: '/en/whatsapp-assistant', label: 'WhatsApp Assistant' },
      { href: '/en/security', label: 'Security & Privacy' },
      { href: '/en/pricing', label: 'Pricing' },
      { href: '/en/contact', label: 'Contact' },
    ],
    login: 'Log In',
    cta: 'Start Free Trial',
  },
  footer: {
    tagline: 'The leading platform for automating HR and operations management for businesses across Egypt and the Middle East, powered by an AI assistant on WhatsApp.',
    quickLinksTitle: 'Quick Links',
    legalTitle: 'Legal',
    legalLinks: ['Privacy Policy', 'Terms of Use', 'Cookie Policy', 'SLA'],
    contactTitle: 'Contact',
    email: 'info@humai.app',
    phone: '+20 100 000 0000',
    location: 'Cairo, Egypt',
    bookDemo: 'Book a Free Demo',
    copyright: '© 2026 HumAi Platform. All rights reserved.',
    statusText: 'All cloud systems operational',
  },
  home: {
    meta: {
      title: 'HumAi | AI-Powered HR & Payroll Platform for Egypt & the Middle East',
      description: 'Run attendance, leave, and payroll from one dashboard — or straight from WhatsApp. The cloud HR platform built for SMEs across Egypt and the region.',
    },
    hero: {
      eyebrow: 'The Next Generation of HR & Payroll',
      h1: 'HR and payroll management — in one place, with one message on WhatsApp.',
      subhead: 'HumAi is the all-in-one cloud platform for attendance, leave, payroll, and workplace policy — built for small and mid-sized businesses across Egypt and the Middle East, powered by an AI assistant that speaks your team\'s language, right inside WhatsApp.',
      cta1: 'Start Your Free Trial — No Card Required',
      cta2: 'See the WhatsApp Assistant in Action',
      trustBadges: [
        'Built around Egyptian and regional labor best practices',
        'Fully isolated, multi-tenant data architecture',
        'Full support for local payment rails: InstaPay, e-wallets, bank transfer',
      ],
    },
    stats: {
      sectionTitle: 'Numbers You Can Trust',
      sectionSubtitle: 'Proven operational efficiency that shows up directly in your time and your budget.',
      items: [
        { value: '80%', description: 'Save up to 80% of the time spent each month preparing payroll and calculating deductions', isNumber: true, numericValue: 80 },
        { value: 'Geofencing', description: 'Accurate, location-verified attendance that curbs time fraud', isNumber: false },
        { value: 'Seconds', description: 'Check your team\'s attendance in seconds, straight from WhatsApp — no dashboard required', isNumber: false },
      ],
    },
    pillars: {
      badge: 'The Core Foundation',
      title: 'The Three Pillars',
      subtitle: 'Three key pillars designed to give business owners and managers complete peace of mind and full control.',
      items: [
        {
          number: '①',
          title: 'An Integrated HR Platform',
          description: 'Full control over employee records, digital contracts, shift management, and leave balances — with precision and strict governance.',
          footerText: 'Full employee record governance',
        },
        {
          number: '②',
          title: 'A Library of Ready-to-Use HR Blueprints',
          description: 'Don\'t start from zero. Activate attendance policies, contract templates, and approved bonus/penalty policies built for Egyptian companies, in one click.',
          footerText: 'Explore the Blueprint Library',
          footerHref: '/en/blueprints',
        },
        {
          number: '③',
          title: 'Your Executive Manager on WhatsApp',
          description: 'A smart assistant connected directly to your company\'s data. Ask about delays in Egyptian Arabic, or have it log a bonus or approve a leave request — on the go.',
          footerText: 'See what the assistant can do',
          footerHref: '/en/whatsapp-assistant',
          badge: 'AI Powered',
        },
      ],
    },
    whatsappDemo: {
      badge: 'Live Interactive Demo',
      title: 'See the WhatsApp Assistant in Action',
      subtitle: 'See for yourself how the assistant understands everyday questions and executes actions securely and accurately.',
      chatDisclaimer: 'Shown in Egyptian Arabic — the assistant understands and replies fluently in the dialect your team already uses.',
    },
    howItWorks: {
      badge: 'Quick Steps',
      title: 'How It Works',
      subtitle: 'Move from administrative complexity to full automation in 3 simple steps.',
      steps: [
        { number: '1', title: 'Set up your company in two minutes', description: 'Pick your company name, branches, and core work hours with ease.' },
        { number: '2', title: 'Choose the Blueprint that fits your business', description: 'Apply ready-made shift and policy templates (retail, offices, restaurants, agencies) in one click.' },
        { number: '3', title: 'Add your team and go live', description: 'Employees check in from their phones; the system handles deductions, advances, and payroll automatically.' },
      ],
    },
    comparison: {
      badge: 'The Real Comparison',
      title: 'Why HumAi — and Nothing Else',
      subtitle: 'See the difference between relying on spreadsheets or legacy systems, and running your company on a fully automated, intelligent platform.',
      headers: ['Criteria', 'Manual Excel Files', 'Traditional HR Systems', 'HumAi'],
      rows: [
        { criteria: 'Setup time', excel: 'Days per payroll cycle', legacy: 'Weeks of implementation & training', humai: 'Minutes' },
        { criteria: 'Total cost', excel: '"Free" on paper, costly in time and effort', legacy: 'High, not built for SME budgets', humai: 'Built for SME budgets' },
        { criteria: 'Full Arabic & Egyptian support', excel: 'Partial, unstructured', legacy: 'Rare, requires heavy localization', humai: 'Full — language, InstaPay, local labor practices' },
        { criteria: 'WhatsApp control (exclusive)', excel: 'Not available ✗', legacy: 'Not available ✗', humai: 'Built in, AI-powered ✓' },
        { criteria: 'Human error risk', excel: 'High (manual formulas, unchecked edits)', legacy: 'Medium (manual data entry)', humai: 'Very low (double confirmation + full audit trail)' },
      ],
    },
    testimonials: {
      badge: 'Real Experiences',
      title: 'What Business Leaders Say',
      subtitle: 'What company leaders and executives say after experiencing HumAi.',
      pilotLabel: 'Pilot Case Study',
      items: [
        {
          quote: 'We saved over 15 hours a month we used to spend on spreadsheets and reviewing deductions and advances — and the WhatsApp assistant lets me stay on top of things even when I\'m out of the office.',
          initials: 'AM',
          name: 'Ahmed M.',
          role: 'Managing Director, Trading & Distribution Company',
        },
        {
          quote: 'Since we started using HumAi, I\'ve had real-time visibility across all my branches from one place — something I used to wait a full month for my accountant to report.',
          initials: 'HA',
          name: 'Hossam A.',
          role: 'Operations Manager, Restaurant & Café Chain',
          isPilot: true,
        },
        {
          quote: 'Geofenced check-ins on employee phones completely eliminated buddy-punching, and payroll now runs with approved deductions in one click.',
          initials: 'SK',
          name: 'Sara K.',
          role: 'HR Manager, Digital Marketing Agency',
          isPilot: true,
        },
      ],
    },
    cta: {
      title: 'Ready to move your company into the era of smart automation?',
      description: 'Join now and start managing your team with efficiency, precision, and zero complexity.',
      button: 'Start Free Now — No Credit Card Required',
    },
  },
  blueprints: {
    meta: {
      title: 'Ready-to-Use HR Blueprints | HumAi',
      description: 'Proven, ready-made operating blueprints — run your company on best practices in minutes.',
    },
    hero: {
      title: 'Proven, ready-made operating blueprints — run your company on best practices in minutes.',
      description: 'Stop drafting attendance policies or writing contract templates from scratch. HumAi gives you a full library of Blueprints designed to fit different business types across the local market.',
    },
    items: [
      {
        title: 'Agencies & Consultancies Blueprint',
        benefit: 'Full flexibility for remote and hybrid teams, without administrative overhead.',
        features: ['Flexible working hours', 'Remote check-in without strict geofencing', 'Project targets and periodic performance reviews'],
        icon: 'Briefcase',
      },
      {
        title: 'Retail & F&B Blueprint',
        benefit: 'Precise control over multi-branch shifts, without fake check-ins.',
        features: ['Variable shifts and extended overnight shifts', 'Precise geofenced check-in per branch', 'Automatic calculation of public-holiday and overtime pay'],
        icon: 'Store',
      },
      {
        title: 'SME Lean Blueprint',
        benefit: 'A complete payroll system ready from day one, no prior HR expertise required.',
        features: ['Standard payroll cycle (26th to 25th)', 'Annual leave policy (21 days) with a 50% salary advance cap', 'Contract generator with cash and instant InstaPay payout templates'],
        icon: 'Building',
      },
    ],
    whyTitle: 'Why Use Blueprints?',
    whyItems: [
      { title: 'One-click activation', description: 'Apply attendance, lateness, and deduction policies automatically' },
      { title: '100% customizable', description: 'Adjust work hours, deduction rates, and approval flows anytime' },
      { title: 'Built on local market practices', description: 'Always paired with a recommendation for periodic legal review' },
    ],
    cta: {
      title: 'Ready to apply the right Blueprint for your business?',
      description: 'Start your free trial and activate the right operating template in minutes.',
      button: 'Start Your Free Trial',
    },
  },
  whatsapp: {
    meta: {
      title: 'WhatsApp AI Assistant for HR | HumAi',
      description: 'The first HR assistant that runs your company through WhatsApp conversations.',
    },
    hero: {
      title: 'The first HR assistant that runs your company through WhatsApp conversations.',
      description: 'No need to open a dashboard every hour. Send a text or voice message to the assistant on WhatsApp, and get an instant answer straight from your company\'s data — or have it execute financial and administrative actions, securely and accurately.',
    },
    capabilitiesTitle: 'What Can the Assistant Do?',
    chatDisclaimer: 'Shown in Egyptian Arabic — the assistant understands and replies fluently in the dialect your team already uses.',
    security: {
      title: 'Security & Data Isolation',
      items: [
        { title: 'Sender verification', description: 'The assistant only responds to phone numbers registered as Super Admin or Manager' },
        { title: 'Full data isolation', description: 'The assistant can never access another company\'s data; every query is locked to the sender\'s Tenant ID at the system level' },
        { title: 'Zero hallucination', description: 'The assistant calls defined functions to read real data from the database; it never invents numbers' },
      ],
    },
    plans: {
      title: 'Availability by Plan',
      items: [
        { plan: 'Starter', limit: 'Limited basic queries (e.g. up to 50/month)' },
        { plan: 'Growth & Automation', limit: 'Higher limit (e.g. up to 300/month)' },
        { plan: 'Enterprise', limit: 'Unlimited' },
      ],
    },
    cta: {
      title: 'Ready to try the WhatsApp assistant on your own data?',
      description: 'Start your free trial now.',
      button: 'Start Your Free Trial',
    },
  },
  pricing: {
    meta: {
      title: 'HumAi Pricing & Plans | Start Your Free Trial',
      description: 'Choose the plan that fits your team size. Every plan starts with a full-featured free trial — no credit card required.',
    },
    hero: {
      title: 'Plans designed to grow with your team',
      description: 'Choose the plan that fits your team size. Every plan starts with a full-featured free trial — no credit card required.',
      badges: ['No commitment or credit card required', 'Upgrade or cancel anytime'],
    },
    plans: [
      { name: 'Starter', subtitle: 'Up to 15 employees', cta: 'Start Free Trial', ctaHref: '/en/contact' },
      { name: 'Growth & Automation', subtitle: 'Up to 50 employees', cta: 'Start Free Trial', ctaHref: '/en/contact', isPopular: true },
      { name: 'HumAi Enterprise', subtitle: '50+ employees', cta: 'Talk to Sales', ctaHref: '/en/contact' },
    ],
    features: [
      { name: 'Geofenced attendance & check-out', starter: '✓', growth: '✓', enterprise: '✓' },
      { name: 'Leave & permission management', starter: '✓', growth: '✓', enterprise: '✓' },
      { name: 'Digital payslips', starter: '✓', growth: '✓', enterprise: '✓' },
      { name: 'Automated payroll engine', starter: 'Basic', growth: 'Full', enterprise: 'Full + advanced proration' },
      { name: 'Ready-to-use HR Blueprints', starter: '✗', growth: '✓', enterprise: '✓' },
      { name: 'Advanced shift management', starter: '✗', growth: '✓', enterprise: '✓' },
      { name: 'Multi-level approval chains', starter: '✗', growth: '✓', enterprise: '✓' },
      { name: 'WhatsApp AI assistant', starter: 'Limited', growth: 'Higher limit', enterprise: 'Unlimited' },
      { name: 'Full administrative audit log', starter: 'Basic', growth: '✓', enterprise: 'Advanced' },
      { name: 'Support', starter: 'Email', growth: 'Email + chat', enterprise: 'Dedicated account manager' },
      { name: 'Custom data integration (API)', starter: '✗', growth: '✗', enterprise: '✓' },
    ],
    faq: [
      { question: 'Can I upgrade plans later?', answer: 'Yes, upgrade anytime without losing your data.' },
      { question: 'Does the free trial include every feature?', answer: 'Yes, so you can fully evaluate the platform before subscribing.' },
    ],
    cta: {
      title: 'Ready to start your HumAi journey?',
      description: 'Start your free trial now with no commitment.',
      button: 'Start Free Now',
    },
  },
  security: {
    meta: {
      title: 'Security & Data Protection at HumAi',
      description: 'Your employees\' data and your company\'s payroll — protected by enterprise-grade cloud security.',
    },
    hero: {
      title: 'Your employees\' data and your company\'s payroll — protected by enterprise-grade cloud security.',
      description: 'We take the security of your data seriously. Every feature in HumAi is designed to protect your employees\' privacy and your company\'s operational confidentiality.',
    },
    pillars: [
      { title: 'Full data isolation (multi-tenant architecture)', description: 'Every company runs in a fully independent data environment' },
      { title: 'Encryption', description: 'Industry-standard encryption for data in transit and at rest' },
      { title: 'Role-based access control (RBAC)', description: 'Every user sees only what their role allows' },
      { title: 'Regular backups', description: 'For business continuity, with no data loss' },
      { title: 'Full audit trail', description: 'Every change logged with who, when, and a before/after diff' },
      { title: 'Double confirmation on financial actions', description: 'No deduction or bonus is written via WhatsApp without explicit confirmation from an authorized user' },
    ],
    cta: {
      title: 'Questions about your data security?',
      description: 'Talk to our team and get clear answers about how we protect your company\'s data.',
      button: 'Contact Us',
    },
  },
  contact: {
    meta: {
      title: 'Contact HumAi | Book a Free Demo',
      description: 'Want to see HumAi running on your own company\'s data? Book a free 30-minute demo with our team.',
    },
    hero: {
      title: 'Want to see HumAi running on your own company\'s data?',
      description: 'Book a free 30-minute demo with our team and see how much time you\'ll save from week one.',
    },
    form: {
      name: 'Full Name',
      company: 'Company Name',
      email: 'Email Address',
      phone: 'Phone / WhatsApp Number',
      employees: 'Number of Employees',
      message: 'Additional Message (optional)',
      submit: 'Book Your Free Demo',
    },
    whatsappLabel: 'Or reach us directly on WhatsApp',
    whatsappNumber: 'https://wa.me/201000000000',
    benefits: [
      'A personalized demo on your actual company data',
      'Answers to all your questions about technology and security',
      'No commitment — the decision is entirely yours',
    ],
  },
  shared: {
    faq: {
      sectionTitle: 'Frequently Asked Questions',
      items: [
        { question: 'Is my company\'s data secure and isolated from other clients?', answer: 'Yes. HumAi runs on a multi-tenant architecture that fully isolates each company\'s data, with role-based access and full encryption in transit and at rest.' },
        { question: 'Is the system compliant with Egyptian labor law?', answer: 'HumAi is built around current best practices in the Egyptian market (payroll cycles, leave entitlements, overtime pay). We always recommend an internal legal review to confirm full compliance with your specific business activity.' },
        { question: 'Do I need a technical team to set it up?', answer: 'No — HumAi is fully cloud-based and works directly from your browser or mobile app, with no installation or maintenance required on your end.' },
        { question: 'Is the WhatsApp assistant available on every plan?', answer: "It's available as a limited trial on the Starter and Growth plans, and unlimited on the Enterprise plan. See the Pricing page for details." },
        { question: 'Is there a free trial?', answer: 'Yes — start with a full-featured free trial, no credit card required.' },
      ],
    },
  },
};
