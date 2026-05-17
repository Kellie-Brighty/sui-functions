import React, { useEffect, useState } from 'react';
import { Layout, Menu, Typography, Card, Space, Button, notification, Tag, Modal, Form, Input, Upload, message } from 'antd';
import { LayoutDashboard, Code, ShoppingCart, LogOut, Plus, Cpu, User, Activity, Globe, Zap, Terminal, Play, UploadCloud, Trash2, CheckCircle } from 'lucide-react';
import { useCurrentAccount, useDisconnectWallet, useSuiClient, useSignAndExecuteTransaction, useSuiClientQuery } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, REGISTRY_ID } from './constants';

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
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [isBlobIdLocked, setIsBlobIdLocked] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [activeMenu, setActiveMenu] = useState('1');
  const [triggerFunctionName, setTriggerFunctionName] = useState("hello_world");
  const [form] = Form.useForm();
  
  // My Functions State
  const [myFunctions, setMyFunctions] = useState<{name: string, blobId: string, version: string}[]>([]);
  const [isLoadingFunctions, setIsLoadingFunctions] = useState(false);

  const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=1";

  // Fetch SUI Balance
  const { data: balanceData } = useSuiClientQuery(
    'getBalance',
    { owner: account?.address as string },
    { enabled: !!account?.address, refetchInterval: 10000 }
  );

  const suiBalance = balanceData ? (Number(balanceData.totalBalance) / 1e9).toFixed(2) : "0.00";

  // Polling for events (more reliable than subscribeEvent on public RPCs)
  useEffect(() => {
    if (!client) return;
    
    let cursor: any = null;
    let isInitialLoad = true;
    let seenDigests = new Set();

    const pollInterval = setInterval(async () => {
      try {
        const { data, nextCursor } = await client.queryEvents({
          query: { MoveModule: { package: PACKAGE_ID, module: 'trigger' } },
          cursor,
          order: 'ascending',
        });

        if (data.length > 0) {
          const newLogs: string[] = [];
          
          data.forEach(event => {
            if (!seenDigests.has(event.id.txDigest)) {
              seenDigests.add(event.id.txDigest);
              const funcName = (event.parsedJson as any).function_name;

              if (event.type.includes('ExecutionTriggered')) {
                newLogs.push(`[Blockchain] Event detected: ${event.id.txDigest.slice(0, 10)}... (${funcName})`);
                
                if (!isInitialLoad) {
                  notification.success({
                    message: 'New Execution',
                    description: `Function "${funcName}" triggered.`,
                    placement: 'bottomRight',
                    icon: <Zap size={18} className="text-amber-500" />,
                  });
                }
              } else if (event.type.includes('ExecutionCompleted')) {
                const result = (event.parsedJson as any).result_data;
                newLogs.push(`[Blockchain] Success: ${funcName} -> ${result.slice(0, 30)}${result.length > 30 ? '...' : ''}`);
                
                if (!isInitialLoad) {
                  notification.info({
                    message: 'Execution Completed',
                    description: `Function "${funcName}" returned: ${result}`,
                    placement: 'bottomRight',
                    icon: <CheckCircle size={18} className="text-emerald-500" />,
                  });
                }
              }
            }
          });

          if (newLogs.length > 0) {
            setExecutionCount(prev => prev + newLogs.length);
            setLogs(prev => [...newLogs.reverse(), ...prev]);
          }
          
          cursor = nextCursor;
        }
        isInitialLoad = false;
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [client]);

  // Fetch functions from Registry
  const fetchMyFunctions = async () => {
    if (!client || !account) return;
    setIsLoadingFunctions(true);
    try {
      // 1. Get the Registry Object to find the Table ID
      const registryObj = await client.getObject({
        id: REGISTRY_ID,
        options: { showContent: true }
      });
      
      const content = registryObj.data?.content as any;
      const tableId = content?.fields?.functions?.fields?.id?.id;
      
      if (!tableId) {
        setIsLoadingFunctions(false);
        return;
      }

      // 2. Get all dynamic fields (the keys of the table)
      const dynamicFields = await client.getDynamicFields({
        parentId: tableId
      });

      // 3. Fetch the actual object for each key to get Walrus Blob ID
      const functionsList = [];
      for (const field of dynamicFields.data) {
        const fieldObj = await client.getDynamicFieldObject({
          parentId: tableId,
          name: field.name
        });
        
        const fieldContent = fieldObj.data?.content as any;
        const metadata = fieldContent?.fields?.value?.fields;
        
        // Filter by owner
        if (metadata && metadata.owner === account.address) {
          functionsList.push({
            name: field.name.value as string,
            blobId: metadata.walrus_blob_id,
            version: metadata.version
          });
        }
      }
      
      setMyFunctions(functionsList);
    } catch (error) {
      console.error("Error fetching functions:", error);
    } finally {
      setIsLoadingFunctions(false);
    }
  };

  useEffect(() => {
    if (activeMenu === '2') {
      fetchMyFunctions();
    }
  }, [activeMenu, account, client]);

  const handleTrigger = (functionName: string) => {
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
          setIsBlobIdLocked(false);
          setUploadedFileName("");
          form.resetFields();
        },
        onError: (err) => {
          notification.error({ message: 'Registration Failed', description: err.message });
          setIsRegistering(false);
        }
      }
    );
  };

  const handleWalrusUpload = (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    setIsUploading(true);
    setUploadPercentage(0);

    let currentVisualPercent = 0;
    let targetPercent = 0;

    // Visual tweening: smoothly chase the true network target
    const visualInterval = setInterval(() => {
      if (currentVisualPercent < targetPercent) {
        // Increment smoothly (takes ~500ms to jump 0->99 for tiny files)
        currentVisualPercent += 5 + Math.floor(Math.random() * 8); 
        if (currentVisualPercent > targetPercent) {
          currentVisualPercent = targetPercent;
        }
        setUploadPercentage(currentVisualPercent);
        onProgress({ percent: currentVisualPercent });
      }
    }, 30);

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', WALRUS_PUBLISHER, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        // Update the true network target
        targetPercent = Math.floor((e.loaded / e.total) * 99);
      }
    };

    xhr.onload = () => {
      clearInterval(visualInterval);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          setUploadPercentage(100);
          onProgress({ percent: 100 });
          
          const result = JSON.parse(xhr.responseText);
          
          // Walrus returns either newlyCreated or alreadyCertified
          const blobId = result.newlyCreated?.blobObject?.blobId || result.alreadyCertified?.blobId;
          
          if (!blobId) {
            throw new Error("Could not extract Blob ID from Walrus response");
          }

          // Auto-fill the form and lock it
          form.setFieldsValue({ blobId });
          setIsBlobIdLocked(true);
          setUploadedFileName(file.name);
          
          message.success(`${file.name} uploaded successfully to Walrus!`);
          onSuccess(result, file);
        } catch (error: any) {
          console.error("Walrus response parsing error:", error);
          message.error(`${file.name} upload failed: ${error.message}`);
          onError(error);
        }
      } else {
        const error = new Error(`Upload failed with status ${xhr.status}`);
        console.error("Walrus upload HTTP error:", error);
        message.error(`${file.name} upload failed: ${error.message}`);
        onError(error);
      }
      setIsUploading(false);
    };

    xhr.onerror = () => {
      clearInterval(visualInterval);
      const error = new Error("Network error occurred during upload.");
      console.error("Walrus upload Network error:", error);
      message.error(`${file.name} upload failed: Network Error`);
      onError(error);
      setIsUploading(false);
    };

    xhr.send(file);
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
            selectedKeys={[activeMenu]}
            onSelect={({ key }) => setActiveMenu(key)}
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

          {activeMenu === '1' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard icon={<Activity className="text-blue-500" />} label="Executions" value={executionCount} />
                <StatCard icon={<Globe className="text-emerald-500" />} label="Nodes Active" value={1} />
                <StatCard icon={<Zap className="text-amber-500" />} label="Gas Balance" value={`${suiBalance} SUI`} />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Logs Section */}
                <div className="xl:col-span-2">
                  <Card 
                    className="rounded-[32px] border-none shadow-sm h-full overflow-hidden"
                    title={<div className="flex items-center gap-2 py-1"><Terminal size={18} className="text-slate-400" /> <Text className="font-bold">Live Execution Logs</Text></div>}
                  >
                    <div className="bg-slate-950 rounded-2xl p-6 h-[550px] flex flex-col font-mono text-sm shadow-inner relative">
                      <div className="absolute top-4 right-4 flex gap-1.5 z-10 bg-slate-950 pl-2 pb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2 mt-4 scrollbar-thin scrollbar-thumb-slate-800">
                        {logs.map((log, i) => (
                          <div key={i} className="mb-2.5 flex gap-4 animate-in fade-in slide-in-from-left-2">
                            <span className="text-slate-700 select-none w-6 text-right">{logs.length - i}</span>
                            <span className={log.includes('Event') ? 'text-blue-400' : 'text-slate-400'}>{log}</span>
                          </div>
                        ))}
                        {logs.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                            <Activity size={32} className="mb-4 animate-pulse" />
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
                      
                      <div className="mb-8">
                        <Text className="font-bold text-slate-700 block mb-2">Target Function</Text>
                        <Input 
                          size="large" 
                          value={triggerFunctionName}
                          onChange={(e) => setTriggerFunctionName(e.target.value)}
                          placeholder="e.g., my_test_upload"
                          prefix={<Code size={16} className="text-slate-400 mr-2" />}
                          className="rounded-xl border-gray-200 bg-gray-50 h-12 font-mono"
                        />
                      </div>

                      <Button 
                        type="primary" 
                        size="large" 
                        block
                        loading={isExecuting}
                        onClick={() => handleTrigger(triggerFunctionName)}
                        className="h-16 rounded-2xl bg-slate-900 hover:!bg-slate-800 border-none font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20"
                      >
                        <Play size={20} fill="currentColor" /> Execute Now
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}

          {activeMenu === '2' && (
            <div className="bg-white rounded-[32px] shadow-sm p-8 min-h-[500px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <Title level={3} className="!m-0 !font-bold">My Registered Functions</Title>
                  <Text className="text-slate-500">Functions you've deployed to Walrus and registered on Sui.</Text>
                </div>
                <Button onClick={fetchMyFunctions} loading={isLoadingFunctions}>Refresh</Button>
              </div>

              {isLoadingFunctions ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
                  <Text className="font-bold">Fetching from Sui Registry...</Text>
                </div>
              ) : myFunctions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <Code size={48} className="mb-4 text-slate-300" />
                  <Text className="font-bold text-lg text-slate-500">No functions found</Text>
                  <Text className="text-slate-400">Register a new function to see it here.</Text>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myFunctions.map((fn, idx) => (
                    <div key={idx} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 hover:border-blue-200 hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => {
                      setTriggerFunctionName(fn.name);
                      setActiveMenu('1');
                    }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <Code size={18} className="text-blue-500" />
                          </div>
                          <Text className="font-bold text-lg">{fn.name}</Text>
                        </div>
                        <Tag color="blue" className="rounded-full px-3 m-0 font-bold border-none">v{fn.version}</Tag>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                        <Text className="text-xs text-slate-400 font-mono truncate mr-4">Blob ID: {fn.blobId}</Text>
                        <Play size={14} className="text-slate-300 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
          setIsBlobIdLocked(false);
          setUploadedFileName("");
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

          {uploadedFileName ? (
            <div className="mb-6 p-5 border border-green-200 bg-green-50 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Code size={18} className="text-green-600" />
                </div>
                <div>
                  <Text className="font-bold block text-slate-800">{uploadedFileName}</Text>
                  <Text className="text-xs text-green-600 font-medium">Successfully uploaded</Text>
                </div>
              </div>
              <Button 
                type="text" 
                danger 
                icon={<Trash2 size={18} />} 
                onClick={() => {
                  setUploadedFileName("");
                  form.setFieldsValue({ blobId: "" });
                  setIsBlobIdLocked(false);
                }}
                className="hover:bg-red-100/50"
              />
            </div>
          ) : (
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
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                        <Text className="font-bold text-blue-500">{uploadPercentage}%</Text>
                      </div>
                      <Text className="font-bold text-slate-700">Uploading to Walrus...</Text>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <UploadCloud size={24} className="text-slate-400" />
                      </div>
                      <div>
                        <Text className="font-bold block text-slate-700">Click or drag file to upload to Walrus</Text>
                        <Text type="secondary" className="text-xs">Supports single .js or .ts files</Text>
                      </div>
                    </>
                  )}
                </div>
              </Upload.Dragger>
            </div>
          )}

          <Form.Item
            name="blobId"
            label={<Text className="font-bold text-slate-700">Walrus Blob ID</Text>}
            rules={[{ required: true, message: 'Please input the Walrus Blob ID' }]}
            extra="You can paste an existing ID, or upload a .js file above to generate one."
          >
            <Input 
              size="large" 
              placeholder="e.g., W7VwX2jrIH..." 
              readOnly={isBlobIdLocked}
              className={`rounded-xl border-gray-200 h-12 font-mono ${isBlobIdLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-50'}`}
            />
          </Form.Item>

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
