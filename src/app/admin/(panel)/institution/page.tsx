import { redirect } from "next/navigation";
import { InstitutionForm } from "@/components/admin/InstitutionForm";
import { getAdminScope } from "@/lib/admin/org";
import { createClient } from "@/lib/supabase/server";
import type { Organization } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Branding and contact details for an institution. Institution staff land on
 * their own; a platform admin picks one, since they belong to none.
 */
export default async function InstitutionPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const { org: requested } = await searchParams;
  const supabase = await createClient();
  const { isPlatformAdmin, organizationId } = await getAdminScope();

  const { data: all } = await supabase
    .from("organizations")
    .select("id, name")
    .order("name");
  const options = all ?? [];

  // Only a platform admin may choose. For everyone else ?org= previously fell
  // through silently, so the address bar could name one institution while the
  // page showed another — indistinguishable from the page ignoring the change.
  // Send them to the clean URL instead, so it never describes something false.
  if (!isPlatformAdmin && requested && requested !== organizationId) {
    redirect("/admin/institution");
  }

  const targetId = isPlatformAdmin
    ? requested || options[0]?.id
    : organizationId;
  if (!targetId) redirect("/admin");

  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", targetId)
    .single();
  if (!data) redirect("/admin");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-evergreen-900">
          Institution
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          The logo and contact details shown on every listing you publish.
        </p>
      </div>
      <InstitutionForm
        org={data as Organization}
        organizations={isPlatformAdmin ? options : []}
      />
    </div>
  );
}
