import { Feed } from "@/content/home/Feed";
import { SiteLayout } from "@/lib/layout";

export default async function Home() {
  return (
    <SiteLayout>
      <Feed />
    </SiteLayout>
  );
}
