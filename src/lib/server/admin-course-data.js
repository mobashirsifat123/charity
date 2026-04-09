import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder_key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function getAdminCourseCreateData() {
  const { data, error } = await supabase
    .from("scholar_profiles")
    .select("id, name, credentials")
    .order("name", { ascending: true });

  if (error) {
    return { scholars: [] };
  }

  return { scholars: data || [] };
}

export async function listAdminCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("*, scholar_profiles(id, name, credentials)")
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  const courseIds = (data || []).map((course) => course.id);
  if (!courseIds.length) {
    return data || [];
  }

  const { data: modulesData } = await supabase
    .from("course_modules")
    .select("id, course_id")
    .in("course_id", courseIds);

  const counts = new Map();
  (modulesData || []).forEach((module) => {
    counts.set(module.course_id, (counts.get(module.course_id) || 0) + 1);
  });

  return (data || []).map((course) => ({
    ...course,
    moduleCount: counts.get(course.id) || 0,
  }));
}

export async function getAdminCourseModulesData(courseId) {
  const [{ data: course, error: courseError }, { data: modules, error: modulesError }] = await Promise.all([
    supabase
      .from("courses")
      .select("*, scholar_profiles(id, name, credentials, bio)")
      .eq("id", courseId)
      .maybeSingle(),
    supabase
      .from("course_modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true }),
  ]);

  if (courseError || !course) {
    return { course: null, modules: [] };
  }

  return {
    course,
    modules: modulesError ? [] : (modules || []),
  };
}
