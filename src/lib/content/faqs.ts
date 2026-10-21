// General, firm-wide FAQ shown on the home page. Practice-area-specific
// FAQs live alongside each area in practice-areas.ts.
export const generalFaqs = [
  {
    id: "areas-served",
    question: "Where is the firm based?",
    answer:
      "LDN Legal Associates is a London practice advising clients across England and Wales.",
  },
  {
    id: "consultation",
    question: "How does the enquiry form work?",
    answer:
      "Enquiries submitted through the contact form go straight to our team as new leads, where we review them and get in touch to arrange next steps.",
  },
  {
    id: "billing",
    question: "How would fees work?",
    answer:
      "Private client firms typically offer fixed fees for wills and lasting powers of attorney, and hourly or fixed fees for probate, agreed in writing at the outset.",
  },
  {
    id: "portal",
    question: "What is the client portal?",
    answer:
      "The portal shows each client their matter's progress, shared documents and a message thread with their solicitor.",
  },
  {
    id: "timeline",
    question: "How long do matters take?",
    answer:
      "A will can be ready within a few weeks; a straightforward probate often takes nine to twelve months. Each practice area page explains typical timescales.",
  },
  {
    id: "first-meeting",
    question: "What would I bring to a first meeting?",
    answer:
      "For a will, a summary of your assets and family. For probate, the death certificate, the will and any recent statements. Photo ID is always needed.",
  },
  {
    id: "virtual-consultations",
    question: "Are meetings available by video?",
    answer:
      "Yes, meetings are available in person or by video, with signing arranged in person where the law requires it.",
  },
] as const;
