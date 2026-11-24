import sanitizeHtml from 'sanitize-html';

export function sanitizeArticleHtml(dirtyHtml = '') {
  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'sub', 'sup',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height', 'class', 'data-align', 'style'],
      code: ['class'],
      pre: ['class'],
      p: ['style', 'class'],
      h1: ['id', 'style', 'class'],
      h2: ['id', 'style', 'class'],
      h3: ['id', 'style', 'class'],
      div: ['class', 'data-align'],
      figure: ['class', 'data-align'],
      span: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    allowedStyles: {
      '*': {
        'text-align': [/^(left|center|right|justify)$/],
      },
      img: {
        width: [/^\d+(%|px)$/],
        'max-width': [/^\d+(%|px)$/],
      },
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || '#';
        const isExternal = href.startsWith('http://') || href.startsWith('https://');
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
          },
        };
      },
    },
  });
}
