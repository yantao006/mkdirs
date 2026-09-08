import { useToast } from "@sanity/ui";
import { definePlugin } from "sanity";
import type { DocumentActionComponent } from "sanity";

export const SendNotificationEmailAction: DocumentActionComponent = (props) => {
  const toast = useToast();
  return {
    label: "Send notification email",
    icon: () => "📤",
    disabled: !props.published || Boolean(props.draft),
    title:
      "Publish the approved or rejected review state first. Sign in to the website with an administrator account before sending.",
    onHandle: async () => {
      if (!props.published) return;
      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: props.published._id }),
        });
        const data = await response.json();
        toast.push({
          status: response.ok ? "success" : "error",
          title: response.ok
            ? data.message
            : response.status === 403
              ? "Sign in at /auth/login with the website administrator account. Studio membership alone does not authorize email."
              : data.message ||
                "Email delivery failed; retry after checking email configuration.",
        });
      } catch {
        toast.push({
          status: "error",
          title: "The email request failed. No delivery has been confirmed.",
        });
      } finally {
        props.onComplete();
      }
    },
  };
};

export const customDocumentActionsPlugin = definePlugin({
  name: "custom-document-actions",
  document: {
    actions: (prev, context) =>
      context.schemaType === "item"
        ? [...prev, SendNotificationEmailAction]
        : prev,
  },
});
