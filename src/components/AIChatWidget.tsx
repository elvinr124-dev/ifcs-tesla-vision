import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Paperclip } from "lucide-react";

const EVALUATION_DETAILED_RESPONSE = `Greetings,

We appreciate your interest in our evaluation services.

To initiate the process, kindly follow the steps outlined below:

**1. Apply Online:** Please visit our website at [Institute of Foreign Credential Services (IFCS)](https://ifcsevals.com) and complete the online application form. Along with the application, you will be able to upload copies of your transcripts and degree certificate/diploma.

**2. Required Documents, Fees, and Processing Time:** On the application page, you will find a list of the required documents for evaluation, as well as information regarding the applicable fees and the estimated processing time: https://ifcsevals.com/evaluations/

**3. Submitting Official Transcripts:** After submitting your application, it is important to arrange for your issuing institutions to send your official transcripts directly to our office either by mail or email. Only documents received directly from the issuing institutions will be considered official. Our mailing address is:

**IFCS**
**6 Cedar Street**
**Dobbs Ferry, NY 10522**

For electronic official documents, the email's subject line should include your "IFCS ID" which will be sent to you after you submit your application online.

Alternatively, you can pay $140 for document authentication, and we will reach out to the issuing institution to verify your documents.

**4. Translation Services:** If your transcripts are in a foreign language, please note that we can provide you with a translation quote after we have received your application.

**5. Report Delivery Services:** We can mail or email your credential evaluation report to the desired addresses.

Please follow the instructions on our website and let us know if you have any additional questions.`;

type Message = { role: "user" | "assistant"; content: string; attachments?: string[] };

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    const attachmentNames = attachments.map((f) => f.name);
    const userMsg: Message = { role: "user", content: input.trim(), attachments: attachmentNames.length > 0 ? attachmentNames : undefined };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    const q = userMsg.content.toLowerCase();
    let response = "";

    // Price-only question
    const isPriceOnly = (q.includes("price") || q.includes("cost") || q.includes("how much") || q.includes("fee")) && !q.includes("how") && !q.includes("process") && !q.includes("start") && !q.includes("apply") && !q.includes("need");

    if (isPriceOnly) {
      response = "Here are our main pricing tiers:\n\n**Evaluations:**\n- General Analysis: $100\n- General Analysis + GPA: $150\n- Cosmetology Course-by-Course: $170\n- Course-by-Course: $190\n- Health Professions: $230\n- Comprehensive Course-by-Course: $290\n- High School & University Course-by-Course: $295\n\n**Rush options** are available for 3-day and 24-hour processing.\n\n**Translations:** $50 per page\n\n**Consulting:** Evaluation consultations are FREE. Admission advising is $60/hour.\n\nWould you like more details on any specific service?";
    } else if (q.includes("what is a credential evaluation") || q.includes("what is credential evaluation") || q.includes("what's a credential evaluation")) {
      response = "A **credential evaluation** is an expert assessment of your foreign academic credentials to determine their U.S. equivalency. It is used for university admissions, employment, immigration, and professional licensing.";
    } else if ((q.includes("how long") && q.includes("evaluation")) || (q.includes("turnaround") && q.includes("evaluation"))) {
      response = "Standard processing takes **8–10 business days**. We also offer **3-day rush** and **24-hour rush** options for an additional fee.";
    } else if (q.includes("what document") || (q.includes("document") && q.includes("need"))) {
      response = "You will typically need your **transcripts/mark sheets** and **diploma certificate**. Some evaluations may require additional documentation. For the High School & University Course-by-Course, you'll need: High School diploma, High School transcript, University degree certificate, and University transcript.";
    } else if (q.includes("recognized") || q.includes("accepted by universit")) {
      response = "Yes. **IFCS evaluations are accepted** by universities, employers, and government agencies across the United States.";
    } else if (q.includes("course-by-course") || q.includes("course by course")) {
      response = "Yes. We offer **course-by-course evaluations** that list individual courses, credit hours, grades, and GPA — ideal for transfer credit and graduate admissions. Prices start at $170 for Cosmetology, $190 for standard Course-by-Course, $230 for Health Professions, $290 for Comprehensive, and $295 for High School & University.";
    } else if (q.includes("check") && q.includes("status")) {
      response = "You can check your evaluation status through our **application portal** or by contacting our office directly at **(914) 693-2840** or **info@ifcsevals.com**.";
    } else if (q.includes("what is rush") || (q.includes("rush") && q.includes("processing"))) {
      response = "**Rush processing** expedites your evaluation. The **3-day rush** delivers in 3 business days, and the **24-hour rush** delivers within 24 hours of document receipt. Rush fees vary by evaluation type.";
    } else if (q.includes("evaluation") || q.includes("credential") || q.includes("transcript") || q.includes("degree") || q.includes("how do i") || q.includes("get started") || q.includes("apply") || q.includes("process") || q.includes("how does") || q.includes("what do i need")) {
      response = EVALUATION_DETAILED_RESPONSE;
    } else if (q.includes("certified translation") || q.includes("what is a certified")) {
      response = "A **certified translation** includes a signed statement by the translator or translation company attesting that the translation is accurate and complete. It is required by USCIS, universities, and government agencies.";
    } else if (q.includes("how long") && q.includes("translation")) {
      response = "Standard turnaround is **3–5 business days** per document. Expedited options are available for same-day or next-day delivery.";
    } else if (q.includes("what language") || q.includes("which language")) {
      response = "We translate documents from and into **150+ languages**. If you don't see your language listed, contact us — we likely support it.\n\n📞 **(914) 693-2840**\n📧 **info@ifcsevals.com**";
    } else if (q.includes("uscis") || q.includes("accepted")) {
      response = "Yes. All our certified translations meet **USCIS requirements** and are guaranteed to be accepted. If not, we will re-translate at no charge.";
    } else if (q.includes("notari")) {
      response = "Yes. We offer **notarization** as an add-on service for **$19.95 per order**. The notarized document is valid in all 50 U.S. states.";
    } else if (q.includes("translation") || q.includes("translate")) {
      response = "We offer certified translations in **150+ languages** at **$50 per page**. Our translations are accepted by USCIS, universities, and government agencies.\n\nStandard turnaround is **3–5 business days**.\n\n**Add-ons available:**\n- Expedited turnaround: $14.95/page\n- Notarization: $19.95/order\n- Hard copy: from $14.95\n\nYou can start your order on our Translations page!";
    } else if (q.includes("contact") || q.includes("phone") || q.includes("email") || q.includes("reach")) {
      response = "You can reach us at:\n\n📞 **Phone:** (914) 693-2840\n📧 **Email:** info@ifcsevals.com\n📍 **Address:** 6 Cedar Street, Dobbs Ferry, NY 10522\n🕐 **Hours:** Monday–Friday, 9:00 AM – 5:00 PM EST";
    } else if (q.includes("rush") || q.includes("fast") || q.includes("expedite") || q.includes("urgent")) {
      response = "We offer rush processing for all evaluations:\n\n- **3-Day Rush:** Results in 3 business days\n- **24-Hour Rush:** Results within 24 hours\n\nRush fees vary by evaluation type. For example, General Analysis rush is $150 (3-day) or $195 (24hr).";
    } else if (q.includes("document") || q.includes("required")) {
      response = "Typically you'll need:\n\n📄 **Transcripts/Mark Sheets** — official academic records\n📄 **Diploma Certificate** — proof of degree completion\n\nFor **High School & University Course-by-Course**, you'll need all four: High School diploma, High School transcript, University degree certificate, and University transcript.\n\nDocuments must be sent directly from the issuing institution to be considered official. Our mailing address is:\n\n**IFCS, 6 Cedar Street, Dobbs Ferry, NY 10522**\n\nAlternatively, you can pay **$140 for document authentication** and we will verify directly with the institution.";
    } else if (q.includes("consult") || q.includes("advising") || q.includes("advisor")) {
      response = "**Evaluation consultations** are provided at **NO CHARGE**!\n\n**Admission & Academic Advisory consultations** are available at our Dobbs Ferry office at **$60/hour**.\n\nOur senior staff has reviewed thousands of applications and can help you find the right institution and program. To schedule, email us at info@ifcsevals.com or call (914) 693-2840.";
    } else if (q.includes("shipping") || q.includes("delivery")) {
      response = "**Delivery options:**\n\n- Electronic sharing: $25\n- Hard copy: $25 each\n- Domestic shipping: $25\n- International shipping: $70\n\nReports are valid for **5 years**. Renewal after expiration costs $100.";
    } else if (q.includes("renewal") || q.includes("expire") || q.includes("valid")) {
      response = "Evaluation reports are valid for **5 years** from the date of issuance. After expiration, you can renew for **$100**, which extends validity for another 5 years.";
    } else if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      response = "Hello! Welcome to IFCS. I can help you with information about our credential evaluations, translations, consulting services, pricing, and more. What would you like to know?";
    } else if (attachments.length > 0 || userMsg.attachments) {
      response = "Thank you for sharing your document(s). For a detailed review, please submit them through our online application at https://ifcsevals.com/application or email them to **info@ifcsevals.com**.\n\nIf you have questions about the evaluation process, I'm happy to help!";
    } else {
      response = "I appreciate your question! For more specific inquiries, I'd recommend contacting our team directly:\n\n📞 **Phone:** (914) 693-2840\n📧 **Email:** info@ifcsevals.com\n\nThey'll be happy to assist you with any detailed questions about your specific situation. Is there anything else I can help with regarding our services?";
    }

    await new Promise((r) => setTimeout(r, 800));
    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setIsLoading(false);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent shadow-lg shadow-accent/40 flex items-center justify-center hover:scale-110 transition-transform duration-200"
          aria-label="Open chat"
        >
          <MessageCircle size={24} className="text-white" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] rounded-3xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-accent text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold">IFCS AI</p>
                <p className="text-[10px] opacity-80">Ask us anything</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1.5 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                  <MessageCircle size={22} className="text-accent" />
                </div>
                <p className="text-base font-semibold text-foreground">Welcome to IFCS AI</p>
                <p className="text-xs text-muted-foreground max-w-[260px] mx-auto">
                  Ask me about evaluations, translations, pricing, or anything else about our services.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%] space-y-1">
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {msg.attachments.map((name, j) => (
                        <span key={j} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/20 text-[10px] text-accent font-medium">
                          <Paperclip size={10} /> {name}
                        </span>
                      ))}
                    </div>
                  )}
                  {msg.content && (
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-accent text-white rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {msg.content.split(/(\*\*.*?\*\*)/).map((part, j) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={j}>{part.slice(2, -2)}</strong>
                        ) : (
                          <span key={j}>{part}</span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="px-4 py-2 border-t border-border flex flex-wrap gap-1">
              {attachments.map((file, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 text-[10px] font-medium text-accent">
                  <Paperclip size={10} /> {file.name}
                  <button onClick={() => removeAttachment(i)} className="ml-1 hover:text-destructive">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border px-4 py-3">
            <div className="flex gap-2 items-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted transition-colors flex-shrink-0"
                aria-label="Attach file"
              >
                <Paperclip size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 h-10 px-4 rounded-full text-sm text-foreground placeholder:text-muted-foreground bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() && attachments.length === 0 || isLoading}
                className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
