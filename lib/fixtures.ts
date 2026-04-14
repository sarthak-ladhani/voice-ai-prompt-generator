import type { Inputs } from "./schema";

/** Representative inputs for A/B-testing the three pipelines. */
export const FIXTURES: { name: string; inputs: Inputs }[] = [
  {
    name: "Healthcare — appointment reminder",
    inputs: {
      industry: "Healthcare",
      useCase: "Appointment reminder / confirmation",
      mainGoal:
        "Call patients the day before their dental appointment to confirm, reschedule, or cancel. Capture the choice and any reason for cancellation.",
      agentName: "Maya",
      companyName: "BrightSmile Dental",
      language: "English",
    },
  },
  {
    name: "Fintech — payment collection",
    inputs: {
      industry: "Fintech / Banking",
      useCase: "Payment collection",
      mainGoal:
        "Politely remind customers about an overdue credit card payment, offer to take a payment over the phone or schedule one, and never disclose account details before identity verification.",
      agentName: "Aaron",
      companyName: "Northbank",
      language: "English",
    },
  },
  {
    name: "E-commerce — order status",
    inputs: {
      industry: "E-commerce / Retail",
      useCase: "Order status / tracking",
      mainGoal:
        "Help inbound callers check on the status of their order, troubleshoot delivery issues, and offer a refund or replacement when appropriate.",
      companyName: "Northwind Goods",
    },
  },
  {
    name: "Real estate — lead qualification",
    inputs: {
      industry: "Real Estate",
      useCase: "Lead qualification",
      mainGoal:
        "Call inbound web leads, qualify budget, location, timeline, and financing readiness, then book a tour with the right agent.",
      companyName: "Cedarwood Realty",
    },
  },
  {
    name: "Food delivery — order taking",
    inputs: {
      industry: "Food Delivery / Restaurants",
      useCase: "Order taking",
      mainGoal:
        "Take phone orders for a pizza restaurant: items, sizes, toppings, sides, customer name, address, and payment method. Confirm the full order before hanging up.",
      companyName: "Vesuvio Pizza",
    },
  },
];
