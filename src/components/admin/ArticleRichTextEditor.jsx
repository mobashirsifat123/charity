"use client";

const WRITING_HELP = [
  "Use <h2>Section title</h2> for headings.",
  "Use <p>Your paragraph</p> for normal writing.",
  "Use <blockquote>Important quote</blockquote> for highlighted reminders.",
  "Paste YouTube iframe embed code where a video should appear.",
];

export default function ArticleRichTextEditor({ value, onChange }) {
  return (
    <div className="admin-safe-editor rounded-4 overflow-hidden border bg-white">
      <div className="admin-safe-editor__bar d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <div>
          <strong>Article body</strong>
          <span className="text-muted ms-2 small">HTML supported</span>
        </div>
        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">
          Stable editor
        </span>
      </div>
      <textarea
        className="admin-safe-editor__textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={16}
        placeholder="<h2>Begin with a clear heading</h2>&#10;<p>Write the article content here...</p>"
      />
      <div className="admin-safe-editor__help">
        {WRITING_HELP.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
