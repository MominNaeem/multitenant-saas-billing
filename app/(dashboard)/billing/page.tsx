"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

const planDetails: Record<string, { name: string; price: string; color: string }> = {
  free: { name: "Free", price: "$0/month", color: "bg-gray-100 text-gray-700" },
  pro: { name: "Pro", price: "$29/month", color: "bg-blue-100 text-blue-700" },
  enterprise: { name: "Enterprise", price: "$99/month", color: "bg-purple-100 text-purple-700" },
};

export default function BillingPage() {
  const { data: session } = useSession();
  const plan = (session?.user as { plan?: string })?.plan ?? "free";
  const details = planDetails[plan] ?? planDetails.free;
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState("");

  async function handleUpgrade(targetPlan: "pro" | "enterprise") {
    setLoadingCheckout(true);
    setError("");

    const priceId =
      targetPlan === "pro"
        ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID;

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to start checkout.");
      setLoadingCheckout(false);
      return;
    }

    window.location.href = data.url;
  }

  async function handlePortal() {
    setLoadingPortal(true);
    setError("");

    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to open billing portal.");
      setLoadingPortal(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Billing</h1>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${details.color}`}>
              {details.name}
            </span>
            <span className="text-sm text-gray-500">{details.price}</span>
          </div>
          {plan !== "free" && (
            <button
              onClick={handlePortal}
              disabled={loadingPortal}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {loadingPortal ? "Loading..." : "Manage Subscription"}
            </button>
          )}
        </div>
      </div>

      {plan !== "enterprise" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Upgrade Your Plan</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {plan === "free" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
                <h3 className="font-semibold text-blue-900">Pro</h3>
                <p className="mt-1 text-2xl font-bold text-blue-900">$29/mo</p>
                <ul className="mt-3 space-y-1 text-sm text-blue-800">
                  <li>500 documents</li>
                  <li>25 team members</li>
                  <li>Priority support</li>
                  <li>API access</li>
                </ul>
                <button
                  onClick={() => handleUpgrade("pro")}
                  disabled={loadingCheckout}
                  className="mt-4 w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {loadingCheckout ? "Redirecting..." : "Upgrade to Pro"}
                </button>
              </div>
            )}

            <div className="rounded-lg border border-purple-200 bg-purple-50 p-5">
              <h3 className="font-semibold text-purple-900">Enterprise</h3>
              <p className="mt-1 text-2xl font-bold text-purple-900">$99/mo</p>
              <ul className="mt-3 space-y-1 text-sm text-purple-800">
                <li>Unlimited documents</li>
                <li>Unlimited members</li>
                <li>SSO / SAML</li>
                <li>Audit logs</li>
                <li>Custom domain</li>
              </ul>
              <button
                onClick={() => handleUpgrade("enterprise")}
                disabled={loadingCheckout}
                className="mt-4 w-full rounded-md bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {loadingCheckout ? "Redirecting..." : "Upgrade to Enterprise"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
