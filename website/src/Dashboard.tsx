import React, { useEffect, useState } from 'react';
import { Layout, Menu, Typography, Card, Space, Button, notification, Tag, Modal, Form, Input, Upload, message } from 'antd';
import { LayoutDashboard, Code, ShoppingCart, LogOut, Plus, Cpu, User, Activity, Globe, Zap, Terminal, Play, UploadCloud } from 'lucide-react';
import { useCurrentAccount, useDisconnectWallet, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, REGISTRY_ID, HELLO_WORLD_BLOB_ID } from './constants';

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [executionCount, setExecutionCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form] = Form.useForm();

  const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space/v1/store?epochs=1";

  // Polling for events (more reliable than subscribeEvent on public RPCs)
  useEffect(() => {
    if (!client) return;
    
    let cursor: any = null;
    const pollInterval = setInterval(async () => {
      try {
        const { data, nextCursor } = await client.queryEvents({
          query: { MoveModule: { package: PACKAGE_ID, module: 'trigger' } },
          cursor,
          order: 'ascending',
        });

        if (data.length > 0) {
          data.forEach(event => {
            if (event.type.includes('ExecutionTriggered')) {
              setExecutionCount(prev => prev + 1);
              notification.success({
                message: 'New Execution',
                description: `Function "${(event.parsedJson as any).function_name}" triggered.`,
                placement: 'bottomRight',
                icon: <Zap size={18} className="text-amber-500" />,
              });
              setLogs(prev => [`[Blockchain] Event detected: ${event.id.txDigest.slice(0, 10)}...`, ...prev]);
            }
          });
          cursor = nextCursor;
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
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
        tx.pure.string("{}")
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          setLogs(prev => [`[Transaction] Submitted: ${result.digest.slice(0, 10)}...`, ...prev]);
          setIsExecuting(false);
        },
        onError: (err) => {
          notification.error({ message: 'Execution Failed', description: err.message });
          setIsExecuting(false);
        }
      }
    );
  };

  const handleRegister = (values: { functionName: string; blobId: string }) => {
    if (!account) return;
    
    setIsRegistering(true);
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::trigger::register_function`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.string(values.functionName),
        tx.pure.string(values.blobId)
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          notification.success({ 
            message: 'Registration Successful', 
            description: `Function ${values.functionName} has been registered.` 
          });
          setLogs(prev => [`[Transaction] Register Submitted: ${result.digest.slice(0, 10)}...`, ...prev]);
          setIsRegistering(false);
          setIsRegisterModalOpen(false);
          form.resetFields();
        },
        onError: (err) => {
          notification.error({ message: 'Registration Failed', description: err.message });
          setIsRegistering(false);
        }
      }
    );
  };

  const handleWalrusUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setIsUploading(true);

    try {
      const response = await fetch(WALRUS_PUBLISHER, {
        method: 'PUT',
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      
      // Walrus returns either newlyCreated or alreadyCertified
      const blobId = result.newlyCreated?.blobObject?.blobId || result.alreadyCertified?.blobId;
      
      if (!blobId) {
        throw new Error("Could not extract Blob ID from Walrus response");
      }

      // Auto-fill the form
      form.setFieldsValue({ blobId });
      
      message.success(`${file.name} uploaded successfully to Walrus!`);
      onSuccess(result, file);
    } catch (error: any) {
      console.error("Walrus upload error:", error);
      message.error(`${file.name} upload failed: ${error.message}`);
      onError(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-[#F3F4F6]">
      <Sider 
        width={260} 
        className="h-screen sticky top-0 hidden lg:block border-none"
        style={{ background: '#020617' }}
      >
        <div className="flex flex-col h-full">
          <div className="px-8 pt-12 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
                <Cpu size={20} className="text-slate-950" />
              </div>
              <Text className="text-white text-xl font-bold tracking-tight">Sui-Functions</Text>
            </div>
          </div>
          
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            className="bg-transparent border-none px-4 flex-1"
            items={[
              { key: '1', icon: <LayoutDashboard size={18} />, label: 'Overview', className: '!text-slate-400 hover:!text-white' },
              { key: '2', icon: <Code size={18} />, label: 'My Functions', className: '!text-slate-400 hover:!text-white' },
              { key: '3', icon: <ShoppingCart size={18} />, label: 'Marketplace', className: '!text-slate-400 hover:!text-white' },
            ]}
          />

          <div className="p-6 border-t border-white/5">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-white text-[10px] font-bold uppercase opacity-50 tracking-wider">Connected Account</div>
                  <div className="text-white text-xs font-mono truncate">{account?.address}</div>
                </div>
              </div>
              <Button 
                block 
                type="text" 
                onClick={() => disconnect()}
                className="text-slate-400 hover:!text-red-400 hover:!bg-red-400/10 flex items-center justify-start gap-2 h-9 px-2 border-none transition-all"
              >
                <LogOut size={14} /> <span className="text-xs font-bold">Disconnect</span>
              </Button>
            </div>
          </div>
        </div>
      </Sider>

      <Content className="p-6 md:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <Title level={1} className="!m-0 !text-slate-900 !font-extrabold tracking-tight">Dashboard</Title>
              <Text className="text-slate-500 font-medium">Real-time status of your decentralized infrastructure</Text>
            </div>
            <Button 
              type="primary" 
              icon={<Plus size={18} />} 
              onClick={() => setIsRegisterModalOpen(true)}
              className="bg-slate-900 hover:!bg-slate-800 border-none rounded-2xl font-bold h-14 px-8 shadow-xl shadow-slate-900/10"
            >
              Register Function
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard icon={<Activity className="text-blue-500" />} label="Executions" value={executionCount} />
            <StatCard icon={<Globe className="text-emerald-500" />} label="Nodes Active" value={1} />
            <StatCard icon={<Zap className="text-amber-500" />} label="Gas Balance" value="0.00 SUI" />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Logs Section */}
            <div className="xl:col-span-2">
              <Card 
                className="rounded-[32px] border-none shadow-sm h-full overflow-hidden"
                title={<div className="flex items-center gap-2 py-1"><Terminal size={18} className="text-slate-400" /> <Text className="font-bold">Live Execution Logs</Text></div>}
              >
                <div className="bg-slate-950 rounded-2xl p-6 min-h-[400px] font-mono text-sm shadow-inner relative">
                  <div className="absolute top-4 right-4 flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  </div>
                  <div className="mt-4">
                    {logs.map((log, i) => (
                      <div key={i} className="mb-2.5 flex gap-4 animate-in fade-in slide-in-from-left-2">
                        <span className="text-slate-700 select-none w-4">{logs.length - i}</span>
                        <span className={log.includes('Event') ? 'text-blue-400' : 'text-slate-400'}>{log}</span>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <div className="flex flex-col items-center justify-center min-h-[300px] opacity-20">
                        <Activity size={32} className="mb-4" />
                        <Text className="text-slate-400 font-mono">Awaiting blockchain events...</Text>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Actions Section */}
            <div className="xl:col-span-1">
              <Card className="rounded-[32px] border-none shadow-sm p-2">
                <div className="p-6">
                  <Title level={4} className="!mb-2 !font-bold">Quick Trigger</Title>
                  <Paragraph className="text-slate-500 text-sm mb-8 leading-relaxed">
                    Fire a manual execution request to verify your logic across the Walrus storage network.
                  </Paragraph>
                  
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        <Code size={20} className="text-slate-400" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-none">hello_world.js</div>
                        <Tag className="mt-1.5 border-none bg-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-widest px-2">Active</Tag>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 bg-white p-3 rounded-lg border border-slate-100 break-all">
                      {HELLO_WORLD_BLOB_ID}
                    </div>
                  </div>

                  <Button 
                    type="primary" 
                    size="large" 
                    block
                    loading={isExecuting}
                    onClick={() => handleTrigger(HELLO_WORLD_BLOB_ID, "hello_world")}
                    className="h-16 rounded-2xl bg-slate-900 hover:!bg-slate-800 border-none font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20"
                  >
                    <Play size={20} fill="currentColor" /> Execute Now
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Content>

      <Modal
        title={
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-6">
            <Plus size={20} className="text-blue-500" />
            <Text className="text-xl font-extrabold tracking-tight">Register New Function</Text>
          </div>
        }
        open={isRegisterModalOpen}
        onCancel={() => {
          setIsRegisterModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        closeIcon={null}
        className="rounded-[32px] overflow-hidden"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
          requiredMark={false}
        >
          <Form.Item
            name="functionName"
            label={<Text className="font-bold text-slate-700">Function Name</Text>}
            rules={[{ required: true, message: 'Please input a function name' }]}
            extra="e.g., my_price_oracle"
          >
            <Input 
              size="large" 
              placeholder="Enter unique function name"
              className="rounded-xl border-gray-200 bg-gray-50 h-12" 
            />
          </Form.Item>

          <Form.Item
            name="blobId"
            label={<Text className="font-bold text-slate-700">Walrus Blob ID</Text>}
            rules={[{ required: true, message: 'Please input the Walrus Blob ID' }]}
            extra="You can paste an existing ID, or upload a .js file above to generate one."
          >
            <Input 
              size="large" 
              placeholder="e.g., W7VwX2jrIH..." 
              className="rounded-xl border-gray-200 bg-gray-50 h-12 font-mono"
            />
          </Form.Item>

          <div className="mb-6">
            <Upload.Dragger
              name="file"
              customRequest={handleWalrusUpload}
              showUploadList={true}
              accept=".js,.ts"
              maxCount={1}
              className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-slate-400 transition-colors"
            >
              <div className="p-6 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <UploadCloud size={24} className={isUploading ? "text-blue-500 animate-bounce" : "text-slate-400"} />
                </div>
                <div>
                  <Text className="font-bold block text-slate-700">Click or drag file to upload to Walrus</Text>
                  <Text type="secondary" className="text-xs">Supports single .js or .ts files</Text>
                </div>
              </div>
            </Upload.Dragger>
          </div>

          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isRegistering}
            size="large"
            block
            className="mt-4 h-14 rounded-2xl bg-slate-900 hover:!bg-slate-800 border-none font-bold text-lg shadow-lg shadow-slate-900/20"
          >
            Confirm Registration
          </Button>
        </Form>
      </Modal>

    </Layout>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <Card className="rounded-[32px] border-none shadow-sm hover:shadow-md transition-all p-2">
    <div className="flex items-center gap-6 p-4">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
        {React.cloneElement(icon as React.ReactElement, { size: 28 })}
      </div>
      <div>
        <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="text-slate-900 text-3xl font-black tracking-tight">{value}</div>
      </div>
    </div>
  </Card>
);

export default Dashboard;
