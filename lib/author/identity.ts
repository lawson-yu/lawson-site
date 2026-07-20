import { createClient } from "@/lib/supabase/server";

type GitHubIdentity = {
  identity_data?: { provider_id?: string };
  provider?: string;
};

export type AuthorIdentity = {
  userId: string;
};

export async function getAuthorIdentity(): Promise<AuthorIdentity | null> {
  const expectedProviderId = process.env.AUTHOR_GITHUB_ID;

  if (!expectedProviderId) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const githubIdentity = (
    user.identities as GitHubIdentity[] | undefined
  )?.find((identity) => identity.provider === "github");

  if (githubIdentity?.identity_data?.provider_id !== expectedProviderId) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("author_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("github_provider_id", expectedProviderId)
    .maybeSingle();

  if (error) {
    throw new Error(`无法验证作者身份：${error.message}`);
  }

  return profile ? { userId: user.id } : null;
}

export async function requireAuthor(): Promise<AuthorIdentity> {
  const author = await getAuthorIdentity();

  if (!author) {
    throw new Error("作者身份验证失败");
  }

  return author;
}
