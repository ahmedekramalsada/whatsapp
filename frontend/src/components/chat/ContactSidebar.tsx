import React, { useState, useEffect } from 'react';
import { User, Tag, FileText, Save, Plus, X } from 'lucide-react';

interface Contact {
  id: string;
  phone_number: string;
  name: string | null;
  labels: string[];
  notes: string | null;
}

const ContactSidebar: React.FC<{ contactId: string; onUpdate: () => void }> = ({ contactId, onUpdate }) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts/${contactId}`)
      .then(res => res.json())
      .then(data => {
        setContact(data);
        setName(data.name || '');
        setNotes(data.notes || '');
        setLabels(data.labels || []);
        setLoading(false);
      });
  }, [contactId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, labels, notes })
      });
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const addLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter(l => l !== label));
  };

  if (loading) return <div className="w-80 border-l bg-zinc-50 dark:bg-zinc-900/50 p-6 animate-pulse space-y-4">
    <div className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
    <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
  </div>;

  return (
    <div className="w-80 border-l bg-zinc-50 dark:bg-zinc-900/50 flex flex-col h-full overflow-y-auto">
      {/* Header Profile */}
      <div className="p-6 text-center border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
          <User className="w-10 h-10 text-indigo-600" />
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-lg font-bold bg-transparent text-center w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2"
          placeholder="Anonymous Customer"
        />
        <p className="text-zinc-500 text-sm mt-1">{contact?.phone_number}</p>
      </div>

      <div className="p-6 space-y-8 flex-1">
        {/* Labels Section */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Tag className="w-3 h-3" /> Labels
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {labels.map(label => (
              <span key={label} className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 group">
                {label}
                <button onClick={() => removeLabel(label)} className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Add label..."
              className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && addLabel()}
            />
            <button onClick={addLabel} className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Notes Section */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText className="w-3 h-3" /> Internal Notes
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="No notes yet..."
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
          ></textarea>
        </section>
      </div>

      {/* Action Bar */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-zinc-900 dark:bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Contact Info
        </button>
      </div>
    </div>
  );
};

export default ContactSidebar;
