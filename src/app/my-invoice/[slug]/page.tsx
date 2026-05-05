import RepairInvoice from "../_components/myInvoice";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <RepairInvoice id={slug} />;
}
