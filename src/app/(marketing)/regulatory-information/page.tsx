import { SITE_NAME } from "@/lib/site-config";

export const metadata = {
  title: "Regulatory Information",
  description: `Regulatory status of ${SITE_NAME}: a fictional firm on a sample website, not regulated by the SRA.`,
};

export default function RegulatoryInformationPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-4xl">Regulatory Information</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          {SITE_NAME} is a <strong className="text-foreground">fictional firm</strong>{" "}
          created for a sample website. It is not a real solicitors&apos;
          practice, it has no SRA number, and it is not authorised or
          regulated by the Solicitors Regulation Authority.
        </p>
        <p>
          The solicitors, testimonials and outcomes shown on this site are
          invented for illustration. No legal services are offered and
          nothing on this site is legal advice.
        </p>
        <p>
          A real firm in England and Wales would show its SRA authorisation
          number, registered office and complaints procedure on this page,
          together with the SRA&apos;s digital badge.
        </p>
      </div>
    </div>
  );
}
