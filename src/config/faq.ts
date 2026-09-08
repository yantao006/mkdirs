import type { FAQConfig } from "@/types";

export const faqConfig: FAQConfig = {
  items: [
    {
      id: "1",
      question: "How do I submit a resource?",
      answer:
        "Create an account, verify your email, and use the Submit page. Add the website details, images, categories, and tags, then choose a submission plan.",
    },
    {
      id: "2",
      question: "When can a free submission be published?",
      answer:
        "Free submissions must be sent for review and approved before the submitter can publish them. The dashboard shows the current review state. No fixed review deadline is promised.",
    },
    {
      id: "3",
      question: "How do paid submissions work?",
      answer:
        "Pro and Sponsor submissions use Stripe checkout. A resource can be published after successful payment has been verified by the server. Prices appear only when this site's payment configuration is ready.",
    },
    {
      id: "4",
      question: "Can I update or unpublish my resource?",
      answer:
        "Your dashboard provides the original editing and publication controls for resources you own. Unpublished and hidden resources are excluded from public listings.",
    },
    {
      id: "5",
      question: "Is AI-assisted submission available?",
      answer:
        "The submission form includes AI assistance to draft website details. It requires a configured AI provider and your sign-in. You can review and edit the generated fields before submitting, or enter everything manually.",
    },
  ],
};
