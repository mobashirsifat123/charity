import { createClient } from '@supabase/supabase-js';
import { hasValidSupabaseServerEnv } from '@/lib/server/env';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
);

function isMissingTableError(error, tableName) {
  if (!error) return false;
  return error.code === 'PGRST205' && String(error.message || '').includes(`public.${tableName}`);
}

function createPlaceholderCourse(id) {
  return {
    id: Number(id),
    title: 'Foundations of Islamic Learning',
    description:
      'A structured introductory course covering the essentials of knowledge, sincerity, and the etiquette of learning.',
    cover_image: '',
    scholar_id: null,
    scholar_profiles: {
      id: 0,
      name: 'IRWA Scholar',
      bio: 'A teacher contributing to the IRWA learning platform.',
      avatar_url: '',
      credentials: 'Islamic Studies Instructor',
    },
  };
}

function createPlaceholderModules(courseId) {
  return [
    {
      id: 1,
      course_id: Number(courseId),
      title: 'Why Seeking Knowledge Matters',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      order_index: 1,
      content_text:
        'In this opening lesson, we look at the virtue of sacred knowledge, why sincerity matters, and how learning should shape worship and character.',
    },
    {
      id: 2,
      course_id: Number(courseId),
      title: 'Adab of the Student of Knowledge',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      order_index: 2,
      content_text:
        'This module covers humility, consistency, respect for scholars, and building a sustainable routine for study.',
    },
    {
      id: 3,
      course_id: Number(courseId),
      title: 'Turning Knowledge into Action',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      order_index: 3,
      content_text:
        'The final lesson focuses on implementation, reflection, and the practical impact of learning on daily life.',
    },
  ];
}

function logCourseFallback(...args) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(...args);
  }
}

export async function listCourses() {
  if (!hasValidSupabaseServerEnv()) {
    return [createPlaceholderCourse(1)];
  }

  const { data, error } = await supabase
    .from('courses')
    .select('*, scholar_profiles(*)')
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingTableError(error, 'courses')) {
      return [createPlaceholderCourse(1)];
    }
    logCourseFallback('Unable to load courses, using empty fallback:', error);
    return [];
  }

  return data || [];
}

export async function getCourseOverview(courseId) {
  if (!hasValidSupabaseServerEnv()) {
    return {
      course: createPlaceholderCourse(courseId),
      modules: createPlaceholderModules(courseId),
    };
  }

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*, scholar_profiles(*)')
    .eq('id', courseId)
    .maybeSingle();

  const { data: modules, error: modulesError } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  if (courseError || modulesError || !course) {
    const missingCourses = isMissingTableError(courseError, 'courses');
    const missingModules = isMissingTableError(modulesError, 'course_modules');

    if (!missingCourses && !missingModules) {
      logCourseFallback('Unable to load course overview, using fallback data:', courseError || modulesError);
    }

    return {
      course: createPlaceholderCourse(courseId),
      modules: createPlaceholderModules(courseId),
    };
  }

  return {
    course,
    modules: modules || [],
  };
}

export async function getCourseClassroom(courseId, moduleId) {
  const overview = await getCourseOverview(courseId);
  const activeModule =
    overview.modules.find((module) => String(module.id) === String(moduleId)) ||
    overview.modules[0] ||
    null;

  return {
    ...overview,
    activeModule,
  };
}
