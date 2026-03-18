import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

// Markdown 渲染器：负责问答消息中的 Markdown + 代码高亮
// 配置语法高亮（marked v9 兼容方式）
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
);

marked.use({ breaks: true, gfm: true });

/**
 * 将 Markdown 文本渲染为安全的 HTML 字符串
 * @param {string} text
 * @returns {string}
 */
export function renderMarkdown(text) {
  if (!text) return "";
  return marked.parse(text);
}
