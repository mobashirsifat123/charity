import AdminCourseCreateForm from "@/components/admin/AdminCourseCreateForm";
import { getAdminCourseCreateData } from "@/lib/server/admin-course-data";

export default async function AdminCourseCreatePage() {
  const { scholars } = await getAdminCourseCreateData();

  return <AdminCourseCreateForm scholars={scholars} />;
}
