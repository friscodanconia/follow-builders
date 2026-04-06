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
          className="font-medium text-[var(--color-accent)] underline decoration-[var(--color-accent)]/30 underline-offset-3 hover:text-[var(--color-accent-warm)]"
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
    <div className="digest-prose space-y-5 text-base leading-7 text-[var(--color-ink-secondary)]">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === 'heading') {
          if (block.level === 1) {
            return <h1 key={key} className="mt-8 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl"><InlineTokens tokens={block.content} /></h1>;
          }

          if (block.level === 2) {
            return <h2 key={key} className="mt-8 border-t border-[var(--color-border-light)] pt-6 font-display text-xl font-bold text-[var(--color-ink)]"><InlineTokens tokens={block.content} /></h2>;
          }

          return <h3 key={key} className="mt-6 text-lg font-semibold text-[var(--color-ink)]"><InlineTokens tokens={block.content} /></h3>;
        }

        if (block.type === 'hr') {
          return <hr key={key} className="my-8 border-[var(--color-border-light)]" />;
        }

        if (block.type === 'list') {
          return (
            <ul key={key} className="ml-5 list-disc space-y-2 marker:text-[var(--color-accent)]">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-item-${itemIndex}`}><InlineTokens tokens={item} /></li>
              ))}
            </ul>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={key}>
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
