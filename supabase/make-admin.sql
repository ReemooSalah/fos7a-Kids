-- يجعل حسابك مشرفاً (يستطيع رفع المحتوى وتوليد الأصوات).
-- الخطوات:
--  1) Supabase › Authentication › Users › Add user › Create new user (بريدك + كلمة مرور قوية)، وفعّل Auto Confirm User.
--  2) غيّري البريد أدناه إلى بريدك نفسه ثم شغّلي الأمر في SQL Editor.

insert into public.admins (user_id)
select id from auth.users where email = 'PUT_YOUR_EMAIL_HERE'
on conflict do nothing;

-- للتأكد: يجب أن يظهر صف واحد
select a.user_id, u.email from public.admins a join auth.users u on u.id = a.user_id;
