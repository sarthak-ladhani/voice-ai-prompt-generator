export const USE_CASES = [
  "Inbound customer support",
  "Outbound sales / cold outreach",
  "Lead qualification",
  "Appointment booking",
  "Appointment reminder / confirmation",
  "Order taking",
  "Order status / tracking",
  "Payment collection",
  "Debt recovery",
  "Survey / NPS",
  "Onboarding / activation",
  "Renewal / retention",
  "Feedback collection",
  "Reception / call routing",
  "Information / FAQ",
  "Verification (KYC / OTP)",
  "Other",
] as const;

export type UseCase = (typeof USE_CASES)[number];
