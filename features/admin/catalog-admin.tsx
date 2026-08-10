"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronDown, ExternalLink, PackagePlus, RefreshCw, Save, Search, Upload } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { prepareImageForUpload } from "@/features/uploads/prepare-image";
import styles from "./catalog-admin.module.css";

type Variant = {
  id: string;
  sku: string;
  name: string;
  material: string;
  finish: string | null;
  heightMm: number;
  widthMm: number | null;
  depthMm: number | null;
  weightGrams: number | null;
  packageLengthMm: number | null;
  packageWidthMm: number | null;
  packageHeightMm: number | null;
  pricePaise: number | null;
  gstRateBps: number | null;
  inventoryKind: "unique" | "repeatable";
  stockQuantity: number;
  lowStockThreshold: number;
  codEligible: boolean;
  isActive: boolean;
};

type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  categoryId: string | null;
  category: string | null;
  deityId: string | null;
  deity: string | null;
  productType: "ready_made" | "made_to_order";
  salesMode: "direct" | "quote" | "both";
  status: "draft" | "active" | "archived";
  isFeatured: boolean;
  sortOrder: number;
  variants: Variant[];
  media: Array<{ id: string; publicPath: string | null; altText: string | null; isPrimary: boolean }>;
  collections: Array<{ id: string; name: string; slug: string }>;
};

type Lookup = { id: string; name: string };
type CatalogResponse = {
  data: AdminProduct[];
  lookups: { categories: Lookup[]; deities: Lookup[]; collections: Lookup[] };
};

function completion(product: AdminProduct) {
  const variant = product.variants[0];
  const checks = [
    Boolean(product.media.some((media) => media.publicPath)),
    Boolean(variant?.pricePaise),
    Boolean(variant?.gstRateBps),
    Boolean(variant?.weightGrams),
    Boolean(variant?.packageLengthMm && variant?.packageWidthMm && variant?.packageHeightMm),
    Boolean(variant && variant.stockQuantity > 0),
  ];
  return { complete: checks.filter(Boolean).length, total: checks.length };
}

function ProductEditor({ product, lookups, refresh }: { product: AdminProduct; lookups: CatalogResponse["lookups"]; refresh: () => Promise<void> }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(product.status);
  const [salesMode, setSalesMode] = useState(product.salesMode);
  const [featured, setFeatured] = useState(product.isFeatured);
  const [sortOrder, setSortOrder] = useState(String(product.sortOrder));
  const [categoryId, setCategoryId] = useState(product.categoryId ?? "");
  const [deityId, setDeityId] = useState(product.deityId ?? "");
  const [collectionIds, setCollectionIds] = useState(product.collections.map((collection) => collection.id));
  const variant = product.variants[0];
  const [heightCm, setHeightCm] = useState(variant?.heightMm ? String(variant.heightMm / 10) : "");
  const [priceRupees, setPriceRupees] = useState(variant?.pricePaise ? String(variant.pricePaise / 100) : "");
  const [gstPercent, setGstPercent] = useState(variant?.gstRateBps ? String(variant.gstRateBps / 100) : "");
  const [weightKg, setWeightKg] = useState(variant?.weightGrams ? String(variant.weightGrams / 1000) : "");
  const [widthCm, setWidthCm] = useState(variant?.widthMm ? String(variant.widthMm / 10) : "");
  const [depthCm, setDepthCm] = useState(variant?.depthMm ? String(variant.depthMm / 10) : "");
  const [packageLengthCm, setPackageLengthCm] = useState(variant?.packageLengthMm ? String(variant.packageLengthMm / 10) : "");
  const [packageWidthCm, setPackageWidthCm] = useState(variant?.packageWidthMm ? String(variant.packageWidthMm / 10) : "");
  const [packageHeightCm, setPackageHeightCm] = useState(variant?.packageHeightMm ? String(variant.packageHeightMm / 10) : "");
  const [stock, setStock] = useState(variant ? String(variant.stockQuantity) : "0");
  const readiness = completion(product);
  const primaryMedia = product.media.find((media) => media.isPrimary) ?? product.media[0];

  async function createFirstVariant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const heightCm = Number(form.get("heightCm"));
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/admin/products/${encodeURIComponent(product.id)}/variants`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sku: form.get("sku"),
          name: form.get("variantName"),
          material: form.get("material"),
          finish: form.get("finish"),
          heightMm: Number.isFinite(heightCm) ? Math.round(heightCm * 10) : null,
          inventoryKind: "unique",
          stockQuantity: 0,
          lowStockThreshold: 1,
          codEligible: true,
        }),
      });
      if (!response.ok) throw new Error();
      showToast(`Selling details added to ${product.name}.`);
      await refresh();
    } catch {
      showToast("Could not add selling details. Check that the SKU is unique and all required values are complete.");
    } finally {
      setSaving(false);
    }
  }

  async function saveProduct() {
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/admin/products/${encodeURIComponent(product.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, salesMode, isFeatured: featured, sortOrder: Number(sortOrder), categoryId: categoryId || null, deityId: deityId || null, collectionIds }),
      });
      if (!response.ok) throw new Error();

      if (variant) {
        const variantResponse = await fetch(`/api/v1/admin/variants/${encodeURIComponent(variant.id)}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            pricePaise: priceRupees ? Math.round(Number(priceRupees) * 100) : null,
            gstRateBps: gstPercent ? Math.round(Number(gstPercent) * 100) : null,
            heightMm: Math.round(Number(heightCm) * 10),
            weightGrams: weightKg ? Math.round(Number(weightKg) * 1000) : null,
            widthMm: widthCm ? Math.round(Number(widthCm) * 10) : null,
            depthMm: depthCm ? Math.round(Number(depthCm) * 10) : null,
            packageLengthMm: packageLengthCm ? Math.round(Number(packageLengthCm) * 10) : null,
            packageWidthMm: packageWidthCm ? Math.round(Number(packageWidthCm) * 10) : null,
            packageHeightMm: packageHeightCm ? Math.round(Number(packageHeightCm) * 10) : null,
            stockQuantity: Number(stock),
          }),
        });
        if (!variantResponse.ok) throw new Error();
      }

      showToast(`${product.name} updated.`);
      await refresh();
    } catch {
      showToast(`Could not update ${product.name}. Check the values and try again.`);
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File) {
    setSaving(true);
    const form = new FormData();
    form.set("altText", `${product.name} hand-carved marble work`);
    try {
      form.set("file", await prepareImageForUpload(file));
      const response = await fetch(`/api/v1/admin/products/${encodeURIComponent(product.id)}/media`, { method: "POST", body: form });
      if (!response.ok) throw new Error();
      showToast(`Image added to ${product.name}.`);
      await refresh();
    } catch {
      showToast("The image could not be uploaded. Use JPEG, PNG or WebP up to 12 MB.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <details className={styles.productRow}>
      <summary>
        <span className={styles.productThumb}>
          {primaryMedia?.publicPath ? <Image src={primaryMedia.publicPath} alt="" fill sizes="64px" /> : <PackagePlus aria-hidden="true" size={20} />}
        </span>
        <span className={styles.productIdentity}>
          <strong>{product.name}</strong>
          <small>{product.category ?? "Uncategorised"} · {product.deity ?? "No deity"}</small>
        </span>
        <span className={`${styles.statusPill} ${styles[product.status]}`}>{product.status}</span>
        <span className={readiness.complete === readiness.total ? styles.complete : styles.incomplete}>
          {readiness.complete === readiness.total ? <Check aria-hidden="true" size={14} /> : <AlertTriangle aria-hidden="true" size={14} />}
          {readiness.complete}/{readiness.total} selling details
        </span>
        <ChevronDown className={styles.chevron} aria-hidden="true" size={18} />
      </summary>

      <div className={styles.editorGrid}>
        <label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
        <label><span>Sales mode</span><select value={salesMode} onChange={(event) => setSalesMode(event.target.value as typeof salesMode)}><option value="both">Buy + quote</option><option value="direct">Direct purchase</option><option value="quote">Quote only</option></select></label>
        <label><span>Category</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Uncategorised</option>{lookups.categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <label><span>Deity</span><select value={deityId} onChange={(event) => setDeityId(event.target.value)}><option value="">No deity</option>{lookups.deities.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <label><span>Price before GST (₹)</span><input inputMode="decimal" value={priceRupees} onChange={(event) => setPriceRupees(event.target.value)} placeholder="Not entered" /></label>
        <label><span>GST rate (%)</span><input inputMode="decimal" value={gstPercent} onChange={(event) => setGstPercent(event.target.value)} placeholder="Add after GST registration" /></label>
        <label><span>Sculpture height (cm)</span><input inputMode="decimal" min="0.1" step="0.1" required value={heightCm} onChange={(event) => setHeightCm(event.target.value)} /></label>
        <label><span>Weight (kg)</span><input inputMode="decimal" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} placeholder="Needed for shipping" /></label>
        <label><span>Sculpture width (cm)</span><input inputMode="decimal" value={widthCm} onChange={(event) => setWidthCm(event.target.value)} placeholder="Optional" /></label>
        <label><span>Sculpture depth (cm)</span><input inputMode="decimal" value={depthCm} onChange={(event) => setDepthCm(event.target.value)} placeholder="Optional" /></label>
        <label><span>Packed length (cm)</span><input inputMode="decimal" value={packageLengthCm} onChange={(event) => setPackageLengthCm(event.target.value)} placeholder="Required for rates" /></label>
        <label><span>Packed width (cm)</span><input inputMode="decimal" value={packageWidthCm} onChange={(event) => setPackageWidthCm(event.target.value)} placeholder="Required for rates" /></label>
        <label><span>Packed height (cm)</span><input inputMode="decimal" value={packageHeightCm} onChange={(event) => setPackageHeightCm(event.target.value)} placeholder="Required for rates" /></label>
        <label><span>Stock quantity</span><input inputMode="numeric" value={stock} onChange={(event) => setStock(event.target.value)} /></label>
        <label><span>Display order</span><input inputMode="numeric" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} /></label>
        <label className={styles.checkbox}><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /><span>Featured product</span></label>
        <fieldset className={styles.collectionChooser}><legend>Curated collections</legend>{lookups.collections.length ? lookups.collections.map((item) => <label key={item.id}><input type="checkbox" checked={collectionIds.includes(item.id)} onChange={(event) => setCollectionIds((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} /><span>{item.name}</span></label>) : <small>Create a collection from Catalogue first.</small>}</fieldset>
      </div>
      <div className={styles.editorActions}>
        <Link href={`/products/${product.slug}`} target="_blank">View product <ExternalLink aria-hidden="true" size={14} /></Link>
        <span>{variant ? `${variant.sku} · ${variant.heightMm} mm` : "Add the first selling details before publishing."}</span>
        <label className={styles.uploadButton}><Upload aria-hidden="true" size={15} /> Add image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.currentTarget.value = ""; }} /></label>
        <button type="button" disabled={saving} onClick={saveProduct}><Save aria-hidden="true" size={16} /> {saving ? "Saving…" : "Save changes"}</button>
      </div>
      {!variant ? (
        <form className={styles.createForm} onSubmit={createFirstVariant}>
          <h3 className="font-display">Add selling details</h3>
          <label><span>SKU</span><input name="sku" required maxLength={100} placeholder="DSG-GANESHA-24" /></label>
          <label><span>Variant name</span><input name="variantName" required maxLength={160} placeholder="Standard" /></label>
          <label><span>Material</span><input name="material" required maxLength={160} placeholder="Makrana white marble" /></label>
          <label><span>Finish</span><input name="finish" maxLength={160} placeholder="Natural white or hand-painted" /></label>
          <label><span>Height (cm)</span><input name="heightCm" required inputMode="decimal" min="0.1" step="0.1" placeholder="60.9" /></label>
          <button type="submit" disabled={saving}>{saving ? "Adding…" : "Add selling details"}</button>
        </form>
      ) : null}
    </details>
  );
}

export function CatalogAdmin() {
  const { showToast } = useToast();
  const [payload, setPayload] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/admin/products", { cache: "no-store" });
      if (!response.ok) throw new Error();
      setPayload(await response.json() as CatalogResponse);
    } catch {
      showToast("The staff catalogue could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/v1/admin/products", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<CatalogResponse>;
      })
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch(() => {
        if (!cancelled) showToast("The staff catalogue could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [showToast]);

  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (payload?.data ?? []).filter((product) => !normalized || [product.name, product.slug, product.category, product.deity].join(" ").toLowerCase().includes(normalized));
  }, [payload, query]);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const heightCm = Number(form.get("heightCm"));
    try {
      const response = await fetch("/api/v1/admin/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      if (!response.ok) throw new Error("product");
      const created = await response.json() as { data: AdminProduct | null };
      if (!created.data?.id) throw new Error("product");

      const variantResponse = await fetch(`/api/v1/admin/products/${encodeURIComponent(created.data.id)}/variants`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sku: form.get("sku"),
          name: form.get("variantName"),
          material: form.get("material"),
          finish: form.get("finish"),
          heightMm: Number.isFinite(heightCm) ? Math.round(heightCm * 10) : null,
          inventoryKind: "unique",
          stockQuantity: 0,
          lowStockThreshold: 1,
          codEligible: true,
        }),
      });
      if (!variantResponse.ok) {
        showToast("The draft was created, but selling details failed. Open it below and add a unique SKU, material and height.");
        await load();
        return;
      }
      formElement.reset();
      setShowCreate(false);
      showToast("Draft product and sculpture details created.");
      await load();
    } catch {
      showToast("The draft product could not be created. Check that the URL slug is unique.");
    }
  }

  return (
    <section className={styles.adminSection}>
      <div className="site-container">
        <div className={styles.toolbar}>
          <label><Search aria-hidden="true" size={17} /><span className="sr-only">Search products</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" /></label>
          <button type="button" onClick={() => void load()}><RefreshCw aria-hidden="true" size={16} /> Refresh</button>
          <button className={styles.primaryAction} type="button" onClick={() => setShowCreate((value) => !value)}><PackagePlus aria-hidden="true" size={16} /> Add product</button>
        </div>

        {showCreate ? (
          <form className={styles.createForm} onSubmit={createProduct}>
            <h2 className="font-display">Create a draft product</h2>
            <label><span>Name</span><input name="name" required maxLength={180} /></label>
            <label><span>URL slug</span><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="ganesha-24-inch-marble" /></label>
            <label><span>Category</span><select name="categoryId" required><option value="">Choose category</option>{payload?.lookups.categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
            <label><span>Deity</span><select name="deityId" required><option value="">Choose deity</option>{payload?.lookups.deities.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
            <label><span>SKU</span><input name="sku" required maxLength={100} placeholder="DSG-HANUMAN-24" /></label>
            <label><span>Variant name</span><input name="variantName" required maxLength={160} placeholder="Standard" /></label>
            <label><span>Material</span><input name="material" required maxLength={160} placeholder="Makrana white marble" /></label>
            <label><span>Finish</span><input name="finish" maxLength={160} placeholder="Natural white or hand-painted" /></label>
            <label><span>Sculpture height (cm)</span><input name="heightCm" type="number" required min="0.1" step="0.1" placeholder="60.9" /></label>
            <input type="hidden" name="productType" value="ready_made" /><input type="hidden" name="salesMode" value="both" />
            <button type="submit">Create draft</button>
          </form>
        ) : null}

        <div className={styles.summary}><strong>{items.length}</strong><span>{loading ? "Loading catalogue…" : "catalogue products"}</span><small>Products stay quote-only until price, GST, stock, dimensions and weight are complete.</small></div>
        <div className={styles.productList}>{items.map((product) => <ProductEditor key={product.id} product={product} lookups={payload?.lookups ?? { categories: [], deities: [], collections: [] }} refresh={load} />)}</div>
      </div>
    </section>
  );
}
