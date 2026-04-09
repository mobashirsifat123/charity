"use client";

import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="form-control bg-light border-0 d-flex align-items-center" style={{ minHeight: "320px" }}>
      Loading editor...
    </div>
  ),
});

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "blockquote",
  "list",
  "bullet",
  "link",
];

export default function ArticleRichTextEditor({ value, onChange }) {
  return (
    <div className="rounded-4 overflow-hidden border bg-white">
      <ReactQuill theme="snow" value={value} onChange={onChange} modules={modules} formats={formats} />
    </div>
  );
}
