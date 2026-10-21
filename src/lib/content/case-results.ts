import { practiceAreas } from "@/lib/content/practice-areas";

// Case outcomes. Years are TBD pending confirmation of real matter dates.
export const caseResults = [
  {
    slug: "farm-succession-plan",
    practiceArea: "wills-succession",
    figure: "3 Generations",
    year: "TBD",
    summary: "Succession plan for a family farm passing across three generations.",
    detail:
      "Wills and a family partnership agreement were coordinated so the farm could pass to the next generation while providing fairly for children not involved in the business.",
  },
  {
    slug: "blended-family-wills",
    practiceArea: "wills-succession",
    figure: "Mirror Wills",
    year: "TBD",
    summary: "Life-interest wills protecting children from both partners' earlier relationships.",
    detail:
      "A life-interest trust let the surviving partner stay in the family home while securing each partner's share for their own children.",
  },
  {
    slug: "multi-jurisdiction-estate",
    practiceArea: "probate-estates",
    figure: "3 Countries",
    year: "TBD",
    summary: "Estate administered with property in England, Spain and Scotland.",
    detail:
      "Local advisers in each country were coordinated so the English grant, the Scottish confirmation and the Spanish formalities progressed in parallel.",
  },
  {
    slug: "estate-completed-on-time",
    practiceArea: "probate-estates",
    figure: "10 Months",
    year: "TBD",
    summary: "Estate with a property sale fully administered and distributed within ten months.",
    detail:
      "Early valuation and marketing of the property meant the sale completed shortly after the grant was issued, keeping the overall timetable short.",
  },
  {
    slug: "discretionary-trust-restructure",
    practiceArea: "trusts",
    figure: "Restructured",
    year: "TBD",
    summary: "Discretionary trust updated to reflect a family's changed circumstances.",
    detail:
      "New trustees were appointed, the letter of wishes was refreshed and the trust's registration was brought up to date with HMRC.",
  },
  {
    slug: "iht-forecast-reduced",
    practiceArea: "inheritance-tax",
    figure: "£220K",
    year: "TBD",
    summary: "Forecast inheritance tax reduced through gifting and relief planning.",
    detail:
      "A gifting programme from surplus income, together with business property relief on qualifying shares, reduced the projected inheritance tax bill.",
  },
  {
    slug: "lpa-registered",
    practiceArea: "lasting-powers-of-attorney",
    figure: "Both LPAs",
    year: "TBD",
    summary: "Financial and health LPAs prepared and registered for a couple ahead of surgery.",
    detail:
      "Both lasting powers of attorney were signed in the correct order and submitted for registration with the Office of the Public Guardian.",
  },
  {
    slug: "deputyship-granted",
    practiceArea: "court-of-protection",
    figure: "4 Months",
    year: "TBD",
    summary: "Property and affairs deputyship obtained for a parent with dementia.",
    detail:
      "A complete application with clear capacity evidence avoided requests for further information, allowing the family to pay care home fees.",
  },
  {
    slug: "inheritance-act-mediation",
    practiceArea: "contentious-probate",
    figure: "Settled",
    year: "TBD",
    summary: "Inheritance Act 1975 claim settled at mediation without a trial.",
    detail:
      "A one-day mediation produced a settlement that provided for the claimant and preserved the relationship between the siblings involved.",
  },
] as const;

export const caseResultStats = [
  { label: "Matters shown", value: "9" },
  { label: "Practice areas", value: `${practiceAreas.length}` },
  { label: "Office", value: "London" },
];
