import React from 'react';
import { Layout, Menu, Typography, Card, Space, Button } from 'antd';
import { LayoutDashboard, Code, ShoppingCart, LogOut, Plus, Cpu, User } from 'lucide-react';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  return (
    <Layout className="min-h-screen bg-[#F9FAFB]">
      <Sider 
        width={260} 
        className="bg-slate-pro border-r border-slate-800 h-screen sticky top-0 flex flex-col"
        style={{ background: '#1F2937' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="px-6 pt-10 mb-10 flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Cpu size={18} className="text-slate-pro" />
            </div>
            <Text className="text-white text-lg font-bold tracking-tight">Sui-Functions</Text>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 px-4">
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              className="bg-transparent border-none"
              items={[
                { 
                  key: '1', 
                  icon: <LayoutDashboard size={18} />, 
                  label: 'Overview',
                  className: '!text-slate-400 hover:!text-slate-100' 
                },
                { 
                  key: '2', 
                  icon: <Code size={18} />, 
                  label: 'My Functions',
                  className: '!text-slate-400 hover:!text-slate-100' 
                },
                { 
                  key: '3', 
                  icon: <ShoppingCart size={18} />, 
                  label: 'Marketplace',
                  className: '!text-slate-400 hover:!text-slate-100' 
                },
              ]}
              style={{ background: 'transparent' }}
            />
          </div>

          {/* Footer Section with Wallet Info */}
          <div className="p-6 border-t border-slate-800">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2 py-3 bg-slate-800/50 rounded-xl border border-white/5">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <User size={14} className="text-blue-400" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <Text className="text-slate-100 text-xs font-bold">Owner</Text>
                  <Text className="text-slate-400 text-[10px] font-mono truncate">
                    {account?.address}
                  </Text>
                </div>
              </div>
              
              <Button 
                type="text" 
                icon={<LogOut size={16} />} 
                className="text-slate-400 hover:!text-red-400 hover:!bg-red-400/10 w-full text-left flex items-center justify-start h-10 rounded-lg transition-colors border-none"
                onClick={() => disconnect()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </Sider>

      <Layout className="bg-transparent">
        <Content className="p-12 relative">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <div>
                <Title level={2} className="!m-0 !text-slate-pro !font-extrabold tracking-tight">Overview</Title>
                <Text type="secondary" className="text-sm">Manage your decentralized infrastructure</Text>
              </div>
              <Button 
                type="primary" 
                icon={<Plus size={18} />} 
                className="bg-slate-pro hover:!bg-gray-800 border-none rounded-xl font-bold h-12 px-8 flex items-center gap-2"
              >
                New Function
              </Button>
            </div>

            {/* Clean Canvas for Real-Time Logic */}
            <div className="w-full min-h-[60vh] rounded-[40px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center bg-white/50">
              <div className="p-6 bg-gray-50 rounded-3xl mb-6">
                <Code size={48} className="text-gray-300" />
              </div>
              <Title level={4} className="!text-gray-400 !font-bold !mb-2">Ready for Logic</Title>
              <Text className="text-gray-400 max-w-xs">
                Your workspace is primed. Register a function to see real-time execution metrics.
              </Text>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
