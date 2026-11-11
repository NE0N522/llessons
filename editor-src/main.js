import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentLess, indentMore, insertNewlineAndIndent, isolateHistory, toggleComment } from '@codemirror/commands';
import { acceptCompletion, autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap, completionStatus } from '@codemirror/autocomplete';
import { bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting, HighlightStyle, syntaxTree } from '@codemirror/language';
import { linter } from '@codemirror/lint';
import { html, htmlCompletionSource as baseHtmlCompletionSource } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { tags } from '@lezer/highlight';
import { abbreviationTracker, emmetConfig, expandAbbreviation } from '@emmetio/codemirror6-plugin';
import cssProperties from './css-properties.json';

const propertySet = new Set(cssProperties);
const fontCompartment = new Compartment();
const themeCompartment = new Compartment();
const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const cssValues = ['block', 'inline', 'inline-block', 'flex', 'grid', 'none', 'relative', 'absolute', 'fixed', 'sticky', 'static', 'auto', 'inherit', 'initial', 'unset', 'transparent', 'currentColor', 'center', 'start', 'end', 'space-between', 'space-around', 'space-evenly', 'column', 'row', 'wrap', 'nowrap', 'cover', 'contain', 'solid', 'dashed', 'pointer', 'hidden', 'visible', 'scroll', 'bold', 'normal', 'uppercase', 'underline', 'red', 'blue', 'black', 'white', 'gray', 'grey', 'navy', 'green', 'orange', 'purple', 'tomato', 'rebeccapurple', '0', '1rem', '1em', '16px', '24px', '100%', '100vh', '100vw'];
const booleanHtmlAttributes = new Set(['allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls', 'default', 'defer', 'disabled', 'formnovalidate', 'hidden', 'inert', 'ismap', 'itemscope', 'loop', 'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'playsinline', 'readonly', 'required', 'reversed', 'selected']);
const extraHtmlAttributes = ['aria-label', 'aria-hidden', 'aria-expanded', 'aria-live', 'aria-describedby', 'aria-labelledby', 'data-id', 'data-state', 'data-testid'];

const themeStyles = {
  '&': { color: 'var(--v3-ink, #20283a)', backgroundColor: 'var(--v3-paper, #fff)', border: '1px solid var(--v3-line, #dfe4ec)', borderRadius: '10px', fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace' },
  '&.cm-focused': { outline: '3px solid var(--account-accent-ring, color-mix(in srgb, var(--v3-blue, #3f5ea8) 35%, transparent))', outlineOffset: '2px' },
  '.cm-scroller': { overflow: 'auto', fontFamily: 'inherit' },
  '.cm-content': { caretColor: 'var(--v3-blue, #3f5ea8)', padding: '11px 0', minHeight: 'inherit' },
  '.cm-line': { padding: '0 12px' },
  '.cm-gutters': { color: 'var(--v3-muted, #5e6879)', backgroundColor: 'var(--v3-paper, #fff)', borderRight: '1px solid var(--v3-line, #dfe4ec)' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--v3-blue, #3f5ea8) 7%, transparent)' },
  '.cm-activeLineGutter': { color: 'var(--v3-blue-dark, #2d467f)', backgroundColor: 'color-mix(in srgb, var(--v3-blue, #3f5ea8) 9%, transparent)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: 'color-mix(in srgb, var(--v3-blue, #3f5ea8) 30%, transparent)' },
  '.cm-tooltip': { color: 'var(--v3-ink, #20283a)', backgroundColor: 'var(--v3-paper, #fff)', border: '1px solid var(--v3-line, #dfe4ec)', borderRadius: '8px', boxShadow: '0 8px 24px rgb(20 30 50 / 16%)' },
  '.cm-tooltip-autocomplete ul li[aria-selected]': { color: 'var(--v3-ink, #20283a)', backgroundColor: 'var(--v3-blue-soft, #edf2ff)' },
  '.cm-completionDetail': { color: 'var(--v3-muted, #5e6879)' },
  '.cm-lintRange-error': { textDecoration: 'underline wavy color-mix(in srgb, #b65b45 65%, var(--v3-paper, white))', textUnderlineOffset: '3px' },
  '.cm-lintRange-warning': { textDecoration: 'underline wavy #b08a45', textUnderlineOffset: '3px' },
};
const themeExtension = () => {
  const dark = document.documentElement.dataset.theme === 'dark';
  return EditorView.theme({
    ...themeStyles,
    '&': { ...themeStyles['&'], '--editor-ink': dark ? '#e9eef8' : '#20283a', '--editor-tag': dark ? '#ff9aa2' : '#9b3434', '--editor-property': dark ? '#c6a6ed' : '#73509b', '--editor-string': dark ? '#92d6b0' : '#24724e', '--editor-keyword': dark ? '#a7bdff' : '#365eaa', '--editor-comment': dark ? '#a0aec4' : '#768296', '--editor-number': dark ? '#f1bc86' : '#a15c25' },
  }, { dark });
};

const tokenStyles = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.tagName, color: 'var(--editor-tag, #9b3434)' },
  { tag: [tags.attributeName, tags.propertyName], color: 'var(--editor-property, #73509b)' },
  { tag: [tags.string, tags.attributeValue], color: 'var(--editor-string, #24724e)' },
  { tag: [tags.keyword, tags.typeName], color: 'var(--editor-keyword, #365eaa)' },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: 'var(--editor-comment, #768296)', fontStyle: 'italic' },
  { tag: [tags.number, tags.bool, tags.null], color: 'var(--editor-number, #a15c25)' },
  { tag: [tags.operator, tags.punctuation], color: 'var(--editor-ink, #20283a)' },
]));

const completionSource = (context) => {
  const before = context.matchBefore(/[\w-]*/);
  if (!before || !before.text && !context.explicit) return null;
  const lineStart = context.state.doc.lineAt(context.pos).from;
  const lineBefore = context.state.doc.sliceString(lineStart, context.pos);
  const inValue = /:\s*[\w-]*$/.test(lineBefore);
  const options = (inValue ? cssValues : cssProperties).map((label) => ({
    label,
    type: inValue ? 'keyword' : 'property',
    detail: inValue ? 'значение CSS' : 'свойство CSS',
    ...(inValue ? {} : {
      apply(view, completion, from, to) {
        const insert = `${completion.label}: `;
        view.dispatch({ changes: { from, to, insert }, selection: { anchor: from + insert.length } });
      },
    }),
  }));
  return { from: before.from, options };
};

function htmlAttributeCompletionSource(context) {
  const result = baseHtmlCompletionSource(context);
  if (!result) return null;
  const nodeName = syntaxTree(context.state).resolveInner(context.pos, -1).name;
  if (!['AttributeName', 'OpenTag', 'SelfClosingTag'].includes(nodeName)) return result;

  const options = [...result.options];
  const known = new Set(options.map((option) => option.label));
  for (const label of extraHtmlAttributes) {
    if (!known.has(label)) options.push({ label, type: 'property' });
  }
  return {
    ...result,
    options: options.map((option) => {
      if (option.apply || booleanHtmlAttributes.has(option.label.toLowerCase())) return option;
      return {
        ...option,
        detail: 'атрибут HTML · значение в кавычках',
        apply(view, completion, from, to) {
          const insert = `${completion.label}=""`;
          view.dispatch({ changes: { from, to, insert }, selection: { anchor: from + completion.label.length + 2 } });
        },
      };
    }),
  };
}

function htmlDiagnostics(view) {
  const text = view.state.doc.toString();
  const diagnostics = [];
  const stack = [];
  const token = /<!--[\s\S]*?-->|<![^>]*>|<\/?([a-z][a-z0-9:-]*)\b([^>]*)>/gi;
  for (const match of text.matchAll(token)) {
    if (!match[1]) continue;
    const name = match[1].toLowerCase();
    const raw = match[0];
    const from = match.index;
    const to = from + raw.length;
    if (/^<\//.test(raw)) {
      const top = stack[stack.length - 1];
      if (!top || top.name !== name) {
        diagnostics.push({ from, to, severity: 'error', message: top ? `Ожидался закрывающий тег </${top.name}>.` : `Для тега <${name}> нет открывающего тега.` });
        const openIndex = stack.map((item) => item.name).lastIndexOf(name);
        if (openIndex >= 0) stack.splice(openIndex);
      } else stack.pop();
      continue;
    }
    if (name === 'img' && !/\balt\s*=/i.test(match[2] || '')) diagnostics.push({ from, to, severity: 'warning', message: 'Добавь атрибут alt с описанием изображения.' });
    if (!voidElements.has(name) && !/\/\s*>$/.test(raw)) stack.push({ name, from, to });
  }
  for (const item of stack) diagnostics.push({ from: item.from, to: item.to, severity: 'error', message: `Тег <${item.name}> не закрыт.` });
  return diagnostics;
}

function cssDiagnostics(view) {
  const diagnostics = [];
  const tree = syntaxTree(view.state);
  tree.iterate({ enter(node) {
    if (node.name !== 'PropertyName') return;
    const property = view.state.doc.sliceString(node.from, node.to).trim().toLowerCase();
    if (!property || property.startsWith('--') || property.startsWith('-') || propertySet.has(property)) return;
    diagnostics.push({ from: node.from, to: node.to, severity: 'warning', message: `Похоже, свойства «${property}» нет в справочнике. Проверь написание.` });
  } });
  return diagnostics;
}

function diagnosticsFor(language, view) {
  return language === 'html' ? htmlDiagnostics(view) : cssDiagnostics(view);
}

function exitHint(view, callback) {
  view.dom.dataset.exitTabArmed = 'true';
  callback?.('Нажми Tab, чтобы перейти к следующему элементу страницы.');
  window.setTimeout(() => { delete view.dom.dataset.exitTabArmed; }, 1800);
  return true;
}

function expandCssShortcut(view) {
  const selection = view.state.selection.main;
  if (!selection.empty) return false;
  const line = view.state.doc.lineAt(selection.head);
  const local = selection.head - line.from;
  const match = line.text.match(/^(\s*)(df|m(\d+))$/i);
  if (!match || local !== line.text.length) return false;
  const expansion = match[2].toLowerCase() === 'df' ? 'display: flex;' : `margin: ${match[3]}px;`;
  const replacement = `${match[1]}${expansion}`;
  view.dispatch({ changes: { from: line.from, to: line.to, insert: replacement }, selection: { anchor: line.from + replacement.length }, annotations: isolateHistory.of('full') });
  return true;
}

function tabCommand(view, hints, exitTab, language) {
  if (exitTab.armed) {
    exitTab.armed = false;
    return false;
  }
  if (hints && completionStatus(view.state) === 'active' && acceptCompletion(view)) return true;
  if (hints && language === 'css' && expandCssShortcut(view)) return true;
  if (hints && expandAbbreviation(view)) return true;
  return indentMore(view);
}

function expandEmptyPair(view) {
  const selection = view.state.selection.main;
  if (!selection.empty) return false;
  const line = view.state.doc.lineAt(selection.head);
  const local = selection.head - line.from;
  const before = line.text.slice(0, local);
  const after = line.text.slice(local);
  const open = before.match(/^(\s*)<([a-z][\w:-]*)(?:\s[^<>]*)?>$/i);
  const close = after.match(/^<\/([a-z][\w:-]*)\s*>\s*$/i);
  if (!open || !close || open[2].toLowerCase() !== close[1].toLowerCase()) return false;
  const base = open[1];
  const unit = view.state.facet(EditorState.tabSize) === 2 ? '  ' : '\t';
  const middle = `\n${base}${unit}\n${base}`;
  view.dispatch({ changes: { from: selection.head, to: selection.head, insert: middle }, selection: { anchor: selection.head + 1 + base.length + unit.length } });
  return true;
}

function sizeTheme(size) { return EditorView.theme({ '&': { fontSize: `${size}px` }, '.cm-scroller': { fontSize: 'inherit' } }); }
function makeEditor(container, options = {}) {
  const language = options.language === 'css' ? 'css' : 'html';
  let hints = options.hints !== false;
  let fontSize = Math.max(12, Math.min(24, Number(options.fontSize) || 15));
  let callback = options.onChange;
  const exitTab = { armed: false };
  let silent = false;
  const codeLanguage = () => language === 'html' ? html({ autoCloseTags: hints }) : css();
  const hintExtensions = () => hints ? [
    closeBrackets(),
    autocompletion({ override: [language === 'css' ? completionSource : htmlAttributeCompletionSource], activateOnTyping: true, activateOnTypingDelay: 80 }),
    abbreviationTracker(),
    emmetConfig.of({ syntax: language }),
    linter((view) => diagnosticsFor(language, view), { delay: 300 }),
  ] : [];
  const state = EditorState.create({
    doc: String(options.value || ''),
    extensions: [
      lineNumbers(), highlightActiveLineGutter(), highlightActiveLine(), drawSelection(),
      history(), codeLanguage(), indentOnInput(), bracketMatching(), syntaxHighlighting(defaultHighlightStyle, { fallback: true }), tokenStyles, ...hintExtensions(),
      EditorState.tabSize.of(2), EditorState.readOnly.of(Boolean(options.readOnly)), EditorView.editable.of(!options.readOnly),
      themeCompartment.of(themeExtension()), fontCompartment.of(sizeTheme(fontSize)),
      EditorView.contentAttributes.of({ 'aria-label': options.ariaLabel || `Редактор ${language.toUpperCase()}`, spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off' }),
      ...(options.readOnly ? [] : [keymap.of([
        { key: 'Mod-/', run: toggleComment },
        { key: 'Enter', run: (view) => hints && completionStatus(view.state) === 'active' && acceptCompletion(view) || hints && expandEmptyPair(view) || insertNewlineAndIndent(view) },
        { key: 'Escape', run: (view) => { exitTab.armed = true; window.setTimeout(() => { exitTab.armed = false; }, 1800); return exitHint(view, options.onStatus); } },
        { key: 'Tab', run: (view) => tabCommand(view, hints, exitTab, language) },
        { key: 'Shift-Tab', run: indentLess },
      ]), ...(hints ? [keymap.of(completionKeymap), keymap.of(closeBracketsKeymap)] : []), keymap.of(defaultKeymap), keymap.of(historyKeymap)]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !silent) callback?.(update.state.doc.toString());
      }),
    ]
  });
  const view = new EditorView({ state, parent: container });
  const themeObserver = new MutationObserver(() => view.dispatch({ effects: themeCompartment.reconfigure(themeExtension()) }));
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return {
    getValue: () => view.state.doc.toString(),
    setValue(value, config = {}) {
      const next = String(value ?? '');
      silent = config.silent === true;
      if (next !== view.state.doc.toString()) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
      silent = false;
    },
    focus: () => view.focus(),
    refresh: () => view.requestMeasure(),
    format() {
      const formatter = window.courseCodeFormat?.[language];
      if (!formatter) return false;
      const formatted = formatter(view.state.doc.toString());
      if (formatted !== view.state.doc.toString()) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: formatted }, annotations: isolateHistory.of('full') });
      return true;
    },
    setFontSize(value) {
      fontSize = Math.max(12, Math.min(24, Number(value) || 15));
      view.dispatch({ effects: fontCompartment.reconfigure(sizeTheme(fontSize)) });
      return fontSize;
    },
    destroy() { themeObserver.disconnect(); view.destroy(); },
    view,
  };
}

window.CourseCodeEditor = { createEditor: makeEditor, clampFontSize: (size) => Math.max(12, Math.min(24, Number(size) || 15)) };
