import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ active: false });
  }

  // Check Stripe for active subscriptions
  const subs = await getStripe().subscriptions.list({
    customer: subscription.stripeCustomerId,
    status: "active",
    limit: 1,
  });

  if (subs.data.length > 0) {
    const stripeSub = subs.data[0];
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        stripeSubscriptionId: stripeSub.id,
        stripePriceId: stripeSub.items.data[0]?.price?.id,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        plan: stripeSub.metadata?.plan || null,
      },
    });
    return NextResponse.json({ active: true });
  }

  return NextResponse.json({ active: false });
}
