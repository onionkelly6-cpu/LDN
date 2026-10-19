// General, firm-wide FAQ shown on the home page. Practice-area-specific
// FAQs live alongside each area in practice-areas.ts.
export const generalFaqs = [
  {
    id: "sample-site",
    question: "Is Crestbridge a real firm?",
    answer:
      "No. This is a sample website for a fictional firm. Crestbridge Private Client Solicitors is not a real solicitors' practice and is not authorised or regulated by the Solicitors Regulation Authority.",
  },
  {
    id: "areas-served",
    question: "Where would the firm be based?",
    answer:
      "The fictional firm is presented as a London practice advising clients across England and Wales.",
  },
  {
    id: "consultation",
    question: "How does the enquiry form work?",
    answer:
      "Enquiries submitted through the contact form appear in the firm workspace as new leads, where staff can review them and convert them into matters. It demonstrates the intake workflow only.",
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
      "The portal shows each client their matter's progress, shared documents and a message thread with their solicitor. In this sample site it uses demo accounts and demo data.",
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
      "The sample firm is presented as offering meetings in person or by video, with signing arranged in person where the law requires it.",
  },
] as const;
