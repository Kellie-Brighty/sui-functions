import sys

def main():
    file_path = "website/src/Dashboard.tsx"
    with open(file_path, 'r') as f:
        content = f.read()

    # 1. Update text in OperatorDashboardUI
    # Chart title
    content = content.replace("Execution Volume (Global)", "Workload Process Volume")
    content = content.replace("SUI EVENT BUS", "NETWORK DISCOVERY")
    content = content.replace("WALRUS WORKERS", "CONTAINER EXECUTIONS")
    
    # Active alerts
    content = content.replace("Active Alerts", "Node Activity Stream")
    content = content.replace("VM Isolate Completed", "Container Executed")
    content = content.replace("Executed 'Hello world' successfully inside V8 sandbox. Output: Function executed successfully", "Processed decentralized workload. State transition verified and proof published.")
    
    # Table section
    content = content.replace("Top Performing Functions", "Recent Validated Workloads")
    content = content.replace("View Performance Suite", "View All Logs")
    content = content.replace(">Function Name<", ">Workload ID<")
    content = content.replace(">Invocations<", ">Gas Consumed<")
    content = content.replace(">Trigger<", ">Network<")
    content = content.replace(">Hello world<", ">wrk_9f2a...<")
    content = content.replace(">3<", ">0.002 SUI<")
    content = content.replace(">Manual<", ">Sui Mainnet<")
    content = content.replace(">Edit Trigger<", ">View Explorer<")

    # The stray button in the sidebar around line 3067
    target_stray_button = """                  <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-sui to-[#6FB7B7] text-white py-3 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(56,152,255,0.25)] hover:shadow-[0_4px_20px_rgba(56,152,255,0.4)] hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer">
                    <Plus size={16} /> Register Validator Node
                  </button>"""
    
    content = content.replace(target_stray_button, "")

    with open(file_path, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    main()
