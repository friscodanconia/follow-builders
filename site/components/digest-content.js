function InlineTokens({ tokens }) {
  return tokens.map((token, index) => {
    const key = `${token.type}-${index}`;

    if (token.type === 'text') {
      return <span key={key}>{token.value}</span>;
    }

    if (token.type === 'strong') {
      return <strong key={key} className="font-semibold text-slate-100"><InlineTokens tokens={token.children} /></strong>;
    }

    if (token.type === 'emphasis') {
      return <em key={key}><InlineTokens tokens={token.children} /></em>;
    }

    if (token.type === 'link') {
      return (
        <a
          key={key}
          href={token.url}
          className="text-amber-300 underline decoration-amber-500/50 underline-offset-2 hover:text-amber-200"
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
    <div className="space-y-5 text-[15px] leading-7 text-slate-300">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === 'heading') {
          if (block.level === 1) {
            return <h1 key={key} className="mt-10 text-2xl font-semibold tracking-tight text-white"><InlineTokens tokens={block.content} /></h1>;
          }

          if (block.level === 2) {
            return <h2 key={key} className="mt-10 text-xl font-semibold tracking-tight text-white"><InlineTokens tokens={block.content} /></h2>;
          }

          return <h3 key={key} className="mt-8 text-lg font-semibold text-slate-100"><InlineTokens tokens={block.content} /></h3>;
        }

        if (block.type === 'hr') {
          return <hr key={key} className="my-10 border-slate-800" />;
        }

        if (block.type === 'list') {
          return (
            <ul key={key} className="ml-5 list-disc space-y-2 marker:text-amber-400">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-item-${itemIndex}`}><InlineTokens tokens={item} /></li>
              ))}
            </ul>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={key} className="text-slate-300">
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
