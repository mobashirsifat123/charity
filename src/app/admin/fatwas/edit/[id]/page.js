"use client";
import FatwaEditorForm from '@/components/admin/FatwaEditorForm';

export default function FatwaEditorPage({ params }) {
    return <FatwaEditorForm fatwaId={params?.id || null} />;
}
