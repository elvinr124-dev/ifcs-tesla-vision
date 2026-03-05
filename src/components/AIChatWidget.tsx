import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const IFCS_KNOWLEDGE = `You are the IFCS AI Assistant for the Institute of Foreign Credential Services (IFCS), located at 6 Cedar Street, Dobbs Ferry, NY 10522.

Key services and information:

EVALUATIONS:
- General Analysis: $100 (Rush 3-Day: $150, Rush 24hr: $195) — 8-10 business days
- General Analysis plus GPA: $150 (Rush 3-Day: $205, Rush 24hr: $295)
- Course-by-Course: $190 (Rush 3-Day: $290, Rush 24hr: $425)
- Comprehensive Course-by-Course: $290 (Rush 3-Day: $390, Rush 24hr: $490)
- Health Professions Course-by-Course: $230 (Rush 3-Day: $355, Rush 24hr: $490)

ADD-ONS:
- Electronic sharing fee: $25
- Hard copy: $25 + shipping
- Domestic shipping: $25
- International shipping: $70
- Reports are valid for 5 years
- Renewal after expiration: $100 (5 years)
- Duplicate Reports available

TRANSLATIONS:
- Certified translations in 150+ languages
- $50 per page
- Accepted by USCIS, universities, and government agencies
- Add-ons: Expedited ($14.95/page), Notarization ($19.95/order), Hard Copy (from $14.95)

CONSULTING:
- Evaluation consultations: FREE
- Admission & advisory consultations: $60/hour at Dobbs Ferry office

CONTACT:
- Phone: (914) 693-2840
- Email: info@ifcsevals.com
- Hours: Monday-Friday, 9:00 AM - 5:00 PM EST
- Website: ifcsevals.com

Always be helpful and professional. If you cannot answer a question, direct them to contact IFCS directly at (914) 693-2840 or info@ifcsevals.com.`;

type Message = { role: "user" | "assistant"; content: string };

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simple local response based on keywords since we don't have Cloud yet
    const q = userMsg.content.toLowerCase();
    let response = "";

    if (q.includes("price") || q.includes("cost") || q.includes("how much") || q.includes("fee")) {
      response = "Here are our main pricing tiers:\n\n**Evaluations:**\n- General Analysis: $100\n- General Analysis + GPA: $150\n- Course-by-Course: $190\n- Comprehensive Course-by-Course: $290\n- Health Professions: $230\n\n**Rush options** are available for 3-day and 24-hour processing.\n\n**Translations:** $50 per page\n\n**Consulting:** Evaluation consultations are FREE. Admission advising is $60/hour.\n\nWould you like more details on any specific service?";
    } else if (q.includes("translation") || q.includes("translate")) {
      response = "We offer certified translations in **150+ languages** at **$50 per page**. Our translations are accepted by USCIS, universities, and government agencies.\n\n**Add-ons available:**\n- Expedited turnaround: $14.95/page\n- Notarization: $19.95/order\n- Hard copy: from $14.95\n\nYou can start your order on our Translations page!";
    } else if (q.includes("evaluation") || q.includes("credential")) {
      response = "We offer several evaluation types:\n\n1. **General Analysis** ($100) — U.S. equivalency of your credential\n2. **General Analysis + GPA** ($150) — includes overall GPA\n3. **Course-by-Course** ($190) — detailed course listing with credits & GPA\n4. **Comprehensive Course-by-Course** ($290) — multi-degree, upper/lower division\n5. **Health Professions** ($230) — includes clinical experience\n\nAll evaluations have standard processing of 8-10 business days, with rush options available.";
    } else if (q.includes("contact") || q.includes("phone") || q.includes("email") || q.includes("reach")) {
      response = "You can reach us at:\n\n📞 **Phone:** (914) 693-2840\n📧 **Email:** info@ifcsevals.com\n📍 **Address:** 6 Cedar Street, Dobbs Ferry, NY 10522\n🕐 **Hours:** Monday–Friday, 9:00 AM – 5:00 PM EST";
    } else if (q.includes("rush") || q.includes("fast") || q.includes("expedite") || q.includes("urgent")) {
      response = "We offer rush processing for all evaluations:\n\n- **3-Day Rush:** Results in 3 business days\n- **24-Hour Rush:** Results within 24 hours\n\nRush fees vary by evaluation type. For example, General Analysis rush is $150 (3-day) or $195 (24hr).";
    } else if (q.includes("document") || q.includes("what do i need") || q.includes("required")) {
      response = "Typically you'll need:\n\n📄 **Transcripts/Mark Sheets** — official academic records\n📄 **Diploma Certificate** — proof of degree completion\n\nSome evaluations may require additional documentation. Our team will let you know if anything else is needed after reviewing your application.";
    } else if (q.includes("consult") || q.includes("advising") || q.includes("advisor")) {
      response = "**Evaluation consultations** are provided at **NO CHARGE**!\n\n**Admission & Academic Advisory consultations** are available at our Dobbs Ferry office at **$60/hour**.\n\nOur senior staff has reviewed thousands of applications and can help you find the right institution and program. To schedule, email us at info@ifcsevals.com or call (914) 693-2840.";
    } else if (q.includes("shipping") || q.includes("delivery")) {
      response = "**Delivery options:**\n\n- Electronic sharing: $25\n- Hard copy: $25 each\n- Domestic shipping: $25\n- International shipping: $70\n\nReports are valid for **5 years**. Renewal after expiration costs $100.";
    } else if (q.includes("renewal") || q.includes("expire") || q.includes("valid")) {
      response = "Evaluation reports are valid for **5 years** from the date of issuance. After expiration, you can renew for **$100**, which extends validity for another 5 years.";
    } else if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      response = "Hello! Welcome to IFCS. I can help you with information about our credential evaluations, translations, consulting services, pricing, and more. What would you like to know?";
    } else {
      response = "I appreciate your question! For more specific inquiries, I'd recommend contacting our team directly:\n\n📞 **Phone:** (914) 693-2840\n📧 **Email:** info@ifcsevals.com\n\nThey'll be happy to assist you with any detailed questions about your specific situation. Is there anything else I can help with regarding our services?";
    }

    // Simulate typing delay
    await new Promise((r) => setTimeout(r, 800));
    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Chat bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent shadow-lg shadow-accent/40 flex items-center justify-center hover:scale-110 transition-transform duration-200"
          aria-label="Open chat"
        >
          <MessageCircle size={24} className="text-white" />
        </button>
      )}

      {/* Chat panel */}
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
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
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

          {/* Input */}
          <div className="border-t border-border px-4 py-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 h-10 px-4 rounded-full text-sm text-foreground placeholder:text-muted-foreground bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-50"
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
