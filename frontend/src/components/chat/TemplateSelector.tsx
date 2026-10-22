import React, { useState, useEffect } from 'react';
import { X, Layout, Send } from 'lucide-react';

interface Template {
  name: string;
  category: string;
  language: string;
  components: any[];
}

interface TemplateSelectorProps {
  onSelect: (template: Template, variables: string[]) => void;
  onClose: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, onClose }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variables, setVariables] = useState<string[]>([]);

  useEffect(() => {
    // Fetch templates from our backend
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/templates`)
      .then(res => res.json())
      .then(data => {
        setTemplates(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch templates:', err);
        setLoading(false);
      });
  }, []);

  const handleTemplateClick = (temp: Template) => {
    setSelectedTemplate(temp);
    // Extract variables count (placeholders like {{1}}, {{2}})
    const bodyComponent = temp.components.find(c => c.type === 'BODY');
    const matches = bodyComponent?.text.match(/\{\{\d+\}\}/g);
    const count = matches ? matches.length : 0;
    setVariables(new Array(count).fill(''));
  };

  const handleSend = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate, variables);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-500" />
              WhatsApp Templates
            </h2>
            <p className="text-sm text-zinc-500 mt-1">Select a pre-approved template to start a chat</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex gap-6">
          {/* List Section */}
          <div className="w-1/2 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Approved Templates</h3>
            {loading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />)}
              </div>
            ) : templates.length === 0 ? (
              <p className="text-center py-8 text-zinc-500 italic">No templates found</p>
            ) : (
              templates.map(temp => (
                <button
                  key={temp.name}
                  onClick={() => handleTemplateClick(temp)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedTemplate?.name === temp.name
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500/50'
                  }`}
                >
                  <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 truncate">{temp.name}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-tighter">{temp.category}</p>
                </button>
              ))
            )}
          </div>

          {/* Preview & Variables Section */}
          <div className="w-1/2 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
            {selectedTemplate ? (
              <div className="h-full flex flex-col">
                <div className="flex-1">
                   <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Preview</h3>
                   <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-sm mb-6 leading-relaxed">
                     {selectedTemplate.components.find(c => c.type === 'BODY')?.text.split(/\{\{\d+\}\}/).map((part: string, i: number) => (
                       <React.Fragment key={i}>
                         {part}
                         {i < variables.length && (
                           <span className="text-indigo-600 dark:text-indigo-400 font-bold underline decoration-dotted underline-offset-4">
                             {variables[i] || `[Var ${i+1}]`}
                           </span>
                         )}
                       </React.Fragment>
                     ))}
                   </div>

                   {variables.length > 0 && (
                     <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Fill Variables</h3>
                        {variables.map((_, i) => (
                          <div key={i}>
                            <label className="text-[10px] font-bold text-zinc-500 mb-1 block uppercase">Variable {i+1}</label>
                            <input
                              type="text"
                              value={variables[i]}
                              onChange={(e) => {
                                const newVars = [...variables];
                                newVars[i] = e.target.value;
                                setVariables(newVars);
                              }}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                              placeholder={`Enter mapping for {{${i+1}}}`}
                            />
                          </div>
                        ))}
                     </div>
                   )}
                </div>
                <button
                  onClick={handleSend}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  Send Template
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 opacity-50">
                <Layout className="w-12 h-12 mb-3" />
                <p className="text-sm">Select a template to view preview and fill variables</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
