import Link from 'next/link';

import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';
import { getCourseOverview } from '@/lib/server/courses';

export default async function CourseOverviewPage({ params }) {
  const resolvedParams = await params;
  const { course, modules } = await getCourseOverview(resolvedParams.courseId);

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title={course.title}
        links={[
          { name: 'Home', link: '/' },
          { name: 'Courses', link: '/courses' },
          { name: course.title, link: `/courses/${course.id}` },
        ]}
      />
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="content-panel mb-4">
              <div className="card-body p-4 p-lg-5">
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-3">
                  Course Overview
                </span>
                <h1 className="fw-bold mb-3">{course.title}</h1>
                <p className="lead text-muted mb-0">{course.description}</p>
              </div>
            </div>

            <div className="content-panel">
              <div className="card-body p-4 p-lg-5">
                <h3 className="fw-bold mb-4">Course syllabus</h3>
                <div className="list-group list-group-flush">
                  {modules.map((module) => (
                    <Link
                      key={module.id}
                      href={`/courses/${course.id}/learn/${module.id}`}
                      className="list-group-item list-group-item-action border-0 px-0 py-3"
                    >
                      <div className="d-flex justify-content-between align-items-center gap-3">
                        <div>
                          <div className="text-muted small">Module {module.order_index}</div>
                          <div className="fw-semibold">{module.title}</div>
                        </div>
                        <span className="badge bg-light border rounded-pill">Start</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="content-panel">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Scholar</h5>
                <p className="fw-semibold mb-1">{course.scholar_profiles?.name || 'IRWA Scholar'}</p>
                <p className="text-muted small mb-2">{course.scholar_profiles?.credentials || 'Course Instructor'}</p>
                <p className="text-muted mb-0">{course.scholar_profiles?.bio || 'Structured Islamic learning designed for the IRWA audience.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterOne />
    </section>
  );
}
