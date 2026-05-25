import sys
import re

def main():
    file_path = "website/src/Dashboard.tsx"
    with open(file_path, 'r') as f:
        content = f.read()

    # 1. Add useSuiClientQuery for execution events inside OperatorDashboardUI component
    query_code = """
  // Check if user already has a NodeOperator object
  const { data: operatorObjects } = useSuiClientQuery('getOwnedObjects', {
    owner: account?.address || '',
    filter: { StructType: `${PACKAGE_ID}::trigger::NodeOperator` },
    options: { showContent: true }
  }, {
    enabled: !!account,
    refetchInterval: 5000,
  });

  // --- NODE OPERATOR DATA FETCHING ---
  const { data: allExecutionEvents } = useSuiClientQuery(
    'queryEvents',
    {
      query: { MoveEventType: `${PACKAGE_ID}::trigger::ExecutionCompleted` },
      order: 'descending',
      limit: 100
    },
    {
      enabled: !!account && !!runnerAddress,
      refetchInterval: 5000,
    }
  );

  const operatorExecutionEvents = React.useMemo(() => {
    if (!allExecutionEvents?.data || !runnerAddress) return [];
    return allExecutionEvents.data.filter((ev: any) => ev.parsedJson?.runner === runnerAddress);
  }, [allExecutionEvents, runnerAddress]);

  const workloadsProcessed = operatorExecutionEvents.length;
  // 85% of base compute fee (0.007 * 0.85 = 0.00595 SUI per workload roughly)
  const yieldEarned = (workloadsProcessed * 0.00595).toFixed(4);
"""
    
    content = re.sub(
        r"// Check if user already has a NodeOperator object\s*const \{ data: operatorObjects \} = useSuiClientQuery\('getOwnedObjects', \{.*?\},\s*\{\s*enabled: !!account,\s*refetchInterval: 5000,\s*\}\);",
        query_code.strip(),
        content,
        flags=re.DOTALL
    )

    # 2. Update the OperatorDashboardUI Workloads Processed card
    content = re.sub(
        r"(<h4 className=\"text-slate-400 text-\[10px\] font-bold uppercase tracking-wider\">Workloads Processed</h4>\s*<div className=\"flex items-baseline gap-2 mt-1\">\s*<span className=\"text-2xl font-bold text-white font-outfit\">).*?(</span>)",
        r"\g<1>{workloadsProcessed}\g<2>",
        content
    )

    # 3. Update the OperatorDashboardUI Total Yield Earned card
    content = re.sub(
        r"(<h4 className=\"text-slate-400 text-\[10px\] font-bold uppercase tracking-wider\">Total Yield Earned</h4>\s*<div className=\"flex items-baseline gap-2 mt-1\">\s*<span className=\"text-2xl font-bold text-white font-outfit\">).*?(</span>)",
        r"\g<1>{yieldEarned} SUI\g<2>",
        content
    )

    # 4. Update the Node Activity Stream
    mock_activity_regex = r"<div className=\"flex flex-col items-center gap-2\">\s*<div className=\"w-10 h-1 bg-brand-sui shadow-\[0_0_12px_rgba\(56,152,255,0\.8\)\] rounded-t-sm\"></div>\s*<span className=\"text-\[10px\] text-slate-400 font-mono\">16:18</span>\s*</div>.*?<div className=\"mt-1\">\s*<CheckCircle size=\{14\} className=\"text-brand-sui\" />\s*</div>\s*<div>\s*<div className=\"flex items-center gap-2 mb-1\">\s*<span className=\"text-xs font-bold text-slate-200\">Workload Processed</span>\s*<span className=\"text-\[10px\] text-slate-500 font-mono\">16:18:23</span>\s*</div>\s*<p className=\"text-xs text-slate-400 leading-relaxed\">\s*Processed decentralized workload\. State transition verified and proof published\.\s*</p>\s*</div>\s*</div>"

    dynamic_activity = """
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {operatorExecutionEvents.slice(0, 5).map((ev: any, idx: number) => {
                  const timestamp = ev.timestampMs ? new Date(Number(ev.timestampMs)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : '--:--';
                  return (
                    <div key={idx} className="bg-[#041829]/40 border border-[#14304A]/50 rounded-xl p-4 flex gap-4 items-start">
                      <div className="mt-1">
                        <CheckCircle size={14} className="text-brand-sui" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-200">Workload Processed</span>
                          <span className="text-[10px] text-slate-500 font-mono">{timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Processed decentralized workload. State transition verified and proof published for Function <span className="text-brand-sui">{ev.parsedJson?.function_name}</span>.
                        </p>
                      </div>
                    </div>
                  );
                })}
                {operatorExecutionEvents.length === 0 && (
                  <div className="text-center py-8">
                    <Terminal size={24} className="text-[#14304A] mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No recent activity on-chain.</p>
                  </div>
                )}
              </div>
    """
    
    # Simple replacement for the activity stream mock block
    content = re.sub(
        r"(<h3 className=\"text-white font-bold font-outfit text-xl mb-6\">Node Activity Stream</h3>\s*<div className=\"flex flex-col h-\[400px\]\">).*?(</div>\s*</div>\s*<!-- End Node Activity Stream -->)",
        r"\g<1>" + dynamic_activity + r"\g<2>",
        content,
        flags=re.DOTALL
    )

    # 5. Update the Recent Validated Workloads table
    dynamic_table = """
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-[#14304A]/30 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-medium tracking-wider rounded-tl-xl">Workload ID</th>
                      <th className="px-6 py-4 font-medium tracking-wider">Gas Consumed</th>
                      <th className="px-6 py-4 font-medium tracking-wider rounded-tr-xl">Network</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#14304A]/40">
                    {operatorExecutionEvents.slice(0, 3).map((ev: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{ev.parsedJson?.function_name || 'unknown'}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">0.007 SUI</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">Sui Testnet</span>
                        </td>
                      </tr>
                    ))}
                    {operatorExecutionEvents.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-xs">No recent workloads</td>
                      </tr>
                    )}
                  </tbody>
                </table>
    """

    content = re.sub(
        r"(<table className=\"w-full text-left text-sm text-slate-300\">\s*<thead className=\"bg-\[#14304A\]/30 text-xs uppercase text-slate-400\">).*?(</table>)",
        dynamic_table.strip(),
        content,
        flags=re.DOTALL
    )

    with open(file_path, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    main()
