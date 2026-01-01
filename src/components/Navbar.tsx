import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar as NavbarWrapper, NavBody, NavItems, MobileNav, MobileNavHeader, MobileNavToggle, MobileNavMenu, NavbarButton } from "@/components/ui/resizable-navbar";

import { ThemeSelector } from "@/components/ThemeSelector";
import { Button } from "@/components/ui/button";
import TeamTuneLogo from "./TeamTuneLogo";
const navItems = [{
  name: "Product",
  link: "#product"
}, {
  name: "Integrations",
  link: "#integrations"
}, {
  name: "Pricing",
  link: "/pricing"
}];
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    scrollY
  } = useScroll();
  useMotionValueEvent(scrollY, "change", latest => {
    setIsScrolled(latest > 100);
  });
  return <NavbarWrapper>
    {/* Desktop Navigation */}
    <NavBody>
      <motion.div layout transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}>
        <TeamTuneLogo />
      </motion.div>

      <NavItems items={navItems} visible={true} />

      <motion.div layout className="flex items-center gap-2 shrink-0" transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}>
        <ThemeSelector />
        <Link to="/auth/login" className="">
          <NavbarButton variant="secondary">
            Log in
          </NavbarButton>
        </Link>
        <Link to="/auth/signup">
          <NavbarButton variant="primary">
            Get Started
          </NavbarButton>
        </Link>
      </motion.div>
    </NavBody>

    {/* Mobile Navigation */}
    <MobileNav>
      <MobileNavHeader>
        <TeamTuneLogo />
        <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      </MobileNavHeader>

      <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
        {navItems.map((item, idx) => <a key={`mobile-link-${idx}`} href={item.link} onClick={() => setIsMobileMenuOpen(false)} className="relative text-muted-foreground hover:text-foreground transition-colors w-full py-2">
          {item.name}
        </a>)}
        <div className="flex w-full flex-col gap-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium text-muted-foreground">Theme</span>
            <ThemeSelector />
          </div>
          <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
            <NavbarButton variant="secondary" className="w-full">
              Log in
            </NavbarButton>
          </Link>
          <Link to="/auth/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
            <NavbarButton variant="primary" className="w-full">
              Get Started
            </NavbarButton>
          </Link>
        </div>
      </MobileNavMenu>
    </MobileNav>
  </NavbarWrapper>;
};
export default Navbar;