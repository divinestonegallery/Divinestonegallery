"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./site-shell.module.css";

const consentKey = "dsg-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVisible(window.localStorage.getItem(consentKey) === null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function savePreference(value: "all" | "essential") {
    window.localStorage.setItem(consentKey, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <section className={styles.cookieConsent} aria-label="Cookie preferences">
      <div>
        <strong>Your privacy matters</strong>
        <p>We use essential cookies for a reliable shopping experience. Optional cookies help us improve the gallery.</p>
        <Link href="/privacy">Privacy details</Link>
      </div>
      <div className={styles.cookieActions}>
        <button type="button" onClick={() => savePreference("essential")}>Essential only</button>
        <button type="button" onClick={() => savePreference("all")}>Accept all</button>
      </div>
    </section>
  );
}
