"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Heart, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { NAV_ITEMS } from "@/lib/data";

interface HeaderProps {
  cartCount?: number;
}

export function Header({ cartCount = 0 }: HeaderProps) {
  const [isScrolled,      setIsScrolled]      = useState(false);
  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [searchOpen,      setSearchOpen]      = useState(false);
  const [activeDropdown,  setActiveDropdown]  = useState<string | null>(null);
  const [searchQuery,     setSearchQuery]     = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Detect scroll for sticky header shadow
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-amber-500 text-white text-center py-2 px-4 text-xs font-semibold tracking-wider">
        🐾 FREE SHIPPING on orders over $49 &nbsp;|&nbsp; Use code{" "}
        <span className="font-bold underline">PAWLOVE</span> for 15% off your first order
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full",
          "bg-brand-cream/95 backdrop-blur-md",
          "border-b border-amber-100",
          "transition-shadow duration-300",
          isScrolled && "shadow-soft"
        )}
      >
        <div className="container-site">
          <div className="flex items-center justify-between h-[4.5rem] gap-4">

            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-2.5 shrink-0 group"
              aria-label="Paw Palace — Home"
            >
              <span
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center text-xl",
                  "bg-amber-500 shadow-warm",
                  "group-hover:scale-110 transition-transform duration-200 ease-spring"
                )}
                aria-hidden="true"
              >
                🐾
              </span>
              <span className="font-display font-bold text-xl text-slate-900 leading-none">
                Paw<span className="text-amber-500">Palace</span>
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <a
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-lg",
                      "text-sm font-semibold text-slate-700",
                      "hover:text-amber-600 hover:bg-amber-50",
                      "transition-colors duration-150",
                      item.label === "Sale" && "text-red-600 hover:text-red-700 hover:bg-red-50"
                    )}
                    aria-expanded={item.children ? activeDropdown === item.label : undefined}
                    aria-haspopup={item.children ? "true" : undefined}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform duration-200",
                          activeDropdown === item.label && "rotate-180"
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </a>

                  {/* Dropdown */}
                  {item.children && activeDropdown === item.label && (
                    <div
                      className={cn(
                        "absolute top-full left-0 mt-1 w-48",
                        "bg-white rounded-2xl shadow-lifted border border-slate-100",
                        "py-2 z-50",
                        "animate-fade-down animate-fill-both"
                      )}
                      role="menu"
                    >
                      {item.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          role="menuitem"
                          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                {searchOpen ? (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <Input
                      ref={searchRef}
                      type="search"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      icon={<Search size={16} />}
                      className="w-56 py-2"
                      aria-label="Search products"
                    />
                    <button
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="p-2 text-slate-500 hover:text-slate-700"
                      aria-label="Close search"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <IconButton
                    onClick={() => setSearchOpen(true)}
                    aria-label="Open search"
                    tooltip="Search"
                  >
                    <Search size={20} />
                  </IconButton>
                )}
              </div>

              <IconButton aria-label="Wishlist" tooltip="Wishlist">
                <Heart size={20} />
              </IconButton>

              <IconButton aria-label="Account" tooltip="Account">
                <User size={20} />
              </IconButton>

              {/* Cart */}
              <button
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 rounded-xl",
                  "bg-amber-500 text-white text-sm font-semibold",
                  "hover:bg-amber-600 transition-all duration-200",
                  "shadow-warm hover:shadow-glow"
                )}
                aria-label={`Shopping cart, ${cartCount} items`}
              >
                <ShoppingCart size={18} />
                <span className="hidden xl:inline">Cart</span>
                {cartCount > 0 && (
                  <span
                    className={cn(
                      "absolute -top-1.5 -right-1.5",
                      "w-5 h-5 flex items-center justify-center",
                      "bg-slate-900 text-white text-2xs font-bold rounded-full",
                      "animate-scale-in"
                    )}
                    aria-hidden="true"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                className="relative p-2.5 text-slate-700"
                aria-label={`Shopping cart, ${cartCount} items`}
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-2xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2.5 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden border-t border-amber-100 px-4 py-3 bg-white/80">
          <Input
            type="search"
            placeholder="Search for dog food, cat toys..."
            icon={<Search size={16} />}
            className="w-full"
            aria-label="Search products"
          />
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav
            className={cn(
              "fixed top-0 right-0 h-full w-72 max-w-[85vw]",
              "bg-brand-cream z-50 lg:hidden",
              "shadow-deep overflow-y-auto",
              "animate-slide-in"
            )}
            aria-label="Mobile navigation"
          >
            {/* Mobile nav header */}
            <div className="flex items-center justify-between p-4 border-b border-amber-100">
              <span className="font-display font-bold text-lg">
                Paw<span className="text-amber-500">Palace</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-700"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile nav links */}
            <div className="p-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <div key={item.label}>
                  <a
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-3 rounded-xl",
                      "text-sm font-semibold text-slate-800",
                      "hover:bg-amber-50 hover:text-amber-700",
                      "transition-colors duration-150",
                      item.label === "Sale" && "text-red-600"
                    )}
                  >
                    {item.label}
                    {item.children && <ChevronDown size={16} />}
                  </a>
                  {item.children && (
                    <div className="ml-4 space-y-0.5">
                      {item.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-600 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile account links */}
            <div className="border-t border-amber-100 p-4 space-y-1">
              <a
                href="/account"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-colors"
              >
                <User size={18} /> My Account
              </a>
              <a
                href="/wishlist"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-colors"
              >
                <Heart size={18} /> Wishlist
              </a>
              <a
                href="/orders"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-colors"
              >
                <Package size={18} /> My Orders
              </a>
            </div>
          </nav>
        </>
      )}
    </>
  );
}

/* ============================================
   ICON BUTTON HELPER
   ============================================ */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: string;
  children: React.ReactNode;
}

function IconButton({ tooltip, children, className, ...props }: IconButtonProps) {
  return (
    <button
      title={tooltip}
      className={cn(
        "relative p-2.5 rounded-xl text-slate-600",
        "hover:text-amber-600 hover:bg-amber-50",
        "transition-colors duration-150",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Header;
