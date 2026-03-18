"use client";
import BlogEditorForm from '@/components/admin/BlogEditorForm';

export default function BlogEditorPage({ params }) {
    return <BlogEditorForm blogId={params?.id || null} />;
}
