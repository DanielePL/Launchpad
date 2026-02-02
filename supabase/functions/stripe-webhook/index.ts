// Supabase Edge Function for handling Stripe webhooks
// Deploy with: supabase functions deploy stripe-webhook --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Received event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organization_id;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!organizationId) {
    console.error("No organization_id in session metadata");
    return;
  }

  // Update organization with Stripe IDs
  const { error } = await supabase
    .from("organizations")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: "active",
    })
    .eq("id", organizationId);

  if (error) {
    console.error("Error updating organization:", error);
  } else {
    console.log(`Organization ${organizationId} subscription activated`);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    incomplete: "incomplete",
    incomplete_expired: "canceled",
    unpaid: "past_due",
  };

  const status = statusMap[subscription.status] || "incomplete";

  // Get the price to determine the plan
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = getPlanFromPriceId(priceId);
  const limits = getPlanLimits(plan);

  // Update organization
  const { error } = await supabase
    .from("organizations")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: status,
      subscription_plan: plan,
      max_seats: limits.maxSeats,
      max_creators: limits.maxCreators,
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error updating subscription:", error);
  } else {
    console.log(`Subscription ${subscription.id} updated to ${status}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Downgrade to free/starter tier
  const { error } = await supabase
    .from("organizations")
    .update({
      subscription_status: "canceled",
      subscription_plan: "starter",
      max_seats: 3,
      max_creators: 50,
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error handling subscription deletion:", error);
  } else {
    console.log(`Subscription ${subscription.id} canceled`);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Ensure subscription is active
  const { error } = await supabase
    .from("organizations")
    .update({
      subscription_status: "active",
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error updating payment status:", error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Mark subscription as past_due
  const { error } = await supabase
    .from("organizations")
    .update({
      subscription_status: "past_due",
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error updating payment failed status:", error);
  }
}

// Map Stripe Price IDs to plan names
// These should match your Stripe Dashboard
function getPlanFromPriceId(priceId: string | undefined): string {
  const priceMap: Record<string, string> = {
    // Monthly prices
    [Deno.env.get("STRIPE_PRICE_STARTER_MONTHLY") || ""]: "starter",
    [Deno.env.get("STRIPE_PRICE_PROFESSIONAL_MONTHLY") || ""]: "professional",
    [Deno.env.get("STRIPE_PRICE_ENTERPRISE_MONTHLY") || ""]: "enterprise",
    // Annual prices
    [Deno.env.get("STRIPE_PRICE_STARTER_ANNUAL") || ""]: "starter",
    [Deno.env.get("STRIPE_PRICE_PROFESSIONAL_ANNUAL") || ""]: "professional",
    [Deno.env.get("STRIPE_PRICE_ENTERPRISE_ANNUAL") || ""]: "enterprise",
  };

  return priceMap[priceId || ""] || "starter";
}

function getPlanLimits(plan: string): { maxSeats: number; maxCreators: number } {
  const limits: Record<string, { maxSeats: number; maxCreators: number }> = {
    starter: { maxSeats: 3, maxCreators: 50 },
    professional: { maxSeats: 10, maxCreators: 200 },
    enterprise: { maxSeats: -1, maxCreators: -1 }, // Unlimited
  };

  return limits[plan] || limits.starter;
}
