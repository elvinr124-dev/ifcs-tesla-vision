const Footer = () => {
  return (
    <footer id="contact" className="bg-primary py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold tracking-widest text-primary-foreground mb-4">IFCS</h3>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Institute of Foreign Credential Services. Trusted by universities, employers, and government agencies across the U.S.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary-foreground/40 mb-4">Services</h4>
            <ul className="space-y-2">
              {["Academic Evaluations", "Translations", "Consulting", "Evaluation Status"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary-foreground/40 mb-4">Company</h4>
            <ul className="space-y-2">
              {["About Us", "Blog", "FAQ", "Contact Us"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary-foreground/40 mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-primary-foreground/70">
              <p>6 Cedar Street</p>
              <p>Dobbs Ferry, NY 10522</p>
              <a href="mailto:info@ifcsevals.com" className="block hover:text-primary-foreground transition-colors">
                info@ifcsevals.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} Institute of Foreign Credential Services. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <a key={item} href="#" className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
