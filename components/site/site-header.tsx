"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CircleUserRound,
  Heart,
  Home,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useId, useState } from "react";
import styles from "./site-shell.module.css";

const deityLinks = [
  ["Ganesha", "/shop/deity/ganesha"],
  ["Radha Krishna", "/shop/deity/radha-krishna"],
  ["Shiva", "/shop/deity/shiva"],
  ["Hanuman", "/shop/deity/hanuman"],
  ["Durga", "/shop/deity/durga"],
  ["View all deities", "/shop/deity"],
] as const;

const materialLinks = [
  ["Makrana Marble", "/shop/material/makrana-marble"],
  ["Vietnam Marble", "/shop/material/vietnam-marble"],
  ["Natural Stone", "/shop/material/natural-stone"],
  ["Brass & Bronze", "/shop/material/metal"],
  ["Eco-friendly", "/shop/material/eco-friendly"],
  ["View all materials", "/shop/material"],
] as const;

const featuredLinks = [
  ["Ready to Ship", "/shop/ready-to-ship"],
  ["New Arrivals", "/shop/new-arrivals"],
  ["Temple Moorties", "/shop/temple"],
  ["Home Mandir", "/shop/home-mandir"],
  ["Limited Editions", "/shop/limited-edition"],
] as const;

const mainLinks = [
  ["Custom Murti", "/custom-murti"],
  ["Artisans", "/artisans"],
  ["Our Story", "/our-story"],
  ["Guides", "/guides"],
] as const;

function HeaderAction({
  href,
  label,
  children,
  badge,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <Link className={styles.headerAction} href={href} aria-label={label}>
      {children}
      {badge ? <span className={styles.actionBadge}>{badge}</span> : null}
    </Link>
  );
}

export function SiteHeader() {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTitleId = useId();

  useEffect(() => {
    const overlayOpen = mobileMenuOpen || searchOpen;
    document.body.style.overflow = overlayOpen ? "hidden" : "";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setMegaMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen, searchOpen]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const query = new FormData(form).get("q")?.toString().trim();

    if (!query) {
      event.preventDefault();
    }
  }

  return (
    <>
      <div className={styles.announcementBar}>
        <div className={styles.announcementInner}>
          <span>Fourth-generation master moortikars</span>
          <span aria-hidden="true">•</span>
          <span>Secure delivery across India</span>
          <span aria-hidden="true">•</span>
          <Link href="/custom-murti">Custom commissions</Link>
        </div>
      </div>

      <header className={styles.siteHeader}>
        <div className={`${styles.headerMain} site-container`}>
          <button
            className={`${styles.headerAction} ${styles.mobileMenuButton}`}
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu aria-hidden="true" size={22} strokeWidth={1.6} />
          </button>

          <Link className={styles.brandLink} href="/" aria-label="Divine Stone Gallery home">
            <Image
              className={styles.brandLogo}
              src="/brand/logo-horizontal.jpg"
              alt="Divine Stone Gallery"
              width={1400}
              height={750}
              priority
            />
          </Link>

          <nav className={styles.desktopNav} aria-label="Main navigation">
            <button
              className={styles.navLink}
              type="button"
              aria-expanded={megaMenuOpen}
              onClick={() => setMegaMenuOpen((open) => !open)}
            >
              Shop
              <span aria-hidden="true" className={styles.chevron}>⌄</span>
            </button>
            {mainLinks.map(([label, href]) => (
              <Link className={styles.navLink} href={href} key={href}>
                {label}
              </Link>
            ))}
          </nav>

          <div className={styles.headerActions}>
            <button
              className={styles.headerAction}
              type="button"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
            >
              <Search aria-hidden="true" size={21} strokeWidth={1.6} />
            </button>
            <HeaderAction href="/account" label="Customer account">
              <CircleUserRound aria-hidden="true" size={21} strokeWidth={1.6} />
            </HeaderAction>
            <HeaderAction href="/wishlist" label="Wishlist">
              <Heart aria-hidden="true" size={21} strokeWidth={1.6} />
            </HeaderAction>
            <HeaderAction href="/cart" label="Shopping bag" badge={0}>
              <ShoppingBag aria-hidden="true" size={21} strokeWidth={1.6} />
            </HeaderAction>
          </div>
        </div>

        {megaMenuOpen ? (
          <div className={styles.megaMenuWrap}>
            <button
              className={styles.megaBackdrop}
              type="button"
              aria-label="Close Shop menu"
              onClick={() => setMegaMenuOpen(false)}
            />
            <div className={`${styles.megaMenu} site-container`}>
              <div className={styles.megaColumn}>
                <p>Shop by deity</p>
                {deityLinks.map(([label, href]) => (
                  <Link href={href} key={href} onClick={() => setMegaMenuOpen(false)}>
                    {label}
                  </Link>
                ))}
              </div>
              <div className={styles.megaColumn}>
                <p>Shop by material</p>
                {materialLinks.map(([label, href]) => (
                  <Link href={href} key={href} onClick={() => setMegaMenuOpen(false)}>
                    {label}
                  </Link>
                ))}
              </div>
              <div className={styles.megaColumn}>
                <p>Featured</p>
                {featuredLinks.map(([label, href]) => (
                  <Link href={href} key={href} onClick={() => setMegaMenuOpen(false)}>
                    {label}
                  </Link>
                ))}
              </div>
              <Link
                className={styles.megaFeature}
                href="/custom-murti"
                onClick={() => setMegaMenuOpen(false)}
              >
                <Sparkles aria-hidden="true" size={24} strokeWidth={1.4} />
                <span>Commission a sacred work</span>
                <small>Created to your measurements by our master moortikars.</small>
                <strong>Begin consultation →</strong>
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      {searchOpen ? (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby={searchTitleId}>
          <button
            className={styles.overlayBackdrop}
            type="button"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          />
          <section className={styles.searchPanel}>
            <div className="site-container">
              <div className={styles.overlayHeading}>
                <div>
                  <p>Find your moorti</p>
                  <h2 id={searchTitleId}>Search Divine Stone Gallery</h2>
                </div>
                <button
                  className={styles.closeButton}
                  type="button"
                  aria-label="Close search"
                  onClick={() => setSearchOpen(false)}
                >
                  <X aria-hidden="true" size={24} strokeWidth={1.5} />
                </button>
              </div>
              <form className={styles.searchForm} action="/shop" onSubmit={handleSearchSubmit}>
                <Search aria-hidden="true" size={22} strokeWidth={1.5} />
                <input
                  name="q"
                  type="search"
                  placeholder="Search by deity, material, size or style"
                  aria-label="Search products"
                />
                <button type="submit">Search</button>
              </form>
              <div className={styles.quickSearches}>
                <span>Popular:</span>
                <Link href="/shop/deity/ganesha">Ganesha</Link>
                <Link href="/shop/deity/radha-krishna">Radha Krishna</Link>
                <Link href="/shop/ready-to-ship">Ready to ship</Link>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {mobileMenuOpen ? (
        <div className={styles.mobileDrawer} role="dialog" aria-modal="true" aria-label="Website menu">
          <button
            className={styles.overlayBackdrop}
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className={styles.mobileDrawerPanel}>
            <div className={styles.mobileDrawerHeader}>
              <Image src="/brand/logo-horizontal.jpg" alt="Divine Stone Gallery" width={280} height={150} />
              <button
                className={styles.closeButton}
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X aria-hidden="true" size={24} strokeWidth={1.5} />
              </button>
            </div>
            <nav className={styles.mobileNav} aria-label="Mobile navigation">
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>Shop all moorties</Link>
              {mainLinks.map(([label, href]) => (
                <Link href={href} key={href} onClick={() => setMobileMenuOpen(false)}>
                  {label}
                </Link>
              ))}
            </nav>
            <div className={styles.mobileShopGroups}>
              <p>Popular deities</p>
              <div>
                {deityLinks.slice(0, 5).map(([label, href]) => (
                  <Link href={href} key={href} onClick={() => setMobileMenuOpen(false)}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <Link className={styles.mobileConsultation} href="/contact" onClick={() => setMobileMenuOpen(false)}>
              Book a private consultation
            </Link>
          </div>
        </div>
      ) : null}

      <nav className={styles.mobileBottomNav} aria-label="Quick navigation">
        <Link href="/"><Home aria-hidden="true" size={20} /><span>Home</span></Link>
        <Link href="/shop"><ShoppingBag aria-hidden="true" size={20} /><span>Shop</span></Link>
        <Link href="/custom-murti"><Sparkles aria-hidden="true" size={20} /><span>Custom</span></Link>
        <Link href="/wishlist"><Heart aria-hidden="true" size={20} /><span>Wishlist</span></Link>
        <Link href="/account"><CircleUserRound aria-hidden="true" size={20} /><span>Account</span></Link>
      </nav>
    </>
  );
}
