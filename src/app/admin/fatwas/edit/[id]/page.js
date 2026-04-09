"use client";
import { useParams } from 'next/navigation';
import FatwaEditorForm from '@/components/admin/FatwaEditorForm';

export default function FatwaEditorPage() {
    const params = useParams();
    const fatwaId = typeof params?.id === 'string' ? params.id : null;
    return <FatwaEditorForm fatwaId={fatwaId} />;
}
