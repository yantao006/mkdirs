import "server-only";

export async function sendMessageToDiscord(
  sessionId: string,
  customerId: string,
  userName: string,
  amount: number,
  currency = "usd",
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl)
    throw new Error("Discord notifications are awaiting configuration");
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "mkdirs",
      embeds: [
        {
          title: "Payment received",
          fields: [
            {
              name: "Customer",
              value: userName || "Directory member",
              inline: true,
            },
            {
              name: "Amount",
              value: new Intl.NumberFormat("en", {
                style: "currency",
                currency,
              }).format(amount),
              inline: true,
            },
            { name: "Customer ID", value: customerId },
            { name: "Checkout session", value: sessionId },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Discord did not accept the notification");
}
