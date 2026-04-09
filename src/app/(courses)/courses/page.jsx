import Link from 'next/link';

import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';
import { listCourses } from '@/lib/server/courses';

export default async function CoursesCatalogPage() {
  const courses = await listCourses();

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title="Courses"
        links={[
          { name: 'Home', link: '/' },
          { name: 'Courses', link: '/courses' },
        ]}
      />
      <div className="container py-5">
        <div className="row g-4">
          {courses.length ? courses.map((course) => (
            <div key={course.id} className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm rounded-4 h-100 hover-lift">
                <div className="card-body p-4">
                  <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-3">
                    Learning Course
                  </span>
                  <h4 className="fw-bold mb-3">{course.title}</h4>
                  <p className="text-muted mb-4">{course.description || 'Structured Islamic learning with guided modules.'}</p>
                  <Link href={`/courses/${course.id}`} className="btn btn-outline-primary btn-ripple rounded-pill">
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-12">
              <div className="alert alert-light border rounded-4 mb-0">
                No courses are published yet.
              </div>
            </div>
          )}
        </div>
      </div>
      <FooterOne />
    </section>
  );
}
