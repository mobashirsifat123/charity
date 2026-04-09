import AdminArticleCreateForm from "@/components/admin/AdminArticleCreateForm";
import { getAdminArticleFormData } from "@/lib/server/admin-editor-data";

export default async function AdminArticleCreatePage() {
  const { categories, scholars } = await getAdminArticleFormData();

  return <AdminArticleCreateForm categories={categories} scholars={scholars} />;
}
