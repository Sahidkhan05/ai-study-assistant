import ReactMarkdown from "react-markdown";

const jsKeywords = new Set([
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "default",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "import",
  "let",
  "new",
  "null",
  "return",
  "switch",
  "throw",
  "true",
  "try",
  "undefined",
  "while",
]);

function highlightCode(code) {
  const pattern =
    /(\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g;

  return code.split(pattern).map((part, index) => {
    if (!part) {
      return null;
    }

    if (part.startsWith("//") || part.startsWith("/*")) {
      return (
        <span key={index} className="text-slate-500">
          {part}
        </span>
      );
    }

    if (
      part.startsWith('"') ||
      part.startsWith("'") ||
      part.startsWith("`")
    ) {
      return (
        <span key={index} className="text-emerald-300">
          {part}
        </span>
      );
    }

    if (/^\d/.test(part)) {
      return (
        <span key={index} className="text-orange-300">
          {part}
        </span>
      );
    }

    if (jsKeywords.has(part)) {
      return (
        <span key={index} className="text-sky-300">
          {part}
        </span>
      );
    }

    return part;
  });
}

function CodeBlock({ language, code }) {
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {language || "code"}
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6">
        <code>{highlightCode(code)}</code>
      </pre>
    </div>
  );
}

function MarkdownTable({ lines }) {
  const rows = lines
    .filter((line, index) => index !== 1)
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim())
    );

  const headers = rows[0] || [];
  const bodyRows = rows.slice(1);

  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-96 border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-900">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="border-b border-slate-200 px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-slate-100">
              {headers.map((header, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3">
                  {row[cellIndex] || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarkdownText({ text }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="mb-3 mt-4 text-2xl font-bold text-slate-950">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 mt-4 text-xl font-bold text-slate-950">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-3 text-lg font-bold text-slate-950">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="my-2 leading-7 text-slate-700">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="my-3 list-disc space-y-1 pl-5 text-slate-700">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="my-3 list-decimal space-y-1 pl-5 text-slate-700">
            {children}
          </ol>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-l-4 border-blue-300 bg-blue-50 px-4 py-2 text-slate-700">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-sm font-semibold text-blue-700">
            {children}
          </code>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            className="font-semibold text-blue-600 underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {children}
          </a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

function renderMarkdownParts(text) {
  const parts = [];
  const codePattern = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codePattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "markdown", value: text.slice(lastIndex, match.index) });
    }

    parts.push({
      type: "code",
      language: match[1] || "text",
      value: match[2].trimEnd(),
    });

    lastIndex = codePattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "markdown", value: text.slice(lastIndex) });
  }

  return parts;
}

function renderTextAndTables(text) {
  const lines = text.split("\n");
  const parts = [];
  let buffer = [];
  let index = 0;

  while (index < lines.length) {
    const currentLine = lines[index];
    const nextLine = lines[index + 1] || "";
    const startsTable =
      currentLine.includes("|") && /^\s*\|?\s*:?-{3,}:?\s*\|/.test(nextLine);

    if (startsTable) {
      if (buffer.length > 0) {
        parts.push({ type: "markdown", value: buffer.join("\n") });
        buffer = [];
      }

      const tableLines = [currentLine, nextLine];
      index += 2;

      while (index < lines.length && lines[index].includes("|")) {
        tableLines.push(lines[index]);
        index += 1;
      }

      parts.push({ type: "table", lines: tableLines });
      continue;
    }

    buffer.push(currentLine);
    index += 1;
  }

  if (buffer.length > 0) {
    parts.push({ type: "markdown", value: buffer.join("\n") });
  }

  return parts;
}

export default function MarkdownMessage({ text }) {
  return (
    <div className="max-w-none text-sm sm:text-base">
      {renderMarkdownParts(text).map((part, index) => {
        if (part.type === "code") {
          return (
            <CodeBlock
              key={index}
              language={part.language}
              code={part.value}
            />
          );
        }

        return renderTextAndTables(part.value).map((item, itemIndex) => {
          const key = `${index}-${itemIndex}`;

          if (item.type === "table") {
            return <MarkdownTable key={key} lines={item.lines} />;
          }

          return <MarkdownText key={key} text={item.value} />;
        });
      })}
    </div>
  );
}
