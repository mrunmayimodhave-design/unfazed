import React from 'react';

const SoapTemplate = ({ soapData, onChange }) => {
  const fields = [
    {
      key: 'subjective',
      label: 'Subjective (S)',
      hint: "Client's stated experiences, mood, feelings, and symptoms since last session.",
      placeholder: 'Client reports feeling overwhelmed with quarterly reviews. Sleep has improved slightly...',
    },
    {
      key: 'objective',
      label: 'Objective (O)',
      hint: 'Clinician observations, appearance, affect, behavioral demeanor, and test scores.',
      placeholder: 'Client was alert, oriented, well-groomed. Affect was congruent with reported anxious mood...',
    },
    {
      key: 'assessment',
      label: 'Assessment (A)',
      hint: 'Clinical interpretation of progress, cognitive distortions, response to interventions.',
      placeholder: 'Cognitive reframing continues to show positive trajectory. Catastrophic thinking triggered by...',
    },
    {
      key: 'plan',
      label: 'Plan (P)',
      hint: 'Homework assignments, coping strategies to practice, and agenda for next session.',
      placeholder: '1. Practice box breathing 3x daily. 2. Record automatic thoughts. 3. Follow up in 7 days.',
    },
  ];

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.key} className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {f.label}
            </label>
            <span className="text-[11px] text-slate-400 italic">{f.hint}</span>
          </div>
          <textarea
            rows={2}
            value={soapData[f.key] || ''}
            onChange={(e) => onChange(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>
      ))}
    </div>
  );
};

export default SoapTemplate;
