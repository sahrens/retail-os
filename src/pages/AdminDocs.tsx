import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { useStore } from '@/lib/store';
import * as api from '@/lib/api';
import shopConfig from '@/shop.config';

export default function AdminDocs() {
  const user = useStore(s => s.user);
  const [docList, setDocList] = useState<Array<{ slug: string; title: string }>>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.docs.list().then(res => {
      setDocList(res.docs);
      if (res.docs.length > 0) setSelected(res.docs[0].slug);
    }).catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setContent(null);
    api.docs.get(selected).then(res => setContent(res.content)).catch(err => setError(err.message));
  }, [selected]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p style={{ color: shopConfig.colors.muted }}>Admin access required.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (docList.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p style={{ color: shopConfig.colors.muted }}>No documents available.</p>
      </div>
    );
  }

  const rendered = content ? marked.parse(content, { async: false }) as string : '';

  return (
    <div className="flex-1 min-h-0 overflow-y-auto" style={{ background: shopConfig.colors.bg }}>
      <div className="max-w-3xl mx-auto px-4 py-6 pb-16">
        {/* Doc selector */}
        {docList.length > 1 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {docList.map(doc => (
              <button
                key={doc.slug}
                onClick={() => setSelected(doc.slug)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
                style={{
                  background: selected === doc.slug ? shopConfig.colors.primary : 'transparent',
                  color: selected === doc.slug ? '#fff' : shopConfig.colors.text,
                  borderColor: selected === doc.slug ? shopConfig.colors.primary : `${shopConfig.colors.muted}44`,
                }}
              >
                {doc.title}
              </button>
            ))}
          </div>
        )}

        {/* Markdown content */}
        {content ? (
          <article
            className="doc-content"
            dangerouslySetInnerHTML={{
              __html: rendered
                .replace(/<table>/g, '<div class="table-scroll"><table>')
                .replace(/<\/table>/g, '</table></div>')
            }}
          />
        ) : (
          <p style={{ color: shopConfig.colors.muted }} className="text-center">Loading...</p>
        )}
      </div>
      <style>{`
        .doc-content { color: ${shopConfig.colors.text}; line-height: 1.7; font-size: 0.9rem; }
        .doc-content h1 { font-size: 1.5rem; font-weight: 700; color: ${shopConfig.colors.primary}; margin: 0 0 1rem 0; padding-bottom: 0.5rem; border-bottom: 1px solid ${shopConfig.colors.muted}22; }
        .doc-content h2 { font-size: 1.2rem; font-weight: 600; color: ${shopConfig.colors.primary}; margin: 2rem 0 0.75rem 0; }
        .doc-content h3 { font-size: 1.05rem; font-weight: 500; color: ${shopConfig.colors.text}; margin: 1.5rem 0 0.5rem 0; }
        .doc-content p { margin: 0.75rem 0; }
        .doc-content strong { color: ${shopConfig.colors.text}; }
        .doc-content hr { border: none; border-top: 1px solid ${shopConfig.colors.muted}22; margin: 2rem 0; }
        .doc-content ul { margin: 0.75rem 0; padding-left: 1.5rem; }
        .doc-content li { margin: 0.35rem 0; }
        .doc-content li::marker { color: ${shopConfig.colors.muted}; }
        .doc-content .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 1rem 0; border: 1px solid ${shopConfig.colors.muted}33; border-radius: 6px; }
        .doc-content table { border-collapse: collapse; font-size: 0.8rem; width: 100%; min-width: max-content; }
        .doc-content tr { border-bottom: 1px solid ${shopConfig.colors.muted}22; }
        .doc-content tr:last-child { border-bottom: none; }
        .doc-content th { padding: 0.5rem 0.75rem; text-align: left; font-weight: 600; color: ${shopConfig.colors.text}; background: ${shopConfig.colors.muted}0a; border-bottom: 2px solid ${shopConfig.colors.muted}33; white-space: nowrap; }
        .doc-content td { padding: 0.5rem 0.75rem; color: ${shopConfig.colors.text}; }
        .doc-content tr:hover td { background: ${shopConfig.colors.muted}08; }
        .doc-content code { background: ${shopConfig.colors.muted}15; padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.8rem; }
        @media (max-width: 640px) {
          .doc-content { font-size: 0.85rem; }
          .doc-content h1 { font-size: 1.3rem; }
          .doc-content h2 { font-size: 1.1rem; }
          .doc-content table { font-size: 0.75rem; }
          .doc-content th, .doc-content td { padding: 0.4rem 0.5rem; }
        }
      `}</style>
    </div>
  );
}
