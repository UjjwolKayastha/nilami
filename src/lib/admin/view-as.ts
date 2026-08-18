import { cookies } from "next/headers";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Holds the profile id a platform admin is proxying into. */
export const VIEW_AS_COOKIE = "nilami_view_as";

/** A support session should not outlive the reason it was started. */
export const VIEW_AS_MAX_AGE = 60 * 60;

export type Viewer = {
  userId: string;
  organizationId: string | null;
  isPlatformAdmin: boolean;
};

/**
 * The account actually signed in, ignoring any view-as cookie.
 *
 * This is the security boundary for proxy login: the cookie is only ever
 * honoured for a real platform admin, so setting it by hand can never widen
 * anyone's access — for institution staff it is ignored outright, and for a
 * platform admin it can only narrow what they already see.
 */
export const getRealViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return {
    userId: user.id,
    organizationId: profile.organization_id as string | null,
    isPlatformAdmin: profile.organization_id === null,
  };
});

export type ViewAsTarget = {
  id: string;
  fullName: string;
  email: string;
  organizationId: string | null;
  organizationName: string;
};

/**
 * The staff member whose view the panel is currently rendering, or null when
 * nobody is being proxied into.
 */
export const getViewAsTarget = cache(async (): Promise<ViewAsTarget | null> => {
  const viewer = await getRealViewer();
  if (!viewer?.isPlatformAdmin) return null;

  const targetId = (await cookies()).get(VIEW_AS_COOKIE)?.value;
  if (!targetId || targetId === viewer.userId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, approved, organization_id, organization:organizations(name)")
    .eq("id", targetId)
    .single();
  if (!data?.approved) return null;

  return {
    id: data.id as string,
    fullName: (data.full_name as string) || (data.email as string),
    email: data.email as string,
    organizationId: data.organization_id as string | null,
    organizationName:
      (data.organization as unknown as { name: string } | null)?.name ??
      "Platform Admin",
  };
});
