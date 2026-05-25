import sys

def main():
    file_path = "website/src/Dashboard.tsx"
    with open(file_path, 'r') as f:
        content = f.read()

    # 1. Update `<OperatorDashboardUI>` instantiation
    target_render = "<OperatorDashboardUI account={account} showToast={showToast} />"
    replace_render = "<OperatorDashboardUI account={account} showToast={showToast} activeMenu={activeMenu} />"
    
    # 2. Operator Navigation menus (Desktop & Mobile)
    target_operator_nav = """                  <nav className="flex flex-col gap-1.5">
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]">
                      <LayoutDashboard size={16} /> Overview
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 text-slate-200 hover:text-white hover:bg-white/5 border border-transparent">
                      <Terminal size={16} /> Node Logs
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 text-slate-200 hover:text-white hover:bg-white/5 border border-transparent">
                      <Activity size={16} /> Performance
                    </button>
                  </nav>"""

    replace_operator_nav = """                  <nav className="flex flex-col gap-1.5">
                    <button onClick={() => setActiveMenu('operator-1')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-1' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <LayoutDashboard size={16} /> Overview
                    </button>
                    <button onClick={() => setActiveMenu('operator-2')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-2' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <Terminal size={16} /> Node Logs
                    </button>
                    <button onClick={() => setActiveMenu('operator-3')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-3' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <Activity size={16} /> Performance
                    </button>
                    <button onClick={() => setActiveMenu('operator-4')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-4' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <Wallet size={16} /> Runner Vault
                    </button>
                  </nav>"""

    # 3. Mobile Navigation menus
    target_mobile_nav = """                {persona === 'operator' ? (
                  <nav className="flex flex-col gap-1.5">
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]">
                      <LayoutDashboard size={16} /> Overview
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 text-slate-200 hover:text-white hover:bg-white/5 border border-transparent">
                      <Terminal size={16} /> Node Logs
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 text-slate-200 hover:text-white hover:bg-white/5 border border-transparent">
                      <Activity size={16} /> Performance
                    </button>
                  </nav>
                ) : ("""

    replace_mobile_nav = """                {persona === 'operator' ? (
                  <nav className="flex flex-col gap-1.5">
                    <button onClick={() => { setActiveMenu('operator-1'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-1' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <LayoutDashboard size={16} /> Overview
                    </button>
                    <button onClick={() => { setActiveMenu('operator-2'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-2' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <Terminal size={16} /> Node Logs
                    </button>
                    <button onClick={() => { setActiveMenu('operator-3'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-3' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <Activity size={16} /> Performance
                    </button>
                    <button onClick={() => { setActiveMenu('operator-4'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeMenu === 'operator-4' ? 'bg-gradient-to-r from-brand-sui/10 to-brand-sui/5 border border-brand-sui/20 text-brand-sui shadow-[inset_0_1px_12px_rgba(56,152,255,0.08)]' : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                      <Wallet size={16} /> Runner Vault
                    </button>
                  </nav>
                ) : ("""

    # 4. Remove Register Validator Node
    target_register_btn = """                  <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-sui to-[#6FB7B7] text-white py-3 rounded-xl text-xs font-bold shadow-[0_4px_15px_rgba(56,152,255,0.25)] hover:shadow-[0_4px_20px_rgba(56,152,255,0.4)] hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer">
                    <Plus size={16} /> Register Validator Node
                  </button>

                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 bg-[#041829]/60 hover:bg-white/5 border border-[#14304A] text-slate-300 hover:text-white">"""

    replace_register_btn = """                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 bg-[#041829]/60 hover:bg-white/5 border border-[#14304A] text-slate-300 hover:text-white">"""

    # 5. Fix initial active persona state
    target_persona_toggle_1 = """                onClick={() => setPersona('developer')}"""
    replace_persona_toggle_1 = """                onClick={() => { setPersona('developer'); setActiveMenu('1'); }}"""

    target_persona_toggle_2 = """                onClick={() => setPersona('operator')}"""
    replace_persona_toggle_2 = """                onClick={() => { setPersona('operator'); setActiveMenu('operator-1'); }}"""


    content = content.replace(target_render, replace_render)
    content = content.replace(target_operator_nav, replace_operator_nav)
    if target_mobile_nav in content:
        content = content.replace(target_mobile_nav, replace_mobile_nav)
    content = content.replace(target_register_btn, replace_register_btn)

    # Let's handle persona toggles more generically:
    content = content.replace("onClick={() => setPersona('developer')}", "onClick={() => { setPersona('developer'); setActiveMenu('1'); }}")
    content = content.replace("onClick={() => setPersona('operator')}", "onClick={() => { setPersona('operator'); setActiveMenu('operator-1'); }}")

    with open(file_path, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    main()
