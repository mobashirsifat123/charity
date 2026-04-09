import Link from "next/link";

import { listAdminCourses } from "@/lib/server/admin-course-data";

export default async function AdminCoursesPage() {
  const courses = await listAdminCourses();

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card hover-lift hover-glow-primary border-0 shadow-sm rounded-4">
        <div className="card-body p-4 p-lg-5 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-3">Learning (LMS)</span>
            <h1 className="fw-bold mb-2">Courses</h1>
            <p className="text-muted mb-0">Create course overviews, open the builder, and keep the syllabus growing lesson by lesson.</p>
          </div>
          <Link href="/admin/courses/new" className="btn btn-primary btn-ripple hover-glow-primary rounded-pill px-4">
            Create Course
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {courses.length ? (
          courses.map((course) => (
            <div key={course.id} className="col-xl-4 col-md-6">
              <div className="card hover-lift hover-glow-primary border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <span className="badge bg-light text-dark border rounded-pill">
                      {course.moduleCount} modules
                    </span>
                    {course.scholar_profiles?.name ? (
                      <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill">
                        {course.scholar_profiles.name}
                      </span>
                    ) : null}
                  </div>
                  <h4 className="fw-bold mb-2">{course.title}</h4>
                  <p className="text-muted mb-4">
                    {course.description || "No course description has been added yet."}
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <Link href={`/admin/courses/${course.id}/modules`} className="btn btn-primary btn-ripple hover-glow-primary rounded-pill px-4">
                      Open Builder
                    </Link>
                    <Link href={`/courses/${course.id}`} className="btn btn-outline-secondary btn-ripple rounded-pill px-4">
                      View Public Page
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="card hover-lift hover-glow-primary border-0 shadow-sm rounded-4">
              <div className="card-body p-5 text-center">
                <i className="fa-solid fa-book-open-reader text-primary mb-3" style={{ fontSize: "2.5rem" }}></i>
                <h4 className="fw-bold mb-2">No courses created yet</h4>
                <p className="text-muted mb-4">Create the first course overview, then head into its builder to start adding modules.</p>
                <Link href="/admin/courses/new" className="btn btn-primary btn-ripple hover-glow-primary rounded-pill px-4">
                  Create First Course
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
