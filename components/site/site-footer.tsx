import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { brand } from "@/config/brand";
import { getPublicBusinessDetails } from "@/config/business";
import styles from "./site-shell.module.css";

export function SiteFooter() {
  const business = getPublicBusinessDetails();
  return (
    <footer className={styles.siteFooter}>
      <section className={styles.newsletterSection} aria-labelledby="newsletter-title">
        <div className={`${styles.newsletterInner} site-container`}>
          <div>
            <p>From our atelier to your mandir</p>
            <h2 className="font-display" id="newsletter-title">Stories of craft, devotion and new creations.</h2>
          </div>
          <a
            className={styles.newsletterCta}
            href="https://wa.me/916376871065?text=Namaste%2C%20please%20share%20updates%20about%20new%20Divine%20Stone%20Gallery%20creations."
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle aria-hidden="true" size={19} /> Ask for collection updates
          </a>
        </div>
      </section>

      <div className={`${styles.footerGrid} site-container`}>
        <div className={styles.footerBrand}>
          <Image src="/brand/logo-horizontal.jpg" alt="Divine Stone Gallery" width={420} height={225} />
          <p>{brand.promise}, shaped by generations of experience and guided by sacred tradition.</p>
          <div className={styles.footerContact}>
            <span><MapPin aria-hidden="true" size={17} /> {business.address || brand.location}</span>
            <a href="tel:+916376871065"><Phone aria-hidden="true" size={17} /> {brand.phone}</a>
            <Link href="/contact"><Mail aria-hidden="true" size={17} /> Contact our gallery</Link>
            {business.gstin ? <span>GSTIN: {business.gstin}</span> : null}
          </div>
        </div>

        <div className={styles.footerColumn}>
          <p>Explore</p>
          <Link href="/shop">All moorties</Link>
          <Link href="/shop">Available collection</Link>
          <Link href="/custom-murti">Custom murti</Link>
          <Link href="/artisans">Our artisans</Link>
          <Link href="/shop">Featured works</Link>
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
          <Link href="/track-order">Track or discuss an order</Link>
          <Link href="/shipping">Shipping & delivery</Link>
          <Link href="/shipping#damage-protection">Damage guidance</Link>
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
        <Link href="/contact">Gallery assistance</Link>
      </div>
    </footer>
  );
}
