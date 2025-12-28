import { useState } from "react";
import {
  Navbar as NavbarWrapper,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import TeamTuneLogo from "./TeamTuneLogo";

const navItems = [
  { name: "Product", link: "#product" },
  { name: "Integrations", link: "#integrations" },
  { name: "Pricing", link: "#pricing" },
  { name: "Docs", link: "#docs" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <NavbarWrapper>
      {/* Desktop Navigation */}
      <NavBody>
        <TeamTuneLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-2">
          <NavbarButton variant="secondary" href="#">
            Log in
          </NavbarButton>
          <NavbarButton variant="primary" href="#">
            Get Started
          </NavbarButton>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <TeamTuneLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-muted-foreground hover:text-foreground transition-colors w-full py-2"
            >
              {item.name}
            </a>
          ))}
          <div className="flex w-full flex-col gap-3 pt-4 border-t border-border">
            <NavbarButton
              onClick={() => setIsMobileMenuOpen(false)}
              variant="secondary"
              className="w-full"
            >
              Log in
            </NavbarButton>
            <NavbarButton
              onClick={() => setIsMobileMenuOpen(false)}
              variant="primary"
              className="w-full"
            >
              Get Started
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </NavbarWrapper>
  );
};

export default Navbar;
