// Comprehensive LeetCode / VS Code Dark+ Syntax Tokenizer
export function highlightCodeToHtml(code, language = "javascript") {
  if (!code) return "";

  // Escape raw HTML entities
  const escapeHtml = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  // Regex rules ordered by precedence
  const patterns = [
    // 1. Comments (Line and block)
    { type: "comment", regex: /^(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#(?!include)[^\n]*)/ },
    // 2. Strings (Double, single, template literals)
    { type: "string", regex: /^("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/ },
    // 3. Keywords
    {
      type: "keyword",
      regex: /^(class|function|const|let|var|return|if|else|for|while|import|export|from|new|typeof|instanceof|async|await|try|catch|finally|throw|def|self|in|and|or|not|elif|is|lambda|None|True|False|public|private|protected|interface|type|extends|implements|static)\b/,
    },
    // 4. Builtin Types
    {
      type: "type",
      regex: /^(Map|Set|Array|Object|String|Number|Boolean|Promise|vector|int|string|bool|void|list|dict|tuple|Record|Solution)\b/,
    },
    // 5. Numbers
    { type: "number", regex: /^\b\d+(?:\.\d+)?\b/ },
    // 6. Function calls (identifier followed by open parenthesis)
    { type: "function", regex: /^([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/ },
    // 7. Brackets
    { type: "bracket-1", regex: /^([{}])/ },
    { type: "bracket-2", regex: /^([()])/ },
    { type: "bracket-3", regex: /^([[\]])/ },
    // 8. Operators and Punctuation
    { type: "operator", regex: /^(=>|===|!==|==|!=|<=|>=|&&|\|\||[=+\-*/<>!&|^?:;,.])/ },
    // 9. Identifiers / Variables
    { type: "variable", regex: /^[a-zA-Z_$][a-zA-Z0-9_$]*/ },
    // 10. Whitespace and newlines
    { type: "whitespace", regex: /^\s+/ },
    // 11. Fallback any character
    { type: "text", regex: /^./ },
  ];

  let remaining = code;
  let html = "";

  while (remaining.length > 0) {
    let matched = false;

    for (const { type, regex } of patterns) {
      const match = remaining.match(regex);
      if (match) {
        const text = match[0];
        const escaped = escapeHtml(text);

        if (type === "whitespace" || type === "text") {
          html += escaped;
        } else {
          html += `<span class="tok-${type}">${escaped}</span>`;
        }

        remaining = remaining.slice(text.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      html += escapeHtml(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return html;
}
