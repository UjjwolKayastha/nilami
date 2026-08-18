import { createClient } from "@/lib/supabase/server";

export async function getAdminOrgContext(): Promise<{
  organizations: { id: string; name: string }[];
  lockedOrg: { id: string; name: string } | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { organizations: [], lockedOrg: null };
  const [{ data: orgs }, { data: profile }] = await Promise.all([
    supabase.from("organizations").select("id, name").order("name"),
    supabase
      .from("profiles")
      .select("organization_id, organization:organizations(id, name)")
      .eq("id", user.id)
      .single(),
  ]);
  const locked = (profile?.organization as unknown as { id: string; name: string } | null) ?? null;
  return { organizations: orgs ?? [], lockedOrg: locked };
}

/**
 * Scoping an admin query to nothing. Staff whose profile cannot be resolved
 * must see no rows rather than everyone's.
 */
const NO_ORG = "00000000-0000-0000-0000-000000000000";

/**
 * Row visibility for the signed-in staff member. Platform admins
 * (`profiles.organization_id IS NULL`) see every institution; institution
 * staff are limited to their own.
 *
 * This has to be applied in the query itself. The RLS SELECT policies on
 * properties, auctions and property_images stay deliberately open so the
 * public site can read anything published, which means they cannot narrow
 * the admin panel on their own — only the write policies are org-scoped.
 */
export async function getAdminScope(): Promise<{
  isPlatformAdmin: boolean;
  /** The organisation to filter by; ignore it when isPlatformAdmin. */
  organizationId: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isPlatformAdmin: false, organizationId: NO_ORG };

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile) return { isPlatformAdmin: false, organizationId: NO_ORG };
  if (profile.organization_id === null)
    return { isPlatformAdmin: true, organizationId: NO_ORG };
  return {
    isPlatformAdmin: false,
    organizationId: profile.organization_id as string,
  };
}
