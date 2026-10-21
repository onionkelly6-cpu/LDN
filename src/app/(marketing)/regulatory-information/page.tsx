import { SITE_NAME } from "@/lib/site-config";

export const metadata = {
  title: "Regulatory Information",
  description: `Regulatory information for ${SITE_NAME}.`,
};

export default function RegulatoryInformationPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-4xl">Regulatory Information</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          SRA authorisation number, registered office and complaints
          procedure for {SITE_NAME} to be added here, together with the
          SRA&apos;s digital badge, once authorisation is confirmed.
        </p>
        <p>Nothing on this site is legal advice.</p>
      </div>
    </div>
  );
}
