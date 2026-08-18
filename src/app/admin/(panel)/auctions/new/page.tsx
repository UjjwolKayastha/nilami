import { AuctionForm } from "@/components/admin/AuctionForm";
import { getAdminScope } from "@/lib/admin/org";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewAuctionPage() {
  const supabase = await createClient();
  const { isPlatformAdmin, organizationId } = await getAdminScope();
  let query = supabase.from("properties").select("id, title").order("title");
  if (!isPlatformAdmin) query = query.eq("organization_id", organizationId);
  const { data } = await query;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-evergreen-900">
        New auction
      </h1>
      <AuctionForm properties={data ?? []} />
    </div>
  );
}
