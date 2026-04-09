import Link from "next/link";

import AdminCourseSyllabusManager from "@/components/admin/AdminCourseSyllabusManager";
import { getAdminCourseModulesData } from "@/lib/server/admin-course-data";

export default async function AdminCourseModulesPage({ params }) {
  const resolvedParams = await params;
  const { course, modules } = await getAdminCourseModulesData(resolvedParams.courseId);

  if (!course) {
    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-5 text-center">
          <i className="fa-solid fa-circle-exclamation text-warning mb-3" style={{ fontSize: "2.5rem" }}></i>
          <h3 className="fw-bold mb-2">Course not found</h3>
          <p className="text-muted mb-4">This course record could not be loaded from Supabase.</p>
          <Link href="/admin/courses" className="btn btn-primary rounded-pill px-4">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return <AdminCourseSyllabusManager course={course} initialModules={modules} />;
}
