import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Lock,
  Globe,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';
import Button from '../common/Button';
import SoapTemplate from './SoapTemplate';
import useEntitlement from '../../hooks/useEntitlement';

const NoteEditor = ({ initialData, onSave, onCancel, clients = [], isLoading = false }) => {
  const { isTemplateAllowed, promptUpgrade, tierName } = useEntitlement();

  const [title, setTitle] = useState(initialData?.title || '');
  const [clientId, setClientId] = useState(initialData?.client_id?._id || initialData?.client_id || (clients[0]?._id || ''));
  const [noteType, setNoteType] = useState(initialData?.type || 'private'); // 'private' | 'shared'
  const [format, setFormat] = useState(initialData?.format || 'freeform');  // 'freeform' | 'soap' | 'dap'
  const [soapData, setSoapData] = useState(initialData?.soapData || {
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialData?.content || '<p>Clinical impressions, behavioral observations, and therapeutic interventions...</p>',
  });

  // Handle format change with tier entitlement check
  const handleFormatChange = (newFormat) => {
    if (newFormat === 'soap' || newFormat === 'dap') {
      if (!isTemplateAllowed(newFormat)) {
        promptUpgrade(
          `${newFormat.toUpperCase()} Clinical Templates`,
          `Structured ${newFormat.toUpperCase()} clinical templates require the Professional or Enterprise tier. Upgrade now to standardize your therapy documentation.`
        );
        return;
      }
    }
    setFormat(newFormat);
  };

  const handleSoapChange = (key, value) => {
    setSoapData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const htmlContent = editor ? editor.getHTML() : '';
    onSave({
      title,
      client_id: clientId,
      type: noteType,
      format,
      content: htmlContent,
      soapData: format === 'soap' ? soapData : undefined,
    });
  };

  if (!editor) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 text-left shadow-xs">
      {/* Top Controls: Title & Client */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Note Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Session #4: Relational Boundaries & Grounding Exercises"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Associated Client *
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Note Type & Format Selection */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
        {/* Private vs Shared Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1">
            Access Type:
          </span>
          <button
            type="button"
            onClick={() => setNoteType('private')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              noteType === 'private'
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Private (Therapist Only)</span>
          </button>

          <button
            type="button"
            onClick={() => setNoteType('shared')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              noteType === 'shared'
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Shared with Client</span>
          </button>
        </div>

        {/* Format Selector (with Tier Gating badge) */}
        <div className="flex items-center gap-1 text-xs">
          <span className="font-bold text-slate-600 uppercase tracking-wider mr-1">Template:</span>
          <button
            type="button"
            onClick={() => handleFormatChange('freeform')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              format === 'freeform' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border hover:bg-slate-100'
            }`}
          >
            Freeform
          </button>

          <button
            type="button"
            onClick={() => handleFormatChange('soap')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition border ${
              format === 'soap'
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>SOAP</span>
            {!isTemplateAllowed('soap') && <Sparkles className="w-3 h-3 text-amber-500" />}
          </button>

          <button
            type="button"
            onClick={() => handleFormatChange('dap')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition border ${
              format === 'dap'
                ? 'bg-indigo-700 text-white border-indigo-700'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>DAP</span>
            {!isTemplateAllowed('dap') && <Sparkles className="w-3 h-3 text-amber-500" />}
          </button>
        </div>
      </div>

      {noteType === 'shared' && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            <strong>Client Portal Visibility:</strong> This note will be visible to {clients.find((c) => c._id === clientId)?.name || 'the client'} when they log in to their portal. Private clinical interpretations will not be shown.
          </span>
        </div>
      )}

      {/* Structured SOAP Form (if SOAP selected) */}
      {format === 'soap' && (
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <SoapTemplate soapData={soapData} onChange={handleSoapChange} />
        </div>
      )}

      {/* TipTap Rich Text Toolbar */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-1 bg-slate-50 px-3 py-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition ${
              editor.isActive('bold') ? 'bg-white font-bold text-teal-700 shadow-xs' : ''
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition ${
              editor.isActive('italic') ? 'bg-white font-bold text-teal-700 shadow-xs' : ''
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition ${
              editor.isActive('heading', { level: 2 }) ? 'bg-white font-bold text-teal-700 shadow-xs' : ''
            }`}
            title="Heading"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition ${
              editor.isActive('bulletList') ? 'bg-white font-bold text-teal-700 shadow-xs' : ''
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition ${
              editor.isActive('orderedList') ? 'bg-white font-bold text-teal-700 shadow-xs' : ''
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition ${
              editor.isActive('blockquote') ? 'bg-white font-bold text-teal-700 shadow-xs' : ''
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="p-4 min-h-[160px] bg-white text-sm">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          icon={Save}
          disabled={!title.trim() || !clientId}
          isLoading={isLoading}
          onClick={handleSave}
        >
          Save Clinical Note
        </Button>
      </div>
    </div>
  );
};

export default NoteEditor;
