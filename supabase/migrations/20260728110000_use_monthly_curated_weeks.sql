update public.content_variants as variant
set metadata = jsonb_set(
  variant.metadata,
  '{week}',
  to_jsonb(
    to_char((variant.metadata ->> 'collectedAt')::date, 'YYYY-MM') ||
    '-W' ||
    (((extract(day from (variant.metadata ->> 'collectedAt')::date)::integer - 1) / 7 + 1)::text)
  )
)
from public.content_items as item
where variant.content_item_id = item.id
  and item.kind = 'curated'
  and variant.metadata ->> 'week' ~ '^[0-9]{4}-W[0-9]{2}$';
