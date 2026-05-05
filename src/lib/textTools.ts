// Local, deterministic Smart Rewrite & Grammar Check.
// No AI / integration credits used. Pure text rules tuned for IFCS staff emails.

const COMMON_TYPOS: Array<[RegExp, string]> = [
  [/\bteh\b/gi, "the"],
  [/\bthier\b/gi, "their"],
  [/\brecieve(d|s|r|rs)?\b/gi, (m: string) => m.replace("ie", "ei") as any],
  [/\boccured\b/gi, "occurred"],
  [/\bseperate(d|ly|s)?\b/gi, (m: string) => m.replace("per", "par") as any],
  [/\bdefinately\b/gi, "definitely"],
  [/\bwich\b/gi, "which"],
  [/\bwierd\b/gi, "weird"],
  [/\baccomodate(d|s)?\b/gi, (m: string) => m.replace("comod", "commod") as any],
  [/\bgovenment\b/gi, "government"],
  [/\bcollegue(s)?\b/gi, (m: string) => m.replace("collegue", "colleague") as any],
  [/\bbeleive(d|s|r)?\b/gi, (m: string) => m.replace("eli", "eli").replace("beleive", "believe") as any],
  [/\bappologize(d|s)?\b/gi, (m: string) => m.replace("appolog", "apolog") as any],
  [/\bappoligize(d|s)?\b/gi, (m: string) => m.replace("appolig", "apolog") as any],
  [/\bcalender\b/gi, "calendar"],
  [/\benviroment\b/gi, "environment"],
  [/\bindependant\b/gi, "independent"],
  [/\bmispell(ed|ing|s)?\b/gi, (m: string) => m.replace("misp", "missp") as any],
  [/\bpriviledge(d|s)?\b/gi, (m: string) => m.replace("priviledge", "privilege") as any],
  [/\bquesion(s|ed|ing)?\b/gi, (m: string) => m.replace("quesion", "question") as any],
  [/\bproccess(ed|ing|es)?\b/gi, (m: string) => m.replace("proccess", "process") as any],
  [/\bsucess(ful|fully)?\b/gi, (m: string) => m.replace("sucess", "success") as any],
  [/\btommorow\b/gi, "tomorrow"],
  [/\buntill\b/gi, "until"],
  [/\busefull\b/gi, "useful"],
  [/\baddress(s|d|es)\b/gi, (m: string) => m.replace("addresss", "addresses").replace("addressd", "addressed") as any],
  [/\binsitution(s|al)?\b/gi, (m: string) => m.replace("insit", "instit") as any],
  [/\binsitute(s|d)?\b/gi, (m: string) => m.replace("insit", "instit") as any],
  [/\btranslat(ed|ion|ions|or)\b/gi, (m: string) => m] as any,
  [/\bcredentail(s)?\b/gi, (m: string) => m.replace("credentail", "credential") as any],
  [/\btranscipt(s)?\b/gi, (m: string) => m.replace("transcipt", "transcript") as any],
  [/\bevalution(s)?\b/gi, (m: string) => m.replace("evalution", "evaluation") as any],
  [/\bevaluatoin(s)?\b/gi, (m: string) => m.replace("evaluatoin", "evaluation") as any],
  [/\bcertficate(s|d)?\b/gi, (m: string) => m.replace("certficate", "certificate") as any],
  [/\baccrediation\b/gi, "accreditation"],
  [/\bplease be advice\b/gi, "please be advised"],
  [/\bi am writting\b/gi, "I am writing"],
];

function fixCapitalization(text: string): string {
  text = text.replace(/(^|[\s(.,;:!?"'])i(\b)/g, (_, p1, p2) => `${p1}I${p2}`);
  text = text.replace(/([.!?]\s+|^)([a-z])/g, (_, p1, p2) => `${p1}${p2.toUpperCase()}`);
  text = text.replace(/(\n\s*)([a-z])/g, (_, p1, p2) => `${p1}${p2.toUpperCase()}`);
  return text;
}

function fixPunctuationSpacing(text: string): string {
  text = text.replace(/\s+([,.;:!?])/g, "$1");
  text = text.replace(/([,.;:!?])([A-Za-z])/g, "$1 $2");
  text = text.replace(/[ \t]{2,}/g, " ");
  text = text.replace(/\bdont\b/gi, "don't")
             .replace(/\bcant\b/gi, "can't")
             .replace(/\bwont\b/gi, "won't")
             .replace(/\bisnt\b/gi, "isn't")
             .replace(/\barent\b/gi, "aren't")
             .replace(/\bdoesnt\b/gi, "doesn't")
             .replace(/\bdidnt\b/gi, "didn't")
             .replace(/\bwouldnt\b/gi, "wouldn't")
             .replace(/\bcouldnt\b/gi, "couldn't")
             .replace(/\bshouldnt\b/gi, "shouldn't")
             .replace(/\bim\b/gi, "I'm")
             .replace(/\bive\b/gi, "I've")
             .replace(/\bid\b/g, "I'd");
  return text;
}

export function grammarCheck(input: string): string {
  if (!input.trim()) return input;
  let out = input;
  for (const [re, rep] of COMMON_TYPOS) {
    out = typeof rep === "string" ? out.replace(re, rep) : out.replace(re, rep as any);
  }
  out = fixPunctuationSpacing(out);
  out = fixCapitalization(out);
  out = out.split(/\n/).map(line => {
    const trimmed = line.trimEnd();
    if (!trimmed) return line;
    if (/[.!?:")]]$/.test(trimmed)) return line;
    if (/^(hi|hello|dear|hey|greetings|good (morning|afternoon|evening))/i.test(trimmed)) return trimmed + ",";
    return trimmed;
  }).join("\n");
  return out;
}

const REWRITE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bi (just )?wanted to (let you know|inform you)\b/gi, "I am writing to inform you"],
  [/\bi('| a)?m (just )?reaching out\b/gi, "I am writing to you"],
  [/\bjust (a |the )?(quick |brief )?(note|update|reminder)\b/gi, "A brief update"],
  [/\bsorry for( the)? (late|delayed|slow) (reply|response|getting back)\b/gi, "Thank you for your patience"],
  [/\bsorry to bother( you)?\b/gi, "Thank you for your time"],
  [/\bthanks!?\b/gi, "Thank you"],
  [/\bthx\b/gi, "Thank you"],
  [/\bplz\b/gi, "please"],
  [/\bpls\b/gi, "please"],
  [/\bu\b/g, "you"],
  [/\bur\b/g, "your"],
  [/\bASAP\b/gi, "at your earliest convenience"],
  [/\bget back to (me|us)\b/gi, "respond"],
  [/\blet me know\b/gi, "please let us know"],
  [/\bgive (me|us) a (call|ring|shout)\b/gi, "contact us"],
  [/\bcheck (in )?with (me|us)\b/gi, "follow up with us"],
  [/\bhuge thanks\b/gi, "Thank you very much"],
  [/\bappreciate it\b/gi, "we appreciate your assistance"],
  [/\bno (worries|problem|prob)\b/gi, "Not a problem"],
  [/\bgonna\b/gi, "going to"],
  [/\bwanna\b/gi, "want to"],
  [/\bgotta\b/gi, "have to"],
  [/\bkinda\b/gi, "somewhat"],
  [/\bsorta\b/gi, "somewhat"],
  [/\byeah\b/gi, "yes"],
  [/\bnope\b/gi, "no"],
  [/\bok(ay)?\b/gi, "Understood"],
  [/\bhey\b/gi, "Hello"],
  [/\bsuper\s+(important|urgent|quick|fast|easy)\b/gi, "$1"],
  [/\bvery very\b/gi, "very"],
  [/\breally really\b/gi, "very"],
  [/\bthe ifcs\b/gi, "IFCS"],
  [/\bplease find attached\b/gi, "Please find the attached document(s)"],
];

export function smartRewrite(input: string): string {
  if (!input.trim()) return input;
  let out = grammarCheck(input);
  for (const [re, rep] of REWRITE_REPLACEMENTS) {
    out = out.replace(re, rep);
  }
  const lines = out.split("\n");
  const firstNonEmpty = lines.find(l => l.trim()) || "";
  if (!/^(dear|hello|hi|good (morning|afternoon|evening)|greetings)/i.test(firstNonEmpty.trim())) {
    out = "Hello,\n\n" + out.trimStart();
  }
  if (!/(best regards|sincerely|kind regards|regards|thank you,|warm regards|best,)/i.test(out)) {
    out = out.trimEnd() + "\n\nBest regards,\nThe IFCS Team";
  }
  out = out.replace(/\n{3,}/g, "\n\n");
  return out;
}
