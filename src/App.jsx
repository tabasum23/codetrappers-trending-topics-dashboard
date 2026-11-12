
import React, { useEffect, useMemo, useState } from 'react';
import { db, configured } from './supabase';
import {
  Search,
  RefreshCw,
  ExternalLink,
  Check,
  Sparkles,
  Bot,
  Globe,
  Smartphone
} from 'lucide-react';

const demo = [
  [
    'Agentic AI: Autonomous Business Workflows',
    'AI',
    'How AI agents plan, use tools and complete multi-step business tasks.',
    'OpenAI',
    'https://openai.com/news/',
    95
  ],
  [
    'AI Coding Agents and Software Development',
    'AI',
    'How coding agents are changing developer workflows.',
    'GitHub Blog',
    'https://github.blog/',
    91
  ],
  [
    'Modern React Ecosystem Updates',
    'Web Development',
    'Recent developments in the React and frontend ecosystem.',
    'React',
    'https://react.dev/blog',
    87
  ],
  [
    'AI-Powered Tools for Web Developers',
    'Web Development',
    'How AI tools are changing website development workflows.',
    'Google Developers',
    'https://developers.googleblog.com/',
    84
  ],
  [
    'Flutter Cross-Platform App Trends',
    'App Development',
    'New patterns for building cross-platform mobile apps.',
    'Flutter',
    'https://blog.flutter.dev/',
    82
  ],
  [
    'On-Device AI for Mobile Applications',
    'App Development',
    'Running AI capabilities directly on mobile devices.',
    'Android Developers',
    'https://developer.android.com/blog',
    79
  ]
].map((x, i) => ({
  id: `demo${i}`,
  title: x[0],
  category: x[1],
  summary: x[2],
  source_name: x[3],
  source_url: x[4],
  relevance_score: x[5],
  status: 'new',
  published_at: new Date().toISOString()
}));

export default function App() {
  const [topics, setTopics] = useState(demo);
  const [cat, setCat] = useState('All');
  const [tab, setTab] = useState('All topics');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  // Load topics from Supabase
  const load = async () => {
    if (!db) return;

    const { data, error } = await db
      .from('trending_topics')
      .select('*')
      .order('relevance_score', { ascending: false })
      .limit(200);

    if (error) {
      setMsg(`Database error: ${error.message}`);
      return;
    }

    setTopics(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  // Search and filter topics
  const rows = useMemo(() => {
    return topics.filter(x => {
      const categoryMatch =
        cat === 'All' || x.category === cat;

      const tabMatch =
        tab === 'All topics' ||
        x.status === tab.toLowerCase();

      const searchMatch =
        `${x.title} ${x.summary} ${x.source_name}`
          .toLowerCase()
          .includes(q.toLowerCase());

      return categoryMatch && tabMatch && searchMatch;
    });
  }, [topics, cat, tab, q]);

  const final = topics.find(x => x.status === 'finalized');

  // Update topic status
  async function status(topic, newStatus) {
    if (!db || String(topic.id).startsWith('demo')) {
      setMsg('This is a sample topic. Please use a topic loaded from Supabase.');
      return;
    }

    setBusy(true);
    setMsg('');

    try {
      // Move the previous finalized topic to shortlisted
      if (newStatus === 'finalized') {
        const { error: previousError } = await db
          .from('trending_topics')
          .update({ status: 'shortlisted' })
          .eq('status', 'finalized');

        if (previousError) throw previousError;
      }

      // Update selected topic
      const { error } = await db
        .from('trending_topics')
        .update({ status: newStatus })
        .eq('id', topic.id);

      if (error) throw error;

      setMsg(`Topic successfully ${newStatus}.`);

      await load();

    } catch (error) {
      setMsg(`Update failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  // Collect latest topics
  async function collect() {
    if (!db) {
      setMsg('Please configure your Supabase credentials first.');
      return;
    }

    setBusy(true);
    setMsg('');

    try {
      const { data, error } = await db.functions.invoke(
        'collect-trending-topics',
        { body: {} }
      );

      if (error) throw error;

      setMsg(
        `Collection complete: ${data?.inserted || 0} new topics.`
      );

      await load();

    } catch (error) {
      setMsg(`Collection failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app">

      <header>
        <div className="logo">
          <b>[<i>&gt;&lt;</i>]</b>
          <strong>
            Code<span>Trappers</span>
          </strong>
        </div>

        <label className={configured ? 'online' : ''}>
          {configured
            ? '● Supabase connected'
            : '● Demo mode'}
        </label>
      </header>

      <main>

        <div className="hero">
          <div>
            <small>
              <Sparkles size={13} />
              DAILY DISCOVERY WORKSPACE
            </small>

            <h1>Trending Topics</h1>

            <p>
              Discover, review and finalize one topic for the next
              CodeTrappers blog.
            </p>
          </div>

          <button
            className="primary"
            onClick={collect}
            disabled={busy}
          >
            <RefreshCw size={15} />
            {busy ? 'Please wait...' : 'Collect latest topics'}
          </button>
        </div>

        <section className="stats">
          <article>
            <small>Topics discovered</small>
            <b>{topics.length}</b>
          </article>

          <article>
            <small>Shortlisted</small>
            <b>
              {topics.filter(x => x.status === 'shortlisted').length}
            </b>
          </article>

          <article>
            <small>Final selection</small>
            <b>{final ? 1 : 0}</b>
          </article>

          <article>
            <small>Categories</small>
            <b>03</b>
          </article>
        </section>

        {msg && (
          <div className="notice">
            {msg}
            <button onClick={() => setMsg('')}>×</button>
          </div>
        )}

        <div className="tools">
          <nav>
            {[
              'All topics',
              'Shortlisted',
              'Rejected',
              'Finalized'
            ].map(x => (
              <button
                key={x}
                className={tab === x ? 'active' : ''}
                onClick={() => setTab(x)}
              >
                {x}
              </button>
            ))}
          </nav>

          <div className="search">
            <Search size={15} />

            <input
              placeholder="Search topics or sources"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="filters">
          <b>CATEGORY</b>

          {[
            'All',
            'AI',
            'Web Development',
            'App Development'
          ].map(x => (
            <button
              key={x}
              className={cat === x ? 'chosen' : ''}
              onClick={() => setCat(x)}
            >
              {x}
            </button>
          ))}
        </div>

        {final && (
          <div className="final">
            <Check />

            <div>
              <small>FINALIZED TOPIC</small>
              <b>{final.title}</b>
            </div>

            <span>Approved</span>
          </div>
        )}

        <div className="heading">
          <h2>Topic feed</h2>
          <small>{rows.length} topics</small>
        </div>

        <section className="cards">

          {rows.map(x => {
            const Icon =
              x.category === 'AI'
                ? Bot
                : x.category === 'Web Development'
                  ? Globe
                  : Smartphone;

            return (
              <article className="topic" key={x.id}>

                <div className="meta">
                  <span className="cat">
                    <Icon size={15} />
                    {x.category}
                  </span>

                  <span className={`status ${x.status}`}>
                    {x.status}
                  </span>
                </div>

                <h3>{x.title}</h3>

                <p>{x.summary}</p>

                <div className="source">
                  {x.source_name} · {' '}
                  {x.published_at
                    ? new Date(x.published_at).toLocaleDateString()
                    : 'Date unavailable'}

                  <b>
                    Relevance {x.relevance_score ?? '—'}/100
                  </b>
                </div>

                <div className="actions">

                  <a
                    href={x.source_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View source
                    <ExternalLink size={13} />
                  </a>

                  <div>

                    {x.status !== 'shortlisted' &&
                     x.status !== 'finalized' && (
                      <button
                        disabled={busy}
                        onClick={() => status(x, 'shortlisted')}
                      >
                        Shortlist
                      </button>
                    )}

                    {x.status !== 'rejected' &&
                     x.status !== 'finalized' && (
                      <button
                        disabled={busy}
                        onClick={() => status(x, 'rejected')}
                      >
                        Reject
                      </button>
                    )}

                    {x.status === 'shortlisted' && (
                      <button
                        className="finalize-btn"
                        disabled={busy}
                        onClick={() => status(x, 'finalized')}
                      >
                        <Check size={13} />
                        Finalize
                      </button>
                    )}

                  </div>''

                </div>

              </article>
            );
          })}

        </section>

        {!rows.length && (
          <p className="empty">
            No matching topics. Try another filter.
          </p>
        )}

        <footer>
          CodeTrappers · Discovery → Review → Finalize

          <span>
            Sample topics shown until Supabase is configured.
          </span>
        </footer>

      </main>
    </div>
  );
}
