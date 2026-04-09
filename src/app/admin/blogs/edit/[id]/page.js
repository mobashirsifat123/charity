"use client";
import { useParams } from 'next/navigation';
import BlogEditorForm from '@/components/admin/BlogEditorForm';

export default function BlogEditorPage() {
    const params = useParams();
    const blogId = typeof params?.id === 'string' ? params.id : null;
    return <BlogEditorForm blogId={blogId} />;
}
