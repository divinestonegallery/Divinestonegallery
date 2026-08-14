export type PublishedSection = {
  id: string;
  sectionKey: string;
  blockType: "hero" | "rich_text" | "image_text" | "collection" | "feature_grid" | "callout" | "faq";
  eyebrow: string | null;
  heading: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  mediaPath: string | null;
  mediaAltText: string | null;
  mediaPosition: "left" | "right" | "background";
  contentJson: string;
  styleVariant: string;
  sortOrder: number;
};

export type PublishedPage = {
  id: string;
  slug: string;
  title: string;
  navigationTitle: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: number;
  sections: PublishedSection[];
};

export type PublishedPageSummary = {
  slug: string;
  updatedAt: number;
};

export type PublicBusinessSettings = Record<string, string>;
