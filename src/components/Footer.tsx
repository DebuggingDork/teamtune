import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Dribbble,
  Globe 
} from "lucide-react";
import TeamTuneLogo from "./TeamTuneLogo";
import { TextHoverEffect, FooterBackgroundGradient } from "@/components/ui/hover-footer";

const footerLinks = [
  {
    title: "About Us",
    links: [
      { label: "Company History", href: "#" },
      { label: "Meet the Team", href: "#" },
      { label: "Employee Handbook", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Helpful Links",
    links: [
      { label: "FAQs", href: "#" },
      { label: "Support", href: "#" },
      { label: "Live Chat", href: "#", pulse: true },
    ],
  },
];

const contactInfo = [
  {
    Icon: Mail,
    text: "hello@teamtune.io",
    href: "mailto:hello@teamtune.io",
  },
  {
    Icon: Phone,
    text: "+1 (555) 123-4567",
    href: "tel:+15551234567",
  },
  {
    Icon: MapPin,
    text: "San Francisco, CA",
  },
];

const socialLinks = [
  { Icon: Facebook, label: "Facebook", href: "#" },
  { Icon: Instagram, label: "Instagram", href: "#" },
  { Icon: Twitter, label: "Twitter", href: "#" },
  { Icon: Dribbble, label: "Dribbble", href: "#" },
  { Icon: Globe, label: "Globe", href: "#" },
];

const Footer = () => {
  return (
    <footer className="relative bg-[#0a0a0a] overflow-hidden">
      <FooterBackgroundGradient />
      
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#3ca2fa] text-xl">♥</span>
              <span className="text-white text-xl font-semibold">
                Team<span className="text-[#94a3b8]">/tune</span>
              </span>
            </div>
            <p className="text-[#6b7280] text-sm leading-relaxed max-w-[240px]">
              TeamTune is a modern analytics platform for optimizing team performance.
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold mb-6">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label} className="flex items-center gap-2">
                    <a
                      href={link.href}
                      className="text-[#6b7280] hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                    {link.pulse && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3ca2fa] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3ca2fa]" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact section */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <item.Icon size={18} className="text-[#3ca2fa]" />
                  {item.href ? (
                    <a 
                      href={item.href} 
                      className="text-[#6b7280] hover:text-white transition-colors text-sm"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-[#6b7280] text-sm">{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1f1f1f] my-12" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map(({ Icon, label, href }) => (
              <a 
                key={label} 
                href={href} 
                aria-label={label}
                className="text-[#6b7280] hover:text-white transition-colors"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-[#6b7280] text-sm">
            © {new Date().getFullYear()} TeamTune. All rights reserved.
          </p>
        </div>
      </div>

      {/* Text hover effect - Large background text */}
      <div className="absolute bottom-0 left-0 right-0 h-[300px] md:h-[400px] flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-full max-w-[1400px] h-full pointer-events-auto">
          <TextHoverEffect text="TEAMTUNE" />
        </div>
      </div>

      {/* Spacer for the large text */}
      <div className="h-[80px] md:h-[100px]" />

      <FooterBackgroundGradient />
    </footer>
  );
};

export default Footer;
