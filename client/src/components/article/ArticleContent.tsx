import { useEffect, useRef } from 'react';
import { resolveImageUrl } from '../../lib/utils';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import go from 'highlight.js/lib/languages/go';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import powershell from 'highlight.js/lib/languages/powershell';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('css', css);
hljs.registerLanguage('go', go);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('yara', c);

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface ArticleContentProps {
  html: string;
  onHeadingsExtracted?: (headings: TocHeading[]) => void;
}

export function ArticleContent({ html, onHeadingsExtracted }: ArticleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 1. Add anchor IDs to H2 / H3 headings for Table of Contents
    const headingEls = Array.from(el.querySelectorAll('h2, h3'));
    const headings: TocHeading[] = headingEls.map((h, idx) => {
      const text = (h.textContent || '').trim();
      const id =
        h.id ||
        `section-${idx}-${text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 40)}`;
      h.id = id;
      return { id, text, level: h.tagName === 'H2' ? 2 : 3 };
    });
    onHeadingsExtracted?.(headings);

    // 2. Highlight code blocks and attach crisp header + copy button
    const preBlocks = Array.from(el.querySelectorAll('pre'));
    preBlocks.forEach((pre) => {
      const code = pre.querySelector('code');
      if (!code) return;

      const langMatch = code.className.match(/language-([a-z0-9_-]+)/i);
      const lang = langMatch ? langMatch[1].toLowerCase() : '';

      if (lang && hljs.getLanguage(lang)) {
        code.innerHTML = hljs.highlight(code.textContent || '', { language: lang }).value;
        code.classList.add('hljs');
      } else {
        const auto = hljs.highlightAuto(code.textContent || '');
        code.innerHTML = auto.value;
        code.classList.add('hljs');
      }

      if (pre.parentElement?.classList.contains('cw-code-wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.className =
        'cw-code-wrapper my-7 overflow-hidden rounded-xl border border-slate-800/90 bg-[#0A0F1A] shadow-lg';

      const header = document.createElement('div');
      header.className =
        'flex items-center justify-between border-b border-slate-800/80 bg-[#0E1525] px-4 py-2 text-[11px] font-mono text-slate-400';

      const left = document.createElement('div');
      left.className = 'flex items-center gap-2';
      left.innerHTML = `<span class="inline-block h-2 w-2 rounded-full bg-sky-400/80"></span><span class="uppercase tracking-wider">${
        lang || 'code'
      }</span>`;

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.textContent = 'Copy';
      copyBtn.className =
        'rounded-md border border-slate-700/80 bg-slate-900 px-2.5 py-0.5 text-[11px] text-slate-300 transition hover:border-sky-500/50 hover:text-sky-300 cursor-pointer';
      copyBtn.onclick = () => {
        navigator.clipboard?.writeText(code.textContent || '').then(() => {
          copyBtn.textContent = 'Copied';
          copyBtn.classList.add('text-emerald-300', 'border-emerald-500/40');
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('text-emerald-300', 'border-emerald-500/40');
          }, 1800);
        });
      };

      header.appendChild(left);
      header.appendChild(copyBtn);

      pre.style.margin = '0';
      pre.style.border = 'none';
      pre.style.borderRadius = '0';

      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    });

    // 3. Resolve relative image sources if API base URL is configured
    const imgEls = Array.from(el.querySelectorAll('img'));
    imgEls.forEach((img) => {
      const src = img.getAttribute('src');
      if (
        src &&
        !src.startsWith('http://') &&
        !src.startsWith('https://') &&
        !src.startsWith('data:')
      ) {
        img.src = resolveImageUrl(src);
      }
    });
  }, [html, onHeadingsExtracted]);

  return (
    <div
      ref={containerRef}
      className="article-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
