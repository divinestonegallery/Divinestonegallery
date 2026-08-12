import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { pagePreviewData } from "@/cms/admin-repository";
import styles from "./preview.module.css";

export default async function DraftPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const page = await pagePreviewData(decodeURIComponent(id)); if (!page) notFound();
  return <div className={styles.root}><header><span><Eye size={17} />Protected draft preview · Not visible to customers</span><Link href="/admin/pages"><ArrowLeft size={15} />Return to editor</Link></header><main><section className={styles.title}><small>{page.status}</small><h1>{page.title}</h1>{page.seoDescription ? <p>{page.seoDescription}</p> : null}</section>{page.sections.filter((section) => section.isVisible).map((section) => <section className={styles.block} data-tone={section.styleVariant} key={section.id}>{section.mediaPath ? <div className={styles.media}><Image src={section.mediaPath} alt={section.mediaAltText ?? ""} fill sizes="45vw" /></div> : null}<div><small>{section.eyebrow ?? section.blockType.replaceAll("_", " ")}</small>{section.heading ? <h2>{section.heading}</h2> : null}{section.body ? <p>{section.body}</p> : null}<div className={styles.actions}>{section.ctaLabel && section.ctaHref ? <span>{section.ctaLabel}</span> : null}{section.secondaryCtaLabel && section.secondaryCtaHref ? <span>{section.secondaryCtaLabel}</span> : null}</div>{(() => { try { const items = JSON.parse(section.contentJson) as Array<{ title?: string; body?: string }>; return items.length ? <div className={styles.cards}>{items.map((item, index) => <article key={index}><strong>{item.title}</strong><p>{item.body}</p></article>)}</div> : null; } catch { return null; } })()}</div></section>)}</main></div>;
}
