export const INDUSTRIES = [
  "Healthcare",
  "Fintech / Banking",
  "Insurance",
  "E-commerce / Retail",
  "Real Estate",
  "Education / EdTech",
  "Hospitality / Travel",
  "Food Delivery / Restaurants",
  "Logistics / Delivery",
  "Automotive",
  "Telecom / ISP",
  "Utilities",
  "Government / Public Sector",
  "Legal Services",
  "B2B SaaS",
  "Recruitment / Staffing",
  "Debt Collection",
  "Home Services",
  "Other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];
