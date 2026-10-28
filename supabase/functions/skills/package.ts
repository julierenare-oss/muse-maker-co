import { unzipSync } from 'npm:fflate@0.8.3';
import { parse } from 'npm:yaml@2.9.1';

const text = (v: unknown, max: number) => {
  if (typeof v !== 'string' || !v.trim() || v.length > max) throw new Error('Некорректное значение');
  return v.trim();
};

export function parseSkillPackage(filename: string, bytes: Uint8Array) {
  if (bytes.length > 5 * 1024 * 1024) throw new Error('Файл слишком большой');
  let raw = '';
  if (filename.toLowerCase() === 'skill.md') {
    if (bytes.length > 100000) throw new Error('SKILL.md слишком большой');
    raw = new TextDecoder().decode(bytes);
  } else if (filename.toLowerCase().endsWith('.zip')) {
    const entries = unzipSync(bytes, { filter: f => /(^|\/)skill\.md$/i.test(f.name) && f.originalSize <= 100000 });
    const names = Object.keys(entries).filter(n => !n.startsWith('__MACOSX/') && !n.split('/').some(p => p === '..' || p === '.') && !n.startsWith('/') && !n.includes('\\'));
    if (names.length !== 1) throw new Error('ZIP должен содержать один SKILL.md');
    raw = new TextDecoder().decode(entries[names[0]]);
  } else throw new Error('Загрузите SKILL.md или ZIP');
  const match = raw.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/);
  if (!match) throw new Error('SKILL.md должен содержать name и description в YAML-заголовке');
  const meta = parse(match[1]);
  return { name: text(meta?.name, 100), description: text(meta?.description, 2000), instructions: text(match[2], 100000) };
}