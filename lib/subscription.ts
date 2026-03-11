import { prisma } from "./prisma";

export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) return null;

  const isActive =
    subscription.status === "active" &&
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd > new Date();

  return {
    ...subscription,
    isActive,
  };
}

export async function isUserSubscribed(userId: string): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  return sub?.isActive ?? false;
}
