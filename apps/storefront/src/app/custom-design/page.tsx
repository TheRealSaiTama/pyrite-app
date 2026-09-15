import CustomDesignClient from "./CustomDesignClient";
import { getStorefrontData, getPageSections } from "@/lib/site";

export const revalidate = 0;

export default async function CustomDesignPage() {
  const [data, sections] = await Promise.all([getStorefrontData(), getPageSections("custom-design")]);
  return (
    <CustomDesignClient
      headerNav={data.headerNav}
      megaMenu={data.megaMenu}
      settings={data.settings}
      footerLinks={data.footerLinks}
      content={sections.main}
    />
  );
}
