"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Heart, Package, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { NAV_ITEMS } from "@/lib/data";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Header() {
  const [isScrolled,      setIsScrolled]      = useState(false);
  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [searchOpen,      setSearchOpen]      = useState(false);
  const [activeDropdown,  setActiveDropdown]  = useState<string | null>(null);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [accountOpen,     setAccountOpen]     = useState(false);
  const [user,            setUser]            = useState<SupabaseUser | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const { totalItems, setIsOpen: setCartOpen } = useCart();

  // Supabase auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Detect scroll
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

  // Close account dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    if (accountOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAccountOpen(false);
    window.location.href = "/";
  }

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
            <Link
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
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
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
                  </Link>

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
                        <Link
                          key={child.label}
                          href={child.href}
                          role="menuitem"
                          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                        >
                          {child.label}
                        </Link>
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

              {/* Account dropdown */}
              <div ref={accountRef} className="relative">
                <IconButton
                  aria-label="Account"
                  tooltip={user ? user.email ?? "Account" : "Sign in"}
                  onClick={() => setAccountOpen((prev) => !prev)}
                >
                  <User size={20} />
                  {user && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                </IconButton>

                {accountOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-lifted border border-slate-100 py-2 z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-slate-100 mb-1">
                          <p className="text-xs text-slate-400">Signed in as</p>
                          <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/account"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                          onClick={() => setAccountOpen(false)}
                        >
                          <User size={15} /> My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                          onClick={() => setAccountOpen(false)}
                        >
                          <Package size={15} /> My Orders
                        </Link>
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={15} /> Sign out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
                          onClick={() => setAccountOpen(false)}
                        >
                          <LogIn size={15} /> Sign in
                        </Link>
                        <Link
                          href="/signup"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                          onClick={() => setAccountOpen(false)}
                        >
                          <User size={15} /> Create account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 rounded-xl",
                  "bg-amber-500 text-white text-sm font-semibold",
                  "hover:bg-amber-600 transition-all duration-200",
                  "shadow-warm hover:shadow-glow"
                )}
                aria-label={`Shopping cart, ${totalItems} items`}
              >
                <ShoppingCart size={18} />
                <span className="hidden xl:inline">Cart</span>
                {totalItems > 0 && (
                  <span
                    className={cn(
                      "absolute -top-1.5 -right-1.5",
                      "w-5 h-5 flex items-center justify-center",
                      "bg-slate-900 text-white text-2xs font-bold rounded-full",
                      "animate-scale-in"
                    )}
                    aria-hidden="true"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 text-slate-700"
                aria-label={`Shopping cart, ${totalItems} items`}
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-2xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
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
                  <Link
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
                  </Link>
                  {item.children && (
                    <div className="ml-4 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-600 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile account links */}
            <div className="border-t border-amber-100 p-4 space-y-1">
              {user ? (
                <>
                  <div className="px-4 py-2 mb-1">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/account"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User size={18} /> My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Package size={18} /> My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={18} /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LogIn size={18} /> Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User size={18} /> Create account
                  </Link>
                </>
              )}
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
