import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  applicationId: string;
}

const TERMS_CONTENT = [
  "I certify that the information provided in this application is true and correct.",
  "No evaluation will be prepared and no refunds will be issued if IFCS determines that your documents have been in any way altered, tampered or forged. Furthermore, all relevant institutions listed on the application will be notified of the forged documentation submitted to IFCS.",
  "Payment must be made in U.S. dollars by money order, check, cash, Visa or MasterCard. If the money order or check is issued by a bank outside of the U.S., it must contain the printed name of the U.S. bank with which the bank is affiliated. A $40 fee will be charged for all returned checks. All fees are subject to change without notice.",
  "Refunds will be made only if an applicant has overpaid for services to IFCS. Applications for 8-10 day service can only be cancelled within 24hr of submission and will be subject to a $50 minimum processing fee. No refunds can be issued for 24hr, and 3-day service.",
  "Institute of Foreign Credential Services reserves the right to refuse service to anyone for any reason.",
  "Institute of Foreign Credential Services reserves the right to request additional information and/or official documentation by the issuing institution during the application process. Additionally, IFCS reserves the right to contact the issuing institution and authenticate your educational credentials.",
  "Two copies of each evaluation are included with the regular evaluation fee. You will need to pay for shipping: Additional copies may be requested for$25 each, plus shipping.",
  "My evaluation and/or translation will be completed entirely based on the documents I submit to IFCS.",
  "I release IFCS from any liability for damages resulting from the use of an evaluation or translation by me or third party.",
  "Evaluation reports can only be released once we have received official documents directly from the issuing institution(s), or confirmation of your studies, if you had selected our verification service.",
];

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h3 className="font-bold text-foreground">{title}</h3>
    {children}
  </div>
);

const Field = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <p className="text-sm text-foreground/90">
      <span className="italic font-medium">{label}:</span> {value}
    </p>
  );
};

const ViewApplicationDialog = ({ open, onOpenChange, data, applicationId }: ViewApplicationDialogProps) => {
  if (!data) return null;

  const d = data;

  const translationText = d.translationOption === "english"
    ? "All my documents are in English and I do not need translation of my documents"
    : d.translationOption === "own-translation"
    ? "I will provide a certified translation"
    : "My documents are in a foreign language and I need a quote for translation services";

  const authText = d.authOption === "authenticate"
    ? "Perform Document Authentication"
    : "I Will Arrange With The Issuing Institution(s) To Send Official Documents To IFCS";

  const deliveryLabels: string[] = [];
  if (d.deliveryOptions?.includes("email-self")) deliveryLabels.push("E Mail To The Address Provided");
  if (d.deliveryOptions?.includes("email-inst")) deliveryLabels.push("Email My Report To An Institution ($5)");
  if (d.deliveryOptions?.includes("us-postage")) deliveryLabels.push("US Postage ($15)");
  if (d.deliveryOptions?.includes("domestic-courier")) deliveryLabels.push("Domestic Courier - USPS Priority Mail ($25)");
  if (d.deliveryOptions?.includes("intl-courier")) deliveryLabels.push("International Courier ($75)");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Application — {applicationId}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Header */}
            <div className="space-y-1">
              <p className="font-bold text-foreground">INSTITUTE OF FOREIGN CREDENTIAL SERVICES</p>
              <p className="text-muted-foreground text-xs">6 CEDAR ST, DOBBS FERRY, NY 10522 WWW.IFCSEVALS.COM</p>
              <p className="text-muted-foreground text-xs">PHONE: (914) 693-2840 FAX: (914) 231-7782 EMAIL: INFO@IFCSEVALS.COM</p>
            </div>

            <p className="font-semibold text-muted-foreground text-xs">Please do not reply to this email</p>

            <Section title="Part 1 - Personal Information">
              <Field label="First name" value={d.firstName} />
              {d.middleName && <Field label="Middle name" value={d.middleName} />}
              <Field label="Last name" value={d.lastName} />
              <Field label="Date of Birth" value={d.dob} />
              <Field label="Gender" value={d.gender ? d.gender.charAt(0).toUpperCase() + d.gender.slice(1) : ""} />
              {d.homePhone && <Field label="Home Phone" value={d.homePhone} />}
              <Field label="Cell Phone" value={d.cellPhone} />
              <Field label="E-mail Address" value={d.email} />
            </Section>

            <Section title="Part 2 - Academic History">
              <Field label="Name of Institution" value={d.institutionName} />
              <Field label="Country" value={d.country} />
              <Field label="Dates Attended" value={d.attendance} />
              <Field label="Degree(s) Earned" value={d.degrees} />
            </Section>

            <Section title="Part 3 - Purpose of Evaluation">
              <Field label="Purpose of Evaluation" value={d.purpose} />
            </Section>

            <Section title="Part 4 - Types of Evaluation Reports and Additional Services">
              <Field label="Credential Evaluations" value={`${d.serviceTitle} ${d.processingTime}`} />
              <Field label="Translation" value={translationText} />
              <Field label="Authentication" value={authText} />
              <Field label="Delivery" value={deliveryLabels.join(", ")} />
            </Section>

            {d.fileNames && d.fileNames.length > 0 && (
              <div>
                <p className="font-bold text-foreground">Attachments</p>
                {d.fileNames.map((name: string, i: number) => (
                  <p key={i} className="text-sm text-accent">{name}</p>
                ))}
              </div>
            )}

            <Section title="Part 5 - Payment Options">
              {d.discountCode && d.discountAmount > 0 && (
                <Field label="Discount Code" value={`${d.discountCode} (-$${d.discountAmount})`} />
              )}
              <p className="text-sm font-bold italic text-foreground">Total: ${d.totalPrice?.toFixed(2)}</p>
            </Section>

            <div>
              <p className="font-bold text-foreground mb-2">I agree to the following terms and conditions:</p>
              <ol className="list-decimal pl-5 space-y-1 text-xs text-muted-foreground">
                {TERMS_CONTENT.map((t, i) => <li key={i}>{t}</li>)}
              </ol>
            </div>

            {d.paymentMethod === "card" && (
              <div>
                <Field label="Card Type" value={d.cardType} />
                <Field label="Last Four Digits" value={d.cardLastFour} />
              </div>
            )}
            {d.paymentMethod === "ach" && (
              <div>
                <p className="text-sm text-foreground">Payment Method: ACH Bank Transfer</p>
                <Field label="Routing" value={`***${d.achRoutingLast4}`} />
                <Field label="Account" value={`***${d.achAccountLast4}`} />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ViewApplicationDialog;
