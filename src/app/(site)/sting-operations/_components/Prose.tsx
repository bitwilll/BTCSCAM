import type { ReactNode } from "react";

/** Render inline **bold** spans within a run of text. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

/**
 * Minimal, dependency-free markdown renderer for operation bodies.
 * Supports paragraphs, `##`/`###` headings, `-`/`*` bullet lists and **bold**.
 * Output is styled by the shared `.prose-bs` broadsheet prose rules.
 */
export function Prose({ body }: { body: string }) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      const text = para.join(" ");
      blocks.push(<p key={`p-${key++}`}>{inline(text, `p${key}`)}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      const items = list;
      blocks.push(
        <ul key={`ul-${key++}`}>
          {items.map((item, i) => (
            <li key={i}>{inline(item, `li${key}-${i}`)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushPara();
      flushList();
      blocks.push(<h3 key={`h-${key++}`}>{inline(line.slice(4), `h${key}`)}</h3>);
      continue;
    }
    if (line.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push(<h2 key={`h-${key++}`}>{inline(line.slice(3), `h${key}`)}</h2>);
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushPara();
      list.push(line.slice(2));
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();

  return <div className="prose-bs">{blocks}</div>;
}
