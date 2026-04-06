function InlineTokens({ tokens }) {
  return tokens.map((token, index) => {
    const key = `${token.type}-${index}`;

    if (token.type === 'text') {
      return <span key={key}>{token.value}</span>;
    }

    if (token.type === 'strong') {
      return <strong key={key} className="font-semibold text-[var(--color-ink)]"><InlineTokens tokens={token.children} /></strong>;
    }

    if (token.type === 'emphasis') {
      return <em key={key}><InlineTokens tokens={token.children} /></em>;
    }

    if (token.type === 'link') {
      return (
        <a
          key={key}
          href={token.url}
          className="text-[var(--color-accent)] underline decoration-[rgba(248,185,73,0.45)] underline-offset-4 hover:text-[#ffd48d]"
          target="_blank"
          rel="noopener noreferrer"
        >
          {token.text}
        </a>
      );
    }

    return null;
  });
}

export function DigestContent({ blocks }) {
  return (
    <div className="digest-prose space-y-5 text-[15px] leading-7 text-[var(--color-ink-soft)] sm:text-base sm:leading-8">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === 'heading') {
          if (block.level === 1) {
            return <h1 key={key} className="mt-10 font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl"><InlineTokens tokens={block.content} /></h1>;
          }

          if (block.level === 2) {
            return <h2 key={key} className="mt-10 border-t border-[rgba(255,255,255,0.08)] pt-6 text-lg font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)] sm:text-xl"><InlineTokens tokens={block.content} /></h2>;
          }

          return <h3 key={key} className="mt-8 text-lg font-semibold text-[var(--color-ink)] sm:text-xl"><InlineTokens tokens={block.content} /></h3>;
        }

        if (block.type === 'hr') {
          return <hr key={key} className="my-10 border-[rgba(255,255,255,0.08)]" />;
        }

        if (block.type === 'list') {
          return (
            <ul key={key} className="ml-5 list-disc space-y-3 marker:text-[var(--color-accent)]">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-item-${itemIndex}`}><InlineTokens tokens={item} /></li>
              ))}
            </ul>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={key} className="text-[var(--color-ink-soft)]">
              {block.lines.map((line, lineIndex) => (
                <span key={`${key}-line-${lineIndex}`}>
                  {lineIndex > 0 ? <br /> : null}
                  <InlineTokens tokens={line} />
                </span>
              ))}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
