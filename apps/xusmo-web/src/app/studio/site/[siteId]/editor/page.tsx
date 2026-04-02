import { redirect } from "next/navigation";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  redirect(`/studio/site/${siteId}/design`);
}
