import React, { useEffect, useState } from 'react';
import { Layout, Menu, Typography, Card, Space, Button, Row, Col, Statistic, notification } from 'antd';
import { LayoutDashboard, Code, ShoppingCart, LogOut, Plus, Cpu, User, Activity, Globe, Zap, Terminal } from 'lucide-react';
import { useCurrentAccount, useDisconnectWallet, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, REGISTRY_ID, HELLO_WORLD_BLOB_ID } from './constants';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [executionCount, setExecutionCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Subscribe to Events
  useEffect(() => {
    if (!client) return;

    console.log("Subscribing to events for package:", PACKAGE_ID);
    
    // In SDK v2, subscribeEvent returns an unsubscribe function
    let unsubscribe: () => Promise<boolean>;

    const setupSubscription = async () => {
      try {
        const sub = await client.subscribeEvent({
          filter: { MoveModule: { package: PACKAGE_ID, module: 'trigger' } },
          onMessage: (event) => {
            console.log("New Event Received:", event);
            if (event.type.includes('ExecutionTriggered')) {
              setExecutionCount(prev => prev + 1);
              notification.success({
                message: 'New Execution Triggered',
                description: `Function "${(event.parsedJson as any).function_name}" is being executed.`,
                placement: 'bottomRight',
                icon: <Zap size={18} className="text-amber-500" />,
                style: { borderRadius: '12px' }
              });
              setLogs(prev => [`[Blockchain] Event received: ${event.id.txDigest}`, ...prev]);
            }
          }
        });
        unsubscribe = sub;
      } catch (err) {
        console.error("Subscription failed:", err);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [client]);

  const handleTrigger = (blobId: string, functionName: string) => {
    if (!account) return;
    
    setIsExecuting(true);
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::call_function`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.string(functionName),
        tx.pure.string("{}") // Empty JSON input for now
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          console.log("Transaction Success:", result);
          setLogs(prev => [`[Transaction] Submitted: ${result.digest}`, ...prev]);
          setIsExecuting(false);
        },
        onError: (err) => {
          console.error("Transaction Error:", err);
          notification.error({ message: 'Execution Failed', description: err.message });
          setIsExecuting(false);
        }
      }
    );
  };

  return (
    <Layout className="min-h-screen bg-[#F9FAFB]">
      <Sider 
        width={260} 
        className="h-screen sticky top-0 flex flex-col border-none"
        style={{ background: '#020617' }} // bg-slate-950
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="px-6 pt-10 mb-10 flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Cpu size={18} className="text-slate-950" />
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
                  className: '!text-slate-400 hover:!text-white' 
                },
                { 
                  key: '2', 
                  icon: <Code size={18} />, 
                  label: 'My Functions',
                  className: '!text-slate-400 hover:!text-white' 
                },
                { 
                  key: '3', 
                  icon: <ShoppingCart size={18} />, 
                  label: 'Marketplace',
                  className: '!text-slate-400 hover:!text-white' 
                },
              ]}
              style={{ background: 'transparent' }}
            />
          </div>

          {/* Footer Section with Wallet Info */}
          <div className="p-6 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-3 py-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <User size={14} className="text-white" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <Text className="text-white text-xs font-bold">Owner</Text>
                  <Text className="text-slate-500 text-[10px] font-mono truncate tracking-tighter">
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
        <Content className="p-12">
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

            <Row gutter={[24, 24]} className="mb-12">
              <Col span={8}>
                <Card className="rounded-[32px] border-none shadow-sm p-2">
                  <Statistic 
                    title={<Space><Activity size={16} className="text-blue-500" /> <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Total Executions</Text></Space>} 
                    value={executionCount} 
                    valueStyle={{ color: '#1F2937', fontWeight: 900, fontSize: '2.5rem' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card className="rounded-[32px] border-none shadow-sm p-2">
                  <Statistic 
                    title={<Space><Globe size={16} className="text-green-500" /> <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Nodes Active</Text></Space>} 
                    value={1} 
                    valueStyle={{ color: '#1F2937', fontWeight: 900, fontSize: '2.5rem' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card className="rounded-[32px] border-none shadow-sm p-2">
                  <Statistic 
                    title={<Space><Zap size={16} className="text-amber-500" /> <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Gas Usage</Text></Space>} 
                    value={0.00} 
                    precision={2}
                    suffix="SUI"
                    valueStyle={{ color: '#1F2937', fontWeight: 900, fontSize: '2.5rem' }}
                  />
                </Card>
              </Col>
            </Row>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Col span={16} className="md:col-span-2">
                <Card 
                  className="rounded-[40px] border-none shadow-sm overflow-hidden h-full"
                  title={<div className="flex items-center gap-2 py-2"><Terminal size={18} /> <Text className="font-bold">Execution Logs</Text></div>}
                >
                  <div className="bg-slate-900 rounded-2xl p-6 min-h-[300px] font-mono text-xs text-slate-400 overflow-y-auto max-h-[400px]">
                    {logs.map((log, i) => (
                      <div key={i} className="mb-2 flex gap-3">
                        <span className="opacity-30">{logs.length - i}</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    {logs.length === 0 && <div className="opacity-20">Listening for events...</div>}
                  </div>
                </Card>
              </Col>
              <Col span={8} className="md:col-span-1">
                <Card className="rounded-[40px] border-none shadow-sm p-6 h-full flex flex-col justify-between">
                  <div>
                    <Title level={4} className="!mb-2">Quick Trigger</Title>
                    <Paragraph className="text-gray-400 text-sm mb-6">
                      Manually fire the "hello_world" function to test the end-to-end execution flow.
                    </Paragraph>
                    <div className="p-4 bg-gray-50 rounded-2xl mb-8 border border-gray-100">
                      <div className="flex items-center gap-3 mb-2">
                        <Code size={16} className="text-gray-400" />
                        <Text className="font-bold text-sm">hello_world.js</Text>
                      </div>
                      <Text type="secondary" className="text-[10px] font-mono opacity-50 block truncate">
                        ID: {HELLO_WORLD_BLOB_ID}
                      </Text>
                    </div>
                  </div>
                  
                  <Button 
                    type="primary" 
                    size="large" 
                    block
                    loading={isExecuting}
                    icon={<Play size={18} fill="currentColor" />}
                    className="h-16 rounded-2xl bg-slate-pro hover:!bg-gray-800 border-none font-bold text-lg flex items-center justify-center gap-2"
                    onClick={() => handleTrigger(HELLO_WORLD_BLOB_ID, "hello_world")}
                  >
                    Execute Now
                  </Button>
                </Card>
              </Col>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
