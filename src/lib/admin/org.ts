import {
  getRealViewer,
  getViewAsTarget,
  type ViewAsTarget,
} from "@/lib/admin/view-as";
import { createClient } from "@/lib/supabase/server";

export async function getAdminOrgContext(): Promise<{
  organizations: { id: string; name: string }[];
  lockedOrg: { id: string; name: string } | null;
}> {
  const supabase = await createClient();
  const viewer = await getRealViewer();
  if (!viewer) return { organizations: [], lockedOrg: null };

  // While proxying into a staff member, the form locks to their institution.
  const target = await getViewAsTarget();
  const effectiveOrgId = target ? target.organizationId : viewer.organizationId;

  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name")
    .order("name");
  const organizations = orgs ?? [];

  return {
    organizations,
    lockedOrg: effectiveOrgId
      ? organizations.find((o) => o.id === effectiveOrgId) ?? null
      : null,
  };
}

/**
 * Scoping an admin query to nothing. Staff whose profile cannot be resolved
 * must see no rows rather than everyone's.
 */
const NO_ORG = "00000000-0000-0000-0000-000000000000";

/**
 * Row visibility for the current admin view. Platform admins
 * (`profiles.organization_id IS NULL`) see every institution; institution
 * staff are limited to their own. A platform admin proxying into someone
 * takes on that person's scope for as long as the proxy session lasts.
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
  /** Set when a platform admin is proxying into another staff member. */
  viewingAs: ViewAsTarget | null;
}> {
  const viewer = await getRealViewer();
  if (!viewer)
    return { isPlatformAdmin: false, organizationId: NO_ORG, viewingAs: null };

  const target = await getViewAsTarget();
  if (target) {
    return {
      isPlatformAdmin: target.organizationId === null,
      organizationId: target.organizationId ?? NO_ORG,
      viewingAs: target,
    };
  }

  return {
    isPlatformAdmin: viewer.isPlatformAdmin,
    organizationId: viewer.organizationId ?? NO_ORG,
    viewingAs: null,
  };
}
