import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/adminAuth';
import { isMissingColumnError, slugify } from '@/lib/content-utils';

const createDraftFatwa = async (supabase, requestRecord) => {
  const title = String(requestRecord.question || 'Fatwa Request').trim().slice(0, 140);
  const basePayload = {
    title,
    content: requestRecord.details || '',
    status: 'draft',
    author_id: null,
  };
  const optionalPayload = {
    question: requestRecord.question,
    answer: '',
    category: requestRecord.category || 'General',
    slug: slugify(title),
    author_name: requestRecord.name || 'Website Submission',
    author_role: 'Question Submitter',
    author_bio: requestRecord.email
      ? `Submitted from the fatwa request form by ${requestRecord.name} (${requestRecord.email}).`
      : `Submitted from the fatwa request form by ${requestRecord.name || 'a website visitor'}.`,
    seo_title: title,
    seo_description: '',
    social_image: '',
  };

  const fullInsert = await supabase
    .from('fatwas')
    .insert({ ...basePayload, ...optionalPayload })
    .select('id, title')
    .single();

  if (!fullInsert.error) {
    return fullInsert.data;
  }

  if (!isMissingColumnError(fullInsert.error)) {
    throw fullInsert.error;
  }

  const fallbackInsert = await supabase
    .from('fatwas')
    .insert(basePayload)
    .select('id, title')
    .single();

  if (fallbackInsert.error) {
    throw fallbackInsert.error;
  }

  return fallbackInsert.data;
};

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { supabase } = auth;
    const { data: requestRecord, error: requestError } = await supabase
      .from('fatwa_requests')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (requestError) throw requestError;

    if (!requestRecord?.question) {
      return NextResponse.json({ success: false, error: 'Fatwa request is missing a question.' }, { status: 400 });
    }

    if (requestRecord.status === 'converted') {
      return NextResponse.json({ success: false, error: 'This request has already been converted.' }, { status: 400 });
    }

    const fatwa = await createDraftFatwa(supabase, requestRecord);

    const { error: updateError } = await supabase
      .from('fatwa_requests')
      .update({ status: 'converted' })
      .eq('id', resolvedParams.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      data: {
        fatwaId: fatwa.id,
        title: fatwa.title,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
