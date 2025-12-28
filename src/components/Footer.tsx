import { Github, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import TeamTuneLogo from "./TeamTuneLogo";
import { TextHoverEffect, FooterBackgroundGradient } from "@/components/ui/hover-footer";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#product" },
      { label: "Pricing", href: "#pricing" },
      { label: "Integrations", href: "#integrations" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#docs" },
      { label: "API Reference", href: "#" },
      { label: "Community", href: "#" },
      { label: "Support", href: "#", pulse: true },
    ],
  },
];

const contactInfo = [
  {
    icon: Mail,
    text: "hello@teamtune.io",
    href: "mailto:hello@teamtune.io",
  },
  {
    icon: Phone,
    text: "+1 (555) 123-4567",
    href: "tel:+15551234567",
  },
  {
    icon: MapPin,
    text: "San Francisco, CA",
  },
];

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Mail, label: "Email", href: "#" },
];

const Footer = () => {
  return (
    <footer className="relative bg-card border-t border-border overflow-hidden">
      <FooterBackgroundGradient />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="col-span-2">
            <TeamTuneLogo className="mb-4" />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
              Empowering teams to reach peak performance through intelligent analytics and actionable insights.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              {contactInfo.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.href ? (
                    <a href={item.href} className="hover:text-foreground transition-colors">
                      {item.text}
                    </a>
                  ) : (
                    <span>{item.text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label} className="flex items-center gap-2">
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                    {link.pulse && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-12" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Links */}
          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="p-2 rounded-lg bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TeamTune. All rights reserved.
          </p>
        </div>
      </div>

      {/* Text Hover Effect */}
      <div className="h-40 flex items-center justify-center relative z-10">
        <TextHoverEffect text="TEAMTUNE" />
      </div>
    </footer>
  );
};

export default Footer;
