import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  FileText,
  Plus,
  Lock,
  Globe,
  Sparkles,
  Pin,
  Trash2,
  Edit3,
  Search,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import NoteEditor from '../../components/notes/NoteEditor';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'private' | 'shared'
  const [clientFilter, setClientFilter] = useState('');
  const [search, setSearch] = useState('');

  // Editor mode: null (list), 'create', or note object (edit)
  const [editorMode, setEditorMode] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [notesRes, clientsRes] = await Promise.all([
        axiosInstance.get(`/notes?type=${typeFilter}${clientFilter ? `&client_id=${clientFilter}` : ''}`),
        axiosInstance.get('/clients'),
      ]);

      if (notesRes.data.success) {
        setNotes(notesRes.data.notes || []);
      }
      if (clientsRes.data.success) {
        setClients(clientsRes.data.clients || []);
      }
    } catch (err) {
      console.error('Error fetching clinical notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, clientFilter]);

  const handleSaveNote = async (notePayload) => {
    setSaving(true);
    try {
      if (editorMode?._id) {
        // Edit existing
        await axiosInstance.put(`/notes/${editorMode._id}`, notePayload);
      } else {
        // Create new
        await axiosInstance.post('/notes', notePayload);
      }
      setEditorMode(null);
      fetchData();
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this clinical note?')) return;
    try {
      await axiosInstance.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      n.title?.toLowerCase().includes(term) ||
      n.client_id?.name?.toLowerCase().includes(term) ||
      n.content?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <Loader text="Loading clinical records and documentation..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Documentation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain private session impressions (SOAP/DAP) and share therapeutic homework with clients.
          </p>
        </div>

        {!editorMode && (
          <Button icon={Plus} onClick={() => setEditorMode('create')}>
            New Clinical Note
          </Button>
        )}
      </div>

      {editorMode ? (
        <NoteEditor
          initialData={editorMode === 'create' ? null : editorMode}
          clients={clients}
          onSave={handleSaveNote}
          onCancel={() => setEditorMode(null)}
          isLoading={saving}
        />
      ) : (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search notes by title or client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Type Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All ({notes.length})
                </button>
                <button
                  onClick={() => setTypeFilter('private')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                    typeFilter === 'private' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Private</span>
                </button>
                <button
                  onClick={() => setTypeFilter('shared')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                    typeFilter === 'shared' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Globe className="w-3 h-3 text-teal-600" />
                  <span>Shared</span>
                </button>
              </div>

              {/* Client Filter */}
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Clients</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No clinical notes recorded</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Begin documenting therapeutic sessions with freeform text or structured SOAP templates.
              </p>
              <div className="mt-4">
                <Button size="sm" icon={Plus} onClick={() => setEditorMode('create')}>
                  Create First Note
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNotes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => setEditorMode(note)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-teal-400 transition cursor-pointer flex flex-col justify-between text-left group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          note.type === 'private'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-teal-50 text-teal-800 border border-teal-200'
                        }`}
                      >
                        {note.type === 'private' ? (
                          <>
                            <Lock className="w-3 h-3 text-amber-600" />
                            <span>Private</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3 h-3 text-teal-600" />
                            <span>Client Portal Shared</span>
                          </>
                        )}
                      </span>

                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {note.format}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition line-clamp-1">
                        {note.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Client: <span className="text-slate-800">{note.client_id?.name || 'Assigned Client'}</span>
                      </p>
                    </div>

                    {/* Preview Content */}
                    {note.format === 'soap' && note.soapData?.assessment ? (
                      <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 line-clamp-3">
                        <strong className="text-slate-800">Assessment:</strong> {note.soapData.assessment}
                      </div>
                    ) : (
                      <div
                        className="text-xs text-slate-600 line-clamp-3 prose prose-xs"
                        dangerouslySetInnerHTML={{ __html: note.content || '<em>No additional content</em>' }}
                      />
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDeleteNote(note._id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notes;
