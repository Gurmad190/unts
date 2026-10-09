import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Newspaper, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listAnnouncements, type Announcement } from '../lib/portalApi';

const formatDate = (value: string | null) => value ? new Date(value).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently published';

const NewsEvents: React.FC = () => {
  const [newsItems, setNewsItems] = useState<Announcement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAnnouncements()
      .then(setNewsItems)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'News could not be loaded right now.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['all', ...Array.from(new Set(newsItems.map((item) => item.content_type)))], [newsItems]);
  const filteredItems = selectedCategory === 'all' ? newsItems : newsItems.filter((item) => item.content_type === selectedCategory);

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-uns-navy py-16 text-white md:py-20">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-uns-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-uns-gold">UNS communications</p>
          <h1 className="mb-4 text-3xl font-bold md:text-5xl">News & Events</h1>
          <p className="mx-auto max-w-3xl text-lg text-blue-100 md:text-xl">Stay close to the latest announcements, academic updates, opportunities, and events from the University.</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-uns-navy">Published updates</p>
              <p className="mt-1 text-sm text-gray-500">Content published by the UNS communications team.</p>
            </div>
            {categories.length > 1 && <div className="flex flex-wrap gap-2" aria-label="Filter news by category">{categories.map((category) => <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`rounded-full px-3.5 py-2 text-xs font-bold capitalize transition ${selectedCategory === category ? 'bg-uns-navy text-white shadow-sm' : 'border border-gray-200 bg-white text-gray-600 hover:border-uns-gold hover:text-uns-navy'}`}>{category}</button>)}</div>}
          </div>

          {error && <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
          {loading ? <div className="flex min-h-56 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50"><div className="flex items-center gap-2 text-sm font-medium text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading the latest updates…</div></div> : filteredItems.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center"><Newspaper className="mx-auto h-10 w-10 text-gray-300" /><h2 className="mt-4 text-xl font-bold text-uns-navy">No published updates yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">The University will publish announcements and events here as they become available.</p><Link to="/apply" className="mt-6 inline-flex items-center rounded-md bg-uns-gold px-5 py-3 text-sm font-bold text-uns-navy hover:bg-yellow-400">Apply online <ArrowRight className="ml-2 h-4 w-4" /></Link></div> : <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredItems.map((item) => <article key={item.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-uns-gold/60 hover:shadow-xl"><div className="h-1.5 bg-gradient-to-r from-uns-gold to-amber-200" /><div className="flex flex-grow flex-col p-6"><div className="flex items-center justify-between gap-3"><span className="rounded bg-amber-50 px-2 py-1 text-xs font-bold capitalize text-uns-navy">{item.content_type}</span><span className="flex items-center text-xs text-gray-500"><Calendar className="mr-1 h-3 w-3" />{formatDate(item.published_at || item.created_at)}</span></div><h2 className="mt-5 text-lg font-bold leading-tight text-uns-navy group-hover:text-uns-gold">{item.title}</h2><p className="mt-3 line-clamp-4 flex-grow text-sm leading-6 text-gray-600">{item.summary || item.body}</p><div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4"><span className="text-xs font-medium text-gray-400">UNS Communications</span><span className="flex items-center text-xs font-bold text-uns-navy group-hover:text-uns-gold">Published <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span></div></div></article>)}</div>}
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-uns-navy">Stay connected with UNS</h2>
          <p className="mb-6 text-gray-600">Follow our updates or contact the University for more information.</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row"><Link to="/apply" className="bg-uns-navy px-6 py-3 text-sm font-bold text-white hover:bg-blue-900">Apply online</Link><a href="https://wa.me/252905265390" target="_blank" rel="noopener noreferrer" className="bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700">WhatsApp Us</a><a href="mailto:info@uns.edu.so" className="border-2 border-uns-navy px-6 py-3 text-sm font-bold text-uns-navy hover:bg-uns-navy hover:text-white">Email the University</a></div>
        </div>
      </section>
    </div>
  );
};

export default NewsEvents;
