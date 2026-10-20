import { createClient } from 'npm:@supabase/supabase-js@2';
import { unzipSync } from 'npm:fflate@0.8.3';
import { parse } from 'npm:yaml@2.9.1';
import { canReadSkill, appliesToContext } from './policy.ts';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, x-external-token' };
const db = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const service = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Технический редактор', description: 'Структура, точные формулировки и минимум воды.', instructions: 'Пиши кратко и технически точно. Структурируй ответ. Отмечай неопределённость.', source: 'service', scope: 'global', visibility: 'private', enabled: true, owner_id: null, space_id: null },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Code review', description: 'Проверка кода, рисков и пограничных случаев.', instructions: 'При анализе кода укажи ошибки, риски безопасности и пограничные случаи. Предлагай минимальные исправления.', source: 'service', scope: 'global', visibility: 'private', enabled: true, owner_id: null, space_id: null },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Визуальный бриф', description: 'Композиция, свет и детали для генерации.', instructions: 'Для визуальных задач сформируй точный бриф: объект, композиция, свет, материалы и ограничения.', source: 'service', scope: 'global', visibility: 'private', enabled: true, owner_id: null, space_id: null },
];
function checked<T>(result: { data: T; error: unknown }): T { if (result.error) throw new Error('Не удалось сохранить данные'); return result.data; }
const text = (v: unknown, max = 200) => { if (typeof v !== 'string' || !v.trim() || v.length > max) throw new Error('Некорректное значение'); return v.trim(); };
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  try {
    const body = await req.json();
    const token = req.headers.get('x-external-token');
    let userId = ''; const accountId = 'external:1';
    if (token) {
      const profile = await fetch('https://kafkatestdomen.site/api/v1/user_profile', { headers: { Authorization: `Bearer ${token}`, 'X-Project-ID': '1' } });
      if (!profile.ok) return Response.json({ error: 'Войдите в аккаунт NEXAGEN' }, { status: 401, headers: cors });
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Не удалось определить пользователя');
      const claims = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      userId = text(claims.sub);
      checked(await db.from('account_skill_members').upsert({ account_id: accountId, user_id: userId, label: userId }));
    }
    if (!userId && body.action !== 'list') return Response.json({ error: 'Для сохранения Skills войдите в аккаунт NEXAGEN' }, { status: 401, headers: cors });
    const spaces = userId ? checked(await db.from('skill_spaces').select('*').eq('account_id', accountId)) : [];
    const memberships = userId ? checked(await db.from('skill_space_members').select('*').eq('user_id', userId)) : [];
    const memberSpaces = [...spaces.filter(s => s.owner_id === userId).map(s => s.id), ...memberships.map(m => m.space_id)];
    const skills = userId ? checked(await db.from('skills').select('*').eq('account_id', accountId)) : [];
    const readable = [...service, ...skills.filter(s => canReadSkill(s, userId, memberSpaces))];
    const selections = userId ? checked(await db.from('skill_selections').select('*').eq('user_id', userId)) : [];
    const ownedSpace = (id: string) => { const s = spaces.find(s => s.id === id && s.owner_id === userId); if (!s) throw new Error('Только владелец пространства может менять его участников'); return s; };
    let result: unknown = null;
    if (body.action === 'list') result = { skills: readable, selections, spaces: spaces.filter(s => memberSpaces.includes(s.id)), userId, accountMembers: userId ? checked(await db.from('account_skill_members').select('user_id,label').eq('account_id', accountId)) : [], members: userId ? checked(await db.from('skill_space_members').select('*').in('space_id', memberSpaces.length ? memberSpaces : ['__none__'])) : [] };
    else if (body.action === 'registerSpace') {
      const id = text(body.id); const name = text(body.name, 100);
      const existing = checked(await db.from('skill_spaces').select('*').eq('id', id).maybeSingle());
      if (existing && (existing.account_id !== accountId || existing.owner_id !== userId)) throw new Error('Пространство недоступно');
      result = checked(await db.from('skill_spaces').upsert({ id, name, account_id: accountId, owner_id: userId }));
    } else if (body.action === 'member') {
      const id = text(body.spaceId); ownedSpace(id); const target = text(body.userId);
      const exists = checked(await db.from('account_skill_members').select('*').eq('account_id', accountId).eq('user_id', target).maybeSingle());
      if (!exists) throw new Error('Участник должен сначала войти в аккаунт');
      result = body.enabled ? checked(await db.from('skill_space_members').upsert({ space_id: id, user_id: target })) : checked(await db.from('skill_space_members').delete().eq('space_id', id).eq('user_id', target));
    } else if (body.action === 'create') {
      if (!['global', 'space'].includes(body.scope) || !['private', 'project'].includes(body.visibility)) throw new Error('Некорректная область или видимость');
      const spaceId = body.spaceId || null;
      if ((body.scope === 'space' || body.visibility === 'project') && !spaceId) throw new Error('Выберите пространство');
      if (spaceId && !memberSpaces.includes(spaceId)) throw new Error('Нет доступа к пространству');
      if (typeof body.file !== 'string' || body.file.length > 7000000) throw new Error('Файл слишком большой');
      const bytes = Uint8Array.from(atob(body.file), c => c.charCodeAt(0));
      if (bytes.length > 5 * 1024 * 1024) throw new Error('Файл слишком большой');
      const filename = text(body.filename, 255); let raw = '';
      if (filename.toLowerCase() === 'skill.md') raw = new TextDecoder().decode(bytes);
      else if (filename.toLowerCase().endsWith('.zip')) {
        const entries = unzipSync(bytes, { filter: f => /(^|\/)skill\.md$/i.test(f.name) && f.originalSize <= 100000 });
        const names = Object.keys(entries).filter(n => !n.startsWith('__MACOSX/') && !n.split('/').includes('..'));
        if (names.length !== 1) throw new Error('ZIP должен содержать один SKILL.md');
        raw = new TextDecoder().decode(entries[names[0]]);
      } else throw new Error('Загрузите SKILL.md или ZIP');
      const match = raw.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/);
      if (!match) throw new Error('SKILL.md должен содержать name и description в YAML-заголовке');
      const meta = parse(match[1]); const name = text(meta?.name, 100); const description = text(meta?.description, 2000); const instructions = text(match[2], 100000);
      const path = `${crypto.randomUUID()}/${filename.toLowerCase().endsWith('.zip') ? 'skill.zip' : 'SKILL.md'}`;
      checked(await db.storage.from('skill-packages').upload(path, bytes, { contentType: filename.endsWith('.zip') ? 'application/zip' : 'text/markdown' }));
      const insert = await db.from('skills').insert({ account_id: accountId, owner_id: userId, name, description, instructions, source: 'user', scope: body.scope, space_id: spaceId, visibility: body.visibility, file_path: path });
      if (insert.error) { await db.storage.from('skill-packages').remove([path]); throw new Error('Не удалось сохранить скилл'); }
    } else if (body.action === 'select') {
      const skill = readable.find(s => s.id === body.skillId); if (!skill) throw new Error('Скилл недоступен');
      const context = text(body.contextId);
      if (context !== '__global__' && !memberSpaces.includes(context)) throw new Error('Нет доступа к пространству');
      if (!appliesToContext(skill, context === '__global__' ? null : context)) throw new Error('Скилл недоступен в этом пространстве');
      if (skill.source === 'service') checked(await db.from('skills').upsert({ ...skill, account_id: null }));
      result = checked(await db.from('skill_selections').upsert({ user_id: userId, context_id: context, skill_id: skill.id, enabled: !!body.enabled }));
    } else if (body.action === 'toggle' || body.action === 'delete') {
      const skill = skills.find(s => s.id === body.skillId && s.owner_id === userId); if (!skill) throw new Error('Только автор может удалить или выключить скилл');
      if (body.action === 'toggle') result = checked(await db.from('skills').update({ enabled: !!body.enabled }).eq('id', skill.id));
      else { result = checked(await db.from('skills').delete().eq('id', skill.id)); if (skill.file_path) await db.storage.from('skill-packages').remove([skill.file_path]); }
    } else if (body.action === 'instructions') {
      const context = body.spaceId || '__global__';
      if (body.spaceId && !memberSpaces.includes(body.spaceId)) throw new Error('Нет доступа к пространству');
      result = readable.filter(s => appliesToContext(s, body.spaceId || null) && selections.some(a => a.skill_id === s.id && a.enabled && (a.context_id === context || (s.scope === 'global' && a.context_id === '__global__')))).map(s => ({ name: s.name, instructions: s.instructions }));
    } else throw new Error('Неизвестное действие');
    return Response.json({ data: result }, { headers: cors });
  } catch (err) { return Response.json({ error: err instanceof Error ? err.message : 'Ошибка Skills' }, { status: 400, headers: cors }); }
});