"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, Camera, Mail, MapPin, Phone } from "lucide-react";
import { brand } from "@/config/brand";
import styles from "./site-shell.module.css";

export function SiteFooter() {
  const [subscribed, setSubscribed] = useState(false);

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubscribed(true);
    event.currentTarget.reset();
  }

  return (
    <footer className={styles.siteFooter}>
      <section className={styles.newsletterSection} aria-labelledby="newsletter-title">
        <div className={`${styles.newsletterInner} site-container`}>
          <div>
            <p>From our atelier to your mandir</p>
            <h2 className="font-display" id="newsletter-title">Stories of craft, devotion and new creations.</h2>
          </div>
          {subscribed ? (
            <p className={styles.newsletterSuccess} role="status">
              Thank you. You are on the Divine Stone Gallery list.
            </p>
          ) : (
            <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <Mail aria-hidden="true" size={19} strokeWidth={1.5} />
              <input id="newsletter-email" name="email" type="email" placeholder="Your email address" required />
              <button type="submit" aria-label="Join newsletter">
                Join <ArrowRight aria-hidden="true" size={18} />
              </button>
            </form>
          )}
        </div>
      </section>

      <div className={`${styles.footerGrid} site-container`}>
        <div className={styles.footerBrand}>
          <Image src="/brand/logo-horizontal.jpg" alt="Divine Stone Gallery" width={420} height={225} />
          <p>{brand.promise}, shaped by generations of experience and guided by sacred tradition.</p>
          <div className={styles.footerContact}>
            <span><MapPin aria-hidden="true" size={17} /> {brand.location}</span>
            <a href="tel:+916376871065"><Phone aria-hidden="true" size={17} /> {brand.phone}</a>
            <a href="mailto:hello@divinestonegallery.com"><Mail aria-hidden="true" size={17} /> Email our gallery</a>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <p>Explore</p>
          <Link href="/shop">All moorties</Link>
          <Link href="/shop/ready-to-ship">Ready to ship</Link>
          <Link href="/custom-murti">Custom murti</Link>
          <Link href="/artisans">Our artisans</Link>
          <Link href="/shop/new-arrivals">New arrivals</Link>
        </div>

        <div className={styles.footerColumn}>
          <p>Our world</p>
          <Link href="/our-story">Our story</Link>
          <Link href="/craftsmanship">Craftsmanship</Link>
          <Link href="/guides/materials">Material guide</Link>
          <Link href="/guides/sizing">Size guide</Link>
          <Link href="/guides/care">Care guide</Link>
        </div>

        <div className={styles.footerColumn}>
          <p>Assistance</p>
          <Link href="/contact">Contact us</Link>
          <Link href="/track-order">Track order</Link>
          <Link href="/shipping">Shipping & delivery</Link>
          <Link href="/damage-protection">Damage protection</Link>
          <Link href="/faq">Frequently asked questions</Link>
        </div>
      </div>

      <div className={`${styles.footerBottom} site-container`}>
        <span>© {new Date().getFullYear()} Divine Stone Gallery</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/returns">Returns</Link>
        </div>
        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
          <Camera aria-hidden="true" size={18} /> Instagram
        </a>
      </div>
    </footer>
  );
}
