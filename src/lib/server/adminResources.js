import { saveContentRecord } from '@/lib/content-utils';

export const ADMIN_RESOURCE_CONFIG = {
  campaigns: {
    table: 'campaigns',
    orders: [
      { column: 'created_at', ascending: false },
    ],
  },
  team: {
    table: 'team_members',
    orders: [
      { column: 'sort_order', ascending: true },
      { column: 'created_at', ascending: false },
    ],
  },
  blogs: {
    table: 'blogs',
    orders: [
      { column: 'created_at', ascending: false },
    ],
    usesAdvancedContentSave: true,
  },
  fatwas: {
    table: 'fatwas',
    orders: [
      { column: 'created_at', ascending: false },
    ],
    usesAdvancedContentSave: true,
  },
};

export function getAdminResourceConfig(resource) {
  return ADMIN_RESOURCE_CONFIG[resource] || null;
}

export async function listAdminResource({ supabase, resource }) {
  const config = getAdminResourceConfig(resource);
  if (!config) {
    throw new Error(`Unsupported admin resource: ${resource}`);
  }

  let query = supabase.from(config.table).select('*');

  for (const order of config.orders || []) {
    query = query.order(order.column, { ascending: order.ascending });
  }

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
}

export async function getAdminResource({ supabase, resource, id }) {
  const config = getAdminResourceConfig(resource);
  if (!config) {
    throw new Error(`Unsupported admin resource: ${resource}`);
  }

  const { data, error } = await supabase
    .from(config.table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createAdminResource({ supabase, resource, body }) {
  const config = getAdminResourceConfig(resource);
  if (!config) {
    throw new Error(`Unsupported admin resource: ${resource}`);
  }

  if (config.usesAdvancedContentSave) {
    const { basePayload, optionalPayload = {} } = body || {};

    if (!basePayload) {
      throw new Error('Missing basePayload for content resource.');
    }

    const result = await saveContentRecord({
      supabase,
      table: config.table,
      basePayload,
      optionalPayload,
    });

    return {
      optionalFieldsSaved: result.optionalFieldsSaved,
    };
  }

  const payload = body?.payload;
  if (!payload) {
    throw new Error('Missing payload for resource creation.');
  }

  const { data, error } = await supabase
    .from(config.table)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAdminResource({ supabase, resource, id, body }) {
  const config = getAdminResourceConfig(resource);
  if (!config) {
    throw new Error(`Unsupported admin resource: ${resource}`);
  }

  if (config.usesAdvancedContentSave) {
    const { basePayload, optionalPayload = {} } = body || {};

    if (!basePayload) {
      throw new Error('Missing basePayload for content resource update.');
    }

    const result = await saveContentRecord({
      supabase,
      table: config.table,
      recordId: id,
      basePayload,
      optionalPayload,
    });

    return {
      optionalFieldsSaved: result.optionalFieldsSaved,
    };
  }

  const payload = body?.payload;
  if (!payload) {
    throw new Error('Missing payload for resource update.');
  }

  const { data, error } = await supabase
    .from(config.table)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAdminResource({ supabase, resource, id }) {
  const config = getAdminResourceConfig(resource);
  if (!config) {
    throw new Error(`Unsupported admin resource: ${resource}`);
  }

  const { error } = await supabase
    .from(config.table)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function bulkDeleteAdminResource({ supabase, resource, ids = [] }) {
  const config = getAdminResourceConfig(resource);
  if (!config) {
    throw new Error(`Unsupported admin resource: ${resource}`);
  }

  if (!ids.length) {
    throw new Error('No ids provided for bulk delete.');
  }

  const { error } = await supabase
    .from(config.table)
    .delete()
    .in('id', ids);

  if (error) throw error;
}
