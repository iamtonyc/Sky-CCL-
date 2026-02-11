
import React, { useState } from 'react';
import { Cloud, Github, Info, FileSpreadsheet, Activity, Layers, ExternalLink } from 'lucide-react';
import FileUploader from './components/FileUploader';
import CCLChart from './components/CCLChart';
import CCLMonthlyChart from './components/CCLMonthlyChart';
import { parseCCLExcel } from './utils/excelParser';
import { CCLData } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<CCLData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'CCL1' | 'CCL2'>('CCL1');

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await parseCCLExcel(file);
      if (result.error) {
        setError(result.error);
        setData([]);
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError("An unexpected error occurred while processing the file.");
      setData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <Cloud size={28} className="stroke-[2.5]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Sky <span className="text-blue-600">CCL</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm font-medium">
              <a 
                href="https://hk.centanet.com/CCI/query/data?type=CCL" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100"
              >
                <span>CCL Data Source</span>
                <ExternalLink size={14} />
              </a>
              <div className="hidden md:flex items-center gap-4 text-slate-600">
                <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
                <a href="#" className="hover:text-blue-600 transition-colors">History</a>
              </div>
            </nav>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Github">
              <Github size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <FileUploader 
          onFileSelect={handleFileSelect} 
          error={error} 
          onClearError={() => setError(null)} 
        />

        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Processing Excel data...</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-8 mb-6 border-b border-slate-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('CCL1')}
              className={`pb-4 px-1 text-sm font-semibold transition-all relative ${
                activeTab === 'CCL1' 
                  ? 'text-blue-600' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity size={18} />
                CCL 1
              </div>
              {activeTab === 'CCL1' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('CCL2')}
              className={`pb-4 px-1 text-sm font-semibold transition-all relative ${
                activeTab === 'CCL2' 
                  ? 'text-blue-600' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers size={18} />
                CCL 2
              </div>
              {activeTab === 'CCL2' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {data.length > 0 && !isProcessing && (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'CCL1' ? (
              <div className="space-y-12">
                <CCLChart data={data} />
                
                {/* Table View */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Info size={18} className="text-blue-500" />
                    <h3 className="text-lg font-bold text-slate-800">Data Summary</h3>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                        <tr>
                          <th className="px-6 py-4">Original Date Range</th>
                          <th className="px-6 py-4">End Date</th>
                          <th className="px-6 py-4">CCL Index Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.slice(-10).reverse().map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-slate-600">{row.originalDateRange}</td>
                            <td className="px-6 py-4 font-medium text-slate-900">{row.endDate}</td>
                            <td className="px-6 py-4 font-bold text-blue-600">{row.indexValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 text-center">
                      Showing the latest 10 records
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <CCLMonthlyChart data={data} />
                
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                  <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
                    <Info size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900">About Monthly Analysis</h4>
                    <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                      The candlestick chart above aggregates weekly data into standard monthly intervals (YYYY-MM). 
                      The "body" of each candle represents the index at the start and end of the month, 
                      while the "wick" shows the full volatility range experienced during those weeks.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {data.length === 0 && !error && !isProcessing && (activeTab === 'CCL1') && (
          <div className="mt-12 p-8 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
              <FileSpreadsheet className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">How to format your file</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              Ensure your Excel has two columns: "日期" (Date Range) and "中原城市領先指數" (CCL Index).
            </p>
            <div className="flex gap-4">
              <div className="text-left bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Col A</p>
                <p className="text-xs font-medium text-slate-700">日期 / Date Range</p>
              </div>
              <div className="text-left bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Col B</p>
                <p className="text-xs font-medium text-slate-700">中原城市領先指數 / CCL Index</p>
              </div>
            </div>
          </div>
        )}

        {data.length === 0 && !error && !isProcessing && (activeTab === 'CCL2') && (
           <div className="mt-12 text-center py-12">
             <p className="text-slate-400 font-medium">Please upload a file first to view analytics in CCL 2.</p>
           </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 grayscale opacity-60">
            <Cloud size={20} />
            <span className="font-bold text-slate-900 tracking-tight">Sky CCL</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Sky CCL Analytics. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
