"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import styles from "./ui.module.css";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  const titleId = `modal-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className={styles.modalRoot} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button className={styles.modalBackdrop} type="button" aria-label="Close dialog" onClick={onClose} />
      <section className={styles.modalPanel}>
        <div className={styles.modalHeader}>
          <h2 className="font-display" id={titleId}>{title}</h2>
          <Button variant="ghost" size="icon" aria-label="Close dialog" onClick={onClose}>
            <X aria-hidden="true" size={21} />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
