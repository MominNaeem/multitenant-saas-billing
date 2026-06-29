"use client";

import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for individuals getting started.",
    features: ["10 documents", "3 team members", "Basic support", "1 GB storage"],
    priceId: null,
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For growing teams that need more power.",
    features: ["500 documents", "25 team members", "Priority support", "API access", "50 GB storage", "Custom branding"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "For large organizations with advanced needs.",
    features: [
      "Unlimited documents",
      "Unlimited members",
      "Priority support",
      "SSO / SAML",
      "Audit logs",
      "Custom domain",
      "Unlimited storage",
      "SLA guarantee",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    cta: "Contact Sales",
    highlighted: false,
  },
];

async function handleCheckout(priceId: string | null | undefined) {
  if (!priceId) {
    window.location.href = "/register";
    return;
  }

  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId }),
  });

  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="text-xl font-bold text-blue-600">SaaSKit</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          The SaaS platform built
          <br />
          <span className="text-blue-600">for modern teams</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Manage your documents, collaborate with your team, and scale your business — all in one place. Multi-tenant,
          secure, and ready to grow.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow hover:bg-blue-700"
          >
            Start Free Trial
          </Link>
          <Link href="#pricing" className="text-base font-semibold text-gray-700 hover:text-gray-900">
            See pricing &rarr;
          </Link>
        </div>
      </section>

      <section id="pricing" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
          <p className="mt-4 text-center text-gray-600">Start free. Upgrade when you need to.</p>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 flex flex-col ${
                  plan.highlighted
                    ? "border-blue-600 bg-blue-600 text-white shadow-xl"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={`text-sm ${plan.highlighted ? "text-blue-100" : "text-gray-500"}`}>
                      /{plan.period}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm ${plan.highlighted ? "text-blue-100" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.priceId)}
                  className={`mt-8 w-full rounded-md py-2.5 text-sm font-semibold ${
                    plan.highlighted
                      ? "bg-white text-blue-600 hover:bg-blue-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} SaaSKit. All rights reserved.
      </footer>
    </div>
  );
}
