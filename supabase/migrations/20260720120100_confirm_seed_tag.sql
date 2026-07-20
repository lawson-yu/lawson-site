update public.tags
set state = 'confirmed'
where slug = 'unreviewed'
  and state = 'pending';
