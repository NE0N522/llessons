(() => {
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const blockTags = new Set(['address', 'area', 'article', 'aside', 'base', 'blockquote', 'body', 'br', 'caption', 'col', 'dd', 'details', 'dialog', 'div', 'dl', 'dt', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'iframe', 'img', 'input', 'legend', 'li', 'link', 'main', 'menu', 'meta', 'nav', 'ol', 'p', 'param', 'picture', 'pre', 'section', 'source', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'track', 'tr', 'ul', 'video', 'audio', 'wbr', 'svg']);

  const normalizeDeclaration = (value) => {
    let output = '';
    let quote = '';
    let escaped = false;
    let parens = 0;
    let colonWritten = false;
    for (let index = 0; index < value.length; index += 1) {
      const char = value[index];
      if (quote) {
        output += char;
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === quote) quote = '';
        continue;
      }
      if (char === '"' || char === "'") { quote = char; output += char; continue; }
      if (char === '(') parens += 1;
      else if (char === ')') parens = Math.max(0, parens - 1);
      if (char === ':' && parens === 0 && !colonWritten) {
        output = output.trimEnd() + ': ';
        while (value[index + 1] === ' ') index += 1;
        colonWritten = true;
      } else output += char;
    }
    return output.trim();
  };

  const normalizePrelude = (value) => String(value).trim()
    .replace(/^(@(?:media|supports|container|scope|document))\s*\(/i, '$1 (')
    .replace(/\(([a-z-]+)\s*:\s*([^()]+)\)/gi, '($1: $2)');

  const formatCss = (source = '') => {
    const input = String(source).trim();
    if (!input) return '';
    let output = '';
    let buffer = '';
    let depth = 0;
    let parens = 0;
    let quote = '';
    let escaped = false;
    let comment = false;
    const indent = () => '  '.repeat(Math.max(0, depth));
    const write = (suffix = '', declaration = false) => {
      const rawValue = buffer.trim();
      const value = declaration ? normalizeDeclaration(rawValue) : suffix === ' {' ? normalizePrelude(rawValue) : rawValue;
      if (value) output += `${indent()}${value}${suffix}\n`;
      buffer = '';
    };

    for (let index = 0; index < input.length; index += 1) {
      const char = input[index];
      const next = input[index + 1];
      if (comment) {
        buffer += char;
        if (char === '*' && next === '/') {
          buffer += '/';
          index += 1;
          comment = false;
        }
        continue;
      }
      if (quote) {
        buffer += char;
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === quote) quote = '';
        continue;
      }
      if (char === '/' && next === '*') {
        buffer += '/*';
        index += 1;
        comment = true;
        continue;
      }
      if (char === '"' || char === "'" || char === '`') {
        quote = char;
        buffer += char;
        continue;
      }
      if (char === '(') parens += 1;
      else if (char === ')') parens = Math.max(0, parens - 1);
      if (parens === 0 && char === '{') {
        write(' {');
        depth += 1;
      } else if (parens === 0 && char === ';') {
        write(';', depth > 0);
      } else if (parens === 0 && char === '}') {
        if (buffer.trim()) write(';', depth > 0);
        depth = Math.max(0, depth - 1);
        output += `${indent()}}\n`;
        if (depth === 0) output += '\n';
      } else {
        buffer += char;
      }
    }
    if (buffer.trim()) write();
    return output.trim();
  };

  const findTagEnd = (source, start) => {
    let quote = '';
    for (let index = start + 1; index < source.length; index += 1) {
      const char = source[index];
      if (quote) {
        if (char === quote && source[index - 1] !== '\\') quote = '';
      } else if (char === '"' || char === "'") quote = char;
      else if (char === '>') return index;
    }
    return -1;
  };

  const tokenizeHtml = (source) => {
    const tokens = [];
    let index = 0;
    while (index < source.length) {
      if (source[index] !== '<') {
        let end = source.indexOf('<', index + 1);
        if (end < 0) end = source.length;
        tokens.push({ type: 'text', value: source.slice(index, end) });
        index = end;
        continue;
      }
      if (source.startsWith('<!--', index)) {
        const end = source.indexOf('-->', index + 4);
        const stop = end < 0 ? source.length : end + 3;
        tokens.push({ type: 'special', value: source.slice(index, stop) });
        index = stop;
        continue;
      }
      const looksLikeTag = /^<(?:!|\?|\/?[a-z][\w:-]*\b)/i.test(source.slice(index));
      const end = looksLikeTag ? findTagEnd(source, index) : -1;
      if (end < 0) {
        tokens.push({ type: 'text', value: '<' });
        index += 1;
        continue;
      }
      const value = source.slice(index, end + 1);
      const match = value.match(/^<\s*(\/)?\s*([a-z][\w:-]*)\b/i);
      if (!match) tokens.push({ type: 'special', value });
      else tokens.push({ type: 'tag', value, name: match[2].toLowerCase(), closing: Boolean(match[1]), selfClosing: /\/\s*>$/.test(value) });
      index = end + 1;
    }
    return tokens;
  };

  const formatOpeningTag = (tag, indent) => {
    if (tag.value.length < 96 || tag.closing || tag.selfClosing) return tag.value.trim();
    const match = tag.value.match(/^<([a-z][\w:-]*)([\s\S]*?)>$/i);
    if (!match) return tag.value.trim();
    const attrs = match[2].match(/[^\s=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/g) || [];
    if (attrs.length < 2) return tag.value.trim();
    return `<${match[1]}\n${attrs.map((attribute) => `${indent}  ${attribute}`).join('\n')}\n${indent}>`;
  };

  const formatHtml = (source = '') => {
    let input = String(source).trim();
    if (!input) return '';
    const preserved = [];
    input = input.replace(/<(pre|script|style|textarea)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi, (whole, name, attributes, inner) => {
      const content = name.toLowerCase() === 'style' ? formatCss(inner) : inner;
      const block = `<${name}${attributes}>${content ? `\n${content}\n` : ''}</${name}>`;
      const token = `__COURSE_RAW_BLOCK_${preserved.length}__`;
      preserved.push([token, block]);
      return `\n${token}\n`;
    });

    const lines = [];
    let current = '';
    let depth = 0;
    const indent = () => '  '.repeat(Math.max(0, depth));
    const flush = () => {
      const value = current.trim();
      if (value) lines.push(`${indent()}${value}`);
      current = '';
    };

    for (const token of tokenizeHtml(input)) {
      if (token.type === 'text') {
        if (/^__COURSE_RAW_BLOCK_\d+__$/.test(token.value.trim())) {
          flush();
          lines.push(`${indent()}${token.value.trim()}`);
          continue;
        }
        if (!token.value.trim()) {
          if (current && !current.endsWith(' ')) current += ' ';
          continue;
        }
        const text = token.value.replace(/\s+/g, ' ');
        if (/^\s/.test(token.value) && current && !current.endsWith(' ')) current += ' ';
        current += text.trim();
        if (/\s$/.test(token.value) && !current.endsWith(' ')) current += ' ';
        continue;
      }
      if (token.type === 'special') {
        flush();
        lines.push(`${indent()}${token.value.trim()}`);
        continue;
      }
      const isBlock = blockTags.has(token.name);
      if (isBlock) {
        flush();
        if (token.closing) depth = Math.max(0, depth - 1);
        const leading = indent();
        lines.push(`${leading}${token.closing ? token.value.trim() : formatOpeningTag(token, leading)}`);
        if (!token.closing && !token.selfClosing && !voidTags.has(token.name)) depth += 1;
      } else {
        current += token.value.trim();
      }
    }
    flush();
    let result = lines.join('\n').replace(/\n{3,}/g, '\n\n');
    for (const [token, block] of preserved) result = result.replace(token, block);
    return result.trim();
  };

  const formatCodeBlocks = (scope = document) => {
    scope.querySelectorAll('pre code').forEach((node) => {
      if (node.closest('.v3-code-source')) return;
      const source = node.textContent || '';
      const trimmed = source.trim();
      if (/^(?:<!doctype|<\/?[a-z][\s\S]*>)/i.test(trimmed)) node.textContent = formatHtml(source);
      else if (/\{[\s\S]*[:;]/.test(trimmed)) node.textContent = formatCss(source);
    });
  };

  window.courseCodeFormat = { html: formatHtml, css: formatCss, blocks: formatCodeBlocks };
})();
