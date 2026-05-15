import React, { useState } from 'react';
import { Button, Card, Steps, Layout, Typography, Space, Tag, List } from 'antd';
import { Play, CheckCircle2, Zap, Shield, Clock, Server, Code, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const App: React.FC = () => {
  const [demoStatus, setDemoStatus] = useState<'idle' | 'running' | 'success'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const runDemo = () => {
    setDemoStatus('running');
    setLogs(['[System] Initializing execution engine...']);
    setCurrentStep(0);
    
    setTimeout(() => {
      setLogs(prev => [...prev, '[Blockchain] Detected ExecutionTriggered event.']);
      setCurrentStep(1);
    }, 1000);

    setTimeout(() => {
      setLogs(prev => [...prev, '[Storage] Fetching code from Walrus Blob: W7VwX...']);
      setCurrentStep(2);
    }, 2500);

    setTimeout(() => {
      setLogs(prev => [...prev, '[Sandbox] Booting isolated-vm environment.']);
      setLogs(prev => [...prev, '[VM] Hello from Sui-Functions!']);
      setCurrentStep(3);
      setDemoStatus('success');
    }, 4500);
  };

  return (
    <Layout className="min-h-screen bg-off-white">
      <Header className="sticky top-0 z-50 flex items-center justify-between px-8 bg-white/70 backdrop-blur-md border-b border-black/5 h-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-pro rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <Text className="text-xl font-bold tracking-tight text-slate-pro">Sui-Functions</Text>
        </div>
        <Space size="large" className="hidden md:flex">
          <Button type="text" className="text-gray-600 font-medium hover:text-slate-pro">Benefits</Button>
          <Button type="text" className="text-gray-600 font-medium hover:text-slate-pro">Demo</Button>
          <Button type="primary" className="bg-slate-pro hover:!bg-gray-800 border-none px-6 rounded-full font-semibold">Get Started</Button>
        </Space>
      </Header>

      <Content className="max-w-6xl mx-auto px-8 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Title className="!text-5xl md:!text-7xl !mb-6 !text-slate-pro !font-extrabold tracking-tight">
              The World's Unstoppable <br /> <span className="text-gray-400">Serverless Network</span>
            </Title>
            <Paragraph className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Deploy once. Run everywhere. Zero maintenance. 
              Build high-performance applications on the trustless foundation of Sui and Walrus.
            </Paragraph>
          </motion.div>

          {/* Animated Process Map */}
          <Card className="rounded-[32px] border-none shadow-sm bg-white p-12 mt-12 overflow-hidden relative">
            <div className="flex flex-col md:flex-row items-center justify-around gap-12 relative z-10">
              <ProcessStep 
                icon={<Zap size={32} />} 
                label="Sui Transaction" 
                active={currentStep >= 0} 
                complete={currentStep > 0} 
              />
              <div className="hidden md:block flex-1 h-[2px] bg-gray-100 relative">
                <motion.div 
                  className="absolute inset-0 bg-slate-pro" 
                  initial={{ width: 0 }}
                  animate={{ width: `${currentStep >= 1 ? 100 : 0}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <ProcessStep 
                icon={<Server size={32} />} 
                label="Walrus Blob" 
                active={currentStep >= 1} 
                complete={currentStep > 1} 
              />
              <div className="hidden md:block flex-1 h-[2px] bg-gray-100 relative">
                <motion.div 
                  className="absolute inset-0 bg-slate-pro" 
                  initial={{ width: 0 }}
                  animate={{ width: `${currentStep >= 2 ? 100 : 0}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <ProcessStep 
                icon={<CheckCircle2 size={32} />} 
                label="Success" 
                active={currentStep >= 3} 
                complete={currentStep >= 3}
                success={currentStep >= 3}
              />
            </div>
          </Card>
        </div>

        {/* The Pitch */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          <FeatureCard 
            icon={<Shield className="text-green-500" />}
            title="Unstoppable"
            description="Your code is distributed globally via Walrus. No single point of failure. No censorship. Just pure uptime."
          />
          <FeatureCard 
            icon={<Zap className="text-amber-500" />}
            title="Low Cost"
            description="Eliminate traditional server costs. Pay only for the compute cycles you actually use with Sui's efficient gas model."
          />
          <FeatureCard 
            icon={<Clock className="text-blue-500" />}
            title="Zero Maintenance"
            description="Forget about patching, scaling, or managing infrastructure. We handle the orchestration; you focus on the logic."
          />
        </div>

        {/* Live Demo Section */}
        <div id="demo" className="bg-gray-100 rounded-[48px] p-8 md:p-20 mb-32">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Tag className="mb-4 bg-white border-none text-slate-pro px-4 py-1 rounded-full font-bold">LIVE DEMO</Tag>
              <Title level={2} className="!text-3xl md:!text-4xl !mb-4">Experience the speed</Title>
              <Paragraph className="text-lg text-gray-500">
                Trigger a decentralized function execution and watch the network respond in real-time.
              </Paragraph>
            </div>

            <Card className="rounded-2xl border-none shadow-2xl overflow-hidden bg-white">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <Space size={4}>
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </Space>
                <Text type="secondary" className="text-xs font-mono font-bold tracking-widest">RUNNER_V1.0.0</Text>
              </div>
              
              <div className="p-8">
                <div className="flex items-center justify-between p-6 bg-off-white rounded-2xl border border-gray-100 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <Code size={24} className="text-gray-400" />
                    </div>
                    <div>
                      <Text className="block font-bold text-lg">hello_world.js</Text>
                      <Text type="secondary" className="text-xs font-mono uppercase">ID: W7VwX...NxQ</Text>
                    </div>
                  </div>
                  <Button 
                    type="primary" 
                    size="large"
                    className={`h-14 px-8 rounded-xl font-bold flex items-center gap-3 transition-all ${
                      demoStatus === 'success' ? 'bg-green-500 border-none' : 'bg-slate-pro border-none hover:!bg-gray-800'
                    }`}
                    onClick={runDemo}
                    loading={demoStatus === 'running'}
                    disabled={demoStatus === 'success'}
                  >
                    {demoStatus === 'idle' ? <Play size={20} fill="currentColor" /> : null}
                    {demoStatus === 'idle' ? 'Execute Now' : demoStatus === 'running' ? 'Executing' : 'Success'}
                  </Button>
                </div>

                <div className="bg-slate-900 rounded-2xl p-8 min-h-[220px] font-mono text-sm leading-relaxed shadow-inner">
                  <AnimatePresence>
                    {logs.map((log, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`mb-2 flex gap-3 ${log.includes('[VM]') ? 'text-green-400' : 'text-slate-400'}`}
                      >
                        <span className="opacity-30 select-none">{i + 1}</span>
                        <span>{log}</span>
                      </motion.div>
                    ))}
                    {logs.length === 0 && (
                      <Text type="secondary" className="opacity-30">Waiting for trigger...</Text>
                    )}
                  </AnimatePresence>
                  {demoStatus === 'success' && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-6 pt-6 border-t border-white/5"
                    >
                      <Tag color="success" className="rounded-full px-4 py-1 border-none bg-green-500/20 text-green-400 font-bold">COMPLETED</Tag>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Content>

      <Footer className="bg-white border-t border-black/5 py-12 text-center">
        <Space direction="vertical" size="middle">
          <div className="flex items-center justify-center gap-2 opacity-50">
            <div className="w-5 h-5 bg-slate-pro rounded flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <Text className="font-bold">Sui-Functions</Text>
          </div>
          <Text type="secondary">Built for the Sui Overflow 2026 Hackathon. The future is unstoppable.</Text>
        </Space>
      </Footer>
    </Layout>
  );
};

const ProcessStep = ({ icon, label, active, complete, success }: any) => (
  <div className="flex flex-col items-center gap-4 relative">
    <motion.div 
      className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
        success ? 'bg-green-500 text-white shadow-lg shadow-green-500/40' : 
        active ? 'bg-slate-pro text-white shadow-xl shadow-slate-pro/20' : 
        'bg-gray-50 text-gray-300'
      }`}
      animate={active ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: active && !complete ? Infinity : 0, duration: 2 }}
    >
      {complete && !success ? <CheckCircle2 size={32} /> : icon}
    </motion.div>
    <Text className={`font-bold text-sm uppercase tracking-wider ${active ? 'text-slate-pro' : 'text-gray-300'}`}>{label}</Text>
  </div>
);

const FeatureCard = ({ icon, title, description }: any) => (
  <Card className="rounded-3xl border border-black/5 shadow-sm hover:shadow-xl transition-all duration-300 p-4">
    <div className="p-4 bg-gray-50 rounded-2xl w-fit mb-6">
      {React.cloneElement(icon, { size: 32 })}
    </div>
    <Title level={4} className="!mb-4 !text-slate-pro">{title}</Title>
    <Paragraph className="text-gray-500 leading-relaxed m-0">
      {description}
    </Paragraph>
  </Card>
);

export default App;
