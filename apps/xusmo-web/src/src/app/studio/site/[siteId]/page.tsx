"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SiteDefaultPage() {
  const params = useParams();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/studio/site/${params.siteId}/preview`);
  }, [params.siteId, router]);
  return null;
}
