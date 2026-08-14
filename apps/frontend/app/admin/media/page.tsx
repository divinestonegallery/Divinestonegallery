import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { MediaLibraryAdmin } from "@/features/admin/media-library-admin";

export const metadata: Metadata = { title: "Media library" };

export default function AdminMediaPage() {
  return <><AdminPageHeader eyebrow="Website" title="Media library" description="Upload, organize and reuse optimized ImageKit images across products and website pages." /><MediaLibraryAdmin /></>;
}
