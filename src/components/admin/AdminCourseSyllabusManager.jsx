"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ArticleRichTextEditor from "@/components/admin/ArticleRichTextEditor";
import {
  createModule,
  deleteModule,
  updateModule,
} from "@/app/admin/course-actions";
import { supabase } from "@/lib/supabaseClient";

function ModuleEditor({ module, courseId, accessToken, onSaved }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formState, setFormState] = useState({
    title: module.title || "",
    videoUrl: module.video_url || "",
    orderIndex: String(module.order_index || 1),
    contentText: module.content_text || "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSave = () => {
    setMessage({ type: "", text: "" });

    startTransition(async () => {
      const result = await updateModule(module.id, {
        accessToken,
        courseId,
        title: formState.title,
        videoUrl: formState.videoUrl,
        orderIndex: formState.orderIndex,
        contentText: formState.contentText,
      });

      if (!result?.success) {
        setMessage({ type: "danger", text: result?.error || "Unable to update module." });
        return;
      }

      setMessage({ type: "success", text: "Module updated." });
      onSaved();
    });
  };

  return (
    <div className="border rounded-4 p-4 bg-white">
      {message.text ? (
        <div className={`alert alert-${message.type} border-0 rounded-4`} role="alert">
          {message.text}
        </div>
      ) : null}

      <div className="row g-3">
        <div className="col-md-7">
          <label className="form-label fw-semibold">Module Title</label>
          <input
            type="text"
            name="title"
            className="form-control bg-light border-0"
            value={formState.title}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-5">
          <label className="form-label fw-semibold">Order Number</label>
          <input
            type="number"
            name="orderIndex"
            min="1"
            className="form-control bg-light border-0"
            value={formState.orderIndex}
            onChange={handleChange}
          />
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold">YouTube Embed URL</label>
          <input
            type="url"
            name="videoUrl"
            className="form-control bg-light border-0"
            value={formState.videoUrl}
            onChange={handleChange}
            placeholder="https://www.youtube.com/embed/..."
          />
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold">Lesson Notes</label>
          <ArticleRichTextEditor
            value={formState.contentText}
            onChange={(value) => setFormState((current) => ({ ...current, contentText: value }))}
          />
        </div>
        <div className="col-12">
          <button type="button" className="btn btn-primary rounded-pill px-4" disabled={isPending || !accessToken} onClick={handleSave}>
            {isPending ? "Saving..." : "Save Module Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCourseSyllabusManager({ course, initialModules = [] }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [modules, setModules] = useState(initialModules);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [isCreating, startCreateTransition] = useTransition();
  const [deletingId, setDeletingId] = useState(null);
  const [newModule, setNewModule] = useState({
    title: "",
    videoUrl: "",
    orderIndex: String((initialModules[initialModules.length - 1]?.order_index || 0) + 1),
    contentText: "",
  });

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (active) {
        setAccessToken(session?.access_token || "");
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  const refreshModules = () => {
    router.refresh();
  };

  const handleAddModule = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.set("accessToken", accessToken);
    formData.set("title", newModule.title);
    formData.set("videoUrl", newModule.videoUrl);
    formData.set("orderIndex", newModule.orderIndex);
    formData.set("contentText", newModule.contentText);

    setFeedback({ type: "", text: "" });

    startCreateTransition(async () => {
      const result = await createModule(course.id, formData);

      if (!result?.success) {
        setFeedback({ type: "danger", text: result?.error || "Unable to add module." });
        return;
      }

      setFeedback({ type: "success", text: "Module added successfully." });
      setShowAddModal(false);
      refreshModules();
    });
  };

  const handleDelete = async (moduleId) => {
    if (!window.confirm("Delete this module from the course syllabus?")) {
      return;
    }

    setDeletingId(moduleId);
    const formData = new FormData();
    formData.set("accessToken", accessToken);
    formData.set("courseId", String(course.id));

    const result = await deleteModule(moduleId, formData);
    setDeletingId(null);

    if (!result?.success) {
      setFeedback({ type: "danger", text: result?.error || "Unable to delete module." });
      return;
    }

    setFeedback({ type: "success", text: "Module deleted." });
    refreshModules();
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4 p-lg-5">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div>
              <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-3">Course Builder</span>
              <h1 className="fw-bold mb-2">{course.title}</h1>
              <p className="text-muted mb-0">
                {course.description || "Build the syllabus over time by adding and refining modules whenever new lessons are ready."}
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link href="/admin/courses" className="btn btn-outline-secondary rounded-pill px-4">
                Back to Courses
              </Link>
              <button type="button" className="btn btn-primary rounded-pill px-4" onClick={() => setShowAddModal(true)}>
                Add New Module
              </button>
            </div>
          </div>

          <div className="row g-3 mt-2">
            <div className="col-md-4">
              <div className="border rounded-4 p-3 bg-light h-100">
                <div className="text-muted small text-uppercase fw-semibold mb-1">Scholar</div>
                <div className="fw-semibold">{course.scholar_profiles?.name || "No scholar assigned"}</div>
                <div className="text-muted small">{course.scholar_profiles?.credentials || "Course instructor"}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="border rounded-4 p-3 bg-light h-100">
                <div className="text-muted small text-uppercase fw-semibold mb-1">Modules</div>
                <div className="fw-semibold">{modules.length}</div>
                <div className="text-muted small">Lessons currently in the syllabus</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="border rounded-4 p-3 bg-light h-100">
                <div className="text-muted small text-uppercase fw-semibold mb-1">Public course page</div>
                <div className="fw-semibold">
                  <Link href={`/courses/${course.id}`} className="text-decoration-none">
                    /courses/{course.id}
                  </Link>
                </div>
                <div className="text-muted small">Open the learner-facing overview</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {feedback.text ? (
        <div className={`alert alert-${feedback.type} border-0 rounded-4`} role="alert">
          {feedback.text}
        </div>
      ) : null}

      <div className="d-flex flex-column gap-4">
        {modules.length ? (
          modules.map((module) => {
            const isEditing = editingId === module.id;

            return (
              <div key={module.id} className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3 mb-3">
                    <div>
                      <span className="badge bg-light text-dark border rounded-pill mb-2">
                        Module {module.order_index}
                      </span>
                      <h4 className="fw-bold mb-1">{module.title}</h4>
                      <div className="text-muted small">
                        {module.video_url || "No video URL set yet"}
                      </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary rounded-pill px-4"
                        onClick={() => setEditingId(isEditing ? null : module.id)}
                      >
                        {isEditing ? "Close Editor" : "Edit Module"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger rounded-pill px-4"
                        disabled={deletingId === module.id || !accessToken}
                        onClick={() => handleDelete(module.id)}
                      >
                        {deletingId === module.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>

                  {!isEditing ? (
                    <div
                      className="text-muted"
                      dangerouslySetInnerHTML={{
                        __html: module.content_text || "<p>No lesson notes added yet.</p>",
                      }}
                    />
                  ) : (
                    <ModuleEditor
                      module={module}
                      courseId={course.id}
                      accessToken={accessToken}
                      onSaved={refreshModules}
                    />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-5 text-center">
              <i className="fa-solid fa-list-check text-primary mb-3" style={{ fontSize: "2.5rem" }}></i>
              <h4 className="fw-bold mb-2">No modules yet</h4>
              <p className="text-muted mb-4">Start building the syllabus by adding the first lesson for this course.</p>
              <button type="button" className="btn btn-primary rounded-pill px-4" onClick={() => setShowAddModal(true)}>
                Add First Module
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: "rgba(15, 23, 36, 0.7)", zIndex: 1080 }}
        >
          <div className="card border-0 shadow-lg rounded-4 w-100" style={{ maxWidth: "920px", maxHeight: "92vh", overflow: "auto" }}>
            <div className="card-body p-4 p-lg-5">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-3">Add Module</span>
                  <h3 className="fw-bold mb-2">New lesson for {course.title}</h3>
                  <p className="text-muted mb-0">Add the next video lesson and its notes. You can edit the module again later.</p>
                </div>
                <button type="button" className="btn btn-link text-dark text-decoration-none p-0" onClick={() => setShowAddModal(false)}>
                  <i className="fa-solid fa-xmark fs-3"></i>
                </button>
              </div>

              <form onSubmit={handleAddModule} className="row g-4">
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Module Title</label>
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light border-0"
                    value={newModule.title}
                    onChange={(event) => setNewModule((current) => ({ ...current, title: event.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Order Number</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control form-control-lg bg-light border-0"
                    value={newModule.orderIndex}
                    onChange={(event) => setNewModule((current) => ({ ...current, orderIndex: event.target.value }))}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">YouTube Embed URL</label>
                  <input
                    type="url"
                    className="form-control bg-light border-0"
                    placeholder="https://www.youtube.com/embed/..."
                    value={newModule.videoUrl}
                    onChange={(event) => setNewModule((current) => ({ ...current, videoUrl: event.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Lesson Notes</label>
                  <ArticleRichTextEditor
                    value={newModule.contentText}
                    onChange={(value) => setNewModule((current) => ({ ...current, contentText: value }))}
                  />
                </div>
                <div className="col-12 d-flex flex-wrap gap-2">
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={isCreating || !accessToken}>
                    {isCreating ? "Adding module..." : "Save Module"}
                  </button>
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
