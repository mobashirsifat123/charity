import Link from 'next/link';

import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';
import MarkModuleCompleteButton from '@/components/courses/MarkModuleCompleteButton';
import { getCourseClassroom } from '@/lib/server/courses';
import { markModuleComplete } from '@/app/(courses)/courses/[courseId]/learn/[moduleId]/actions';

function getEmbedUrl(videoUrl = '') {
  const url = String(videoUrl || '').trim();

  if (!url) return '';

  if (url.includes('youtube.com/watch')) {
    const parsed = new URL(url);
    const videoId = parsed.searchParams.get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  }

  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  }

  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
  }

  return url;
}

export default async function CourseLearnPage({ params }) {
  const resolvedParams = await params;
  const { course, modules, activeModule } = await getCourseClassroom(
    resolvedParams.courseId,
    resolvedParams.moduleId
  );

  if (!activeModule) {
    return (
      <section className="page-wrapper">
        <HeaderOne />
        <div className="container py-5">
          <div className="alert alert-warning rounded-4">This course module could not be found.</div>
        </div>
        <FooterOne />
      </section>
    );
  }

  const embedUrl = getEmbedUrl(activeModule.video_url);
  const completionAction = markModuleComplete.bind(null, activeModule.id);

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title={activeModule.title}
        links={[
          { name: 'Home', link: '/' },
          { name: 'Courses', link: '/courses' },
          { name: course.title, link: `/courses/${course.id}` },
          { name: activeModule.title, link: `/courses/${course.id}/learn/${activeModule.id}` },
        ]}
      />

      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="content-panel overflow-hidden mb-4">
              <div className="ratio ratio-16x9" style={{ background: 'linear-gradient(135deg, #0a281f 0%, #145a32 100%)' }}>
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={activeModule.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center text-white">
                    Video unavailable
                  </div>
                )}
              </div>
            </div>

            <div className="content-panel">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                  <div>
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-3">
                      Module {activeModule.order_index}
                    </span>
                    <h1 className="fw-bold mb-2">{activeModule.title}</h1>
                    <p className="text-muted mb-0">
                      From the course <strong>{course.title}</strong> by {course.scholar_profiles?.name || 'IRWA Scholar'}.
                    </p>
                  </div>
                  <MarkModuleCompleteButton
                    action={completionAction}
                    nextHref={`/courses/${course.id}/learn/${activeModule.id}`}
                  />
                </div>

                <div className="rounded-4 p-4" style={{ background: 'var(--surface-alt)' }}>
                  <h4 className="fw-bold mb-3">Lesson notes</h4>
                  <p className="text-muted mb-0" style={{ whiteSpace: 'pre-line' }}>
                    {activeModule.content_text || 'No lesson notes have been added yet for this module.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="content-panel">
              <div className="card-body p-4">
                <div className="mb-4">
                  <h4 className="fw-bold mb-2">Course modules</h4>
                  <p className="text-muted mb-0">{modules.length} lessons in this course</p>
                </div>

                <div className="list-group list-group-flush">
                  {modules.map((module) => {
                    const isActive = String(module.id) === String(activeModule.id);

                    return (
                      <Link
                        key={module.id}
                        href={`/courses/${course.id}/learn/${module.id}`}
                        className={`list-group-item list-group-item-action border rounded-4 mb-3 ${isActive ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                      >
                        <div className="d-flex justify-content-between gap-3">
                          <div>
                            <div className="text-muted small">Module {module.order_index}</div>
                            <div className="fw-semibold">{module.title}</div>
                          </div>
                          {isActive ? (
                            <span className="badge bg-primary rounded-pill align-self-start">Now</span>
                          ) : null}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="border-top pt-4 mt-4">
                  <h6 className="fw-bold mb-2">Scholar</h6>
                  <p className="mb-1 fw-semibold">{course.scholar_profiles?.name || 'IRWA Scholar'}</p>
                  <p className="text-muted small mb-2">{course.scholar_profiles?.credentials || 'Course Instructor'}</p>
                  <p className="text-muted small mb-0">{course.scholar_profiles?.bio || 'A teacher contributing to the IRWA learning platform.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterOne />
    </section>
  );
}
