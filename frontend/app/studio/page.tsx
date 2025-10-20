'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { studioAPI, walletAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import TemplateSelector from '@/components/studio/TemplateSelector';
import {
  Sparkles,
  Wand2,
  Zap,
  Image as ImageIcon,
  Loader,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  Download,
  Users,
  FolderOpen,
} from 'lucide-react';

interface GenerationState {
  status: 'idle' | 'enhancing' | 'generating' | 'complete' | 'error';
  jobId?: string;
  originalPrompt: string;
  enhancedPrompt: string;
  imageUrl?: string;
  error?: string;
  creditsUsed?: number;
}

export default function StudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState('');
  const [tier, setTier] = useState<'standard' | 'premium2' | 'premium4'>('standard');
  const [provider, setProvider] = useState<string>('auto');
  const [creditsBalance, setCreditsBalance] = useState(0);
  const [generation, setGeneration] = useState<GenerationState>({
    status: 'idle',
    originalPrompt: '',
    enhancedPrompt: '',
  });
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [creditsToBuy, setCreditsToBuy] = useState<number>(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [sourcePostId, setSourcePostId] = useState<number | null>(null);
  const [isRemix, setIsRemix] = useState(false);

  const tierCosts = {
    standard: 1,
    premium2: 2,
    premium4: 4,
  };

  // Check for remix parameters in URL
  useEffect(() => {
    const remixPrompt = searchParams.get('prompt');
    const sourcePost = searchParams.get('source_post');

    if (remixPrompt) {
      setPrompt(remixPrompt);
      setIsRemix(true);
      toast.success('Remix prompt loaded! Generate to create your version.');
    }

    if (sourcePost) {
      setSourcePostId(parseInt(sourcePost));
    }
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      try {
        const [creditsRes, walletRes] = await Promise.all([
          studioAPI.getCreditsBalance(),
          walletAPI.getWallet(),
        ]);
        setCreditsBalance(creditsRes.data.credits);
        setWalletBalance(walletRes.data.balance);
      } catch (error: any) {
        console.error('Failed to load balances:', error);
        const msg = typeof error?.normalizedMessage === 'string' ? error.normalizedMessage : 'Failed to load balances';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const refreshBalances = async () => {
    try {
      const [creditsRes, walletRes] = await Promise.all([
        studioAPI.getCreditsBalance(),
        walletAPI.getWallet(),
      ]);
      setCreditsBalance(creditsRes.data.credits);
      setWalletBalance(walletRes.data.balance);
    } catch (e) {
      // ignore
    }
  };


  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setGeneration({
      status: 'enhancing',
      originalPrompt: prompt,
      enhancedPrompt: '',
    });

    try {
      const response = await studioAPI.enhancePrompt(prompt);
      const enhanced = response.data.enhanced_prompt;

      // Update the prompt textarea with enhanced prompt
      setPrompt(enhanced);

      setGeneration((prev) => ({
        ...prev,
        status: 'idle',
        enhancedPrompt: enhanced,
      }));
      toast.success('Prompt enhanced!');
    } catch (error: any) {
      const msg = typeof error?.normalizedMessage === 'string' ? error.normalizedMessage : (error?.response?.data?.detail || 'Failed to enhance prompt');
      const safe = typeof msg === 'string' ? msg : JSON.stringify(msg);
      toast.error(safe);
      setGeneration((prev) => ({
        ...prev,
        status: 'error',
        error: safe,
      }));
    }
  };

  const handleGenerateImage = async () => {
    const promptToUse = generation.enhancedPrompt || prompt;
    const cost = tierCosts[tier];

    if (creditsBalance < cost) {
      toast.error(`Insufficient credits. Need ${cost}, have ${creditsBalance}`);
      return;
    }

    setGeneration((prev) => ({
      ...prev,
      status: 'generating',
    }));

    try {
      const response = await studioAPI.generateImage(
        promptToUse,
        tier,
        undefined,
        true,
        false,  // enhance_prompt (already enhanced if needed)
        provider  // Use selected provider
      );

      setGeneration((prev) => ({
        ...prev,
        jobId: response.data.job_id,
        status: 'generating',
      }));

      // Poll for completion
      pollGenerationStatus(response.data.job_id);
    } catch (error: any) {
      const msg = typeof error?.normalizedMessage === 'string' ? error.normalizedMessage : (error?.response?.data?.detail || 'Failed to generate image');
      const safe = typeof msg === 'string' ? msg : JSON.stringify(msg);
      toast.error(safe);
      setGeneration((prev) => ({
        ...prev,
        status: 'error',
        error: safe,
      }));
    }
  };

  const pollGenerationStatus = async (jobId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await studioAPI.getGenerationStatus(jobId);

        if (response.data.status === 'succeeded' || response.data.status === 'completed') {
          setGeneration((prev) => ({
            ...prev,
            status: 'complete',
            imageUrl: response.data.image_url,
            creditsUsed: response.data.credits_used,
          }));
          setCreditsBalance((prev) => prev - response.data.credits_used);
          toast.success('Image generated successfully!');

          // Record remix if this was a remix
          if (isRemix && sourcePostId && response.data.image_id) {
            try {
              await studioAPI.recordRemix(sourcePostId, response.data.image_id);
              toast.success('Remix recorded! Original creator will be rewarded.');
              setIsRemix(false);
              setSourcePostId(null);
            } catch (error) {
              console.error('Failed to record remix:', error);
            }
          }
        } else if (response.data.status === 'failed') {
          setGeneration((prev) => ({
            ...prev,
            status: 'error',
            error: response.data.error || 'Generation failed',
          }));
          toast.error('Image generation failed');
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 5000);
        } else {
          setGeneration((prev) => ({
            ...prev,
            status: 'error',
            error: 'Generation timeout',
          }));
          toast.error('Generation timeout');
        }
      } catch (error: any) {
        console.error('Poll error:', error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 5000);
        }
      }
    };

    poll();
  };

  const handleReset = () => {
    // Keep the prompt text, only reset generation state
    setGeneration({
      status: 'idle',
      originalPrompt: '',
      enhancedPrompt: '',
    });
  };

  const handleClearAll = () => {
    // Clear everything including prompt
    setPrompt('');
    setGeneration({
      status: 'idle',
      originalPrompt: '',
      enhancedPrompt: '',
    });
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setPrompt(template.prompt_text);
    setShowTemplates(false);
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    setPrompt('');
  };;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                  <Sparkles className="w-10 h-10 text-primary-500" />
                  Creative Studio
                </h1>
                <p className="text-slate-600 mt-2">
                  Generate stunning AI images with enhanced prompts
                </p>
              </div>
              <div className="text-right space-y-1">
                <div>
                  <div className="text-sm text-slate-600">Credits Balance</div>
                  <div className="text-3xl font-bold text-primary-600">
                    {creditsBalance}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/studio/community')}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Community Gallery
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/studio/my-creations')}
                className="flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                My Creations
              </Button>
            </div>
          </motion.div>

          {/* Template Selector Panel */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Choose a Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TemplateSelector
                      onSelectTemplate={handleSelectTemplate}
                      selectedTemplateId={selectedTemplate?.id}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Create Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Remix Indicator */}
                  {isRemix && sourcePostId && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">
                          Remixing Community Post #{sourcePostId}
                        </span>
                      </div>
                      <p className="text-xs text-purple-700 mt-1">
                        Original creator will be rewarded when you generate!
                      </p>
                    </div>
                  )}

                  {/* Template Selection */}
                  {selectedTemplate && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <ImageIcon className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                              Using Template
                            </span>
                          </div>
                          <p className="text-sm text-blue-700 font-medium">
                            {selectedTemplate.title}
                          </p>
                          {selectedTemplate.category_name && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                              {selectedTemplate.category_name}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={handleClearTemplate}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setShowTemplates(!showTemplates)}
                    variant="outline"
                    className="w-full"
                    disabled={generation.status !== 'idle'}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {showTemplates ? 'Hide Templates' : 'Browse Templates'}
                    {showTemplates ? (
                      <ChevronUp className="w-4 h-4 ml-auto" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    )}
                  </Button>

                  {/* Prompt Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
                      <span>Your Prompt</span>
                      {generation.enhancedPrompt && (
                        <Badge variant="default" className="bg-green-500 text-white text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Enhanced
                        </Badge>
                      )}
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the image you want to create..."
                      className={`w-full h-24 p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                        generation.enhancedPrompt
                          ? 'border-green-400 bg-green-50'
                          : 'border-slate-300'
                      }`}
                      disabled={generation.status !== 'idle'}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-500">
                        Min 10 characters
                      </p>
                      {generation.originalPrompt && generation.enhancedPrompt && (
                        <button
                          onClick={() => {
                            setPrompt(generation.originalPrompt);
                            setGeneration(prev => ({ ...prev, enhancedPrompt: '' }));
                            toast.info('Reverted to original prompt');
                          }}
                          className="text-xs text-primary-600 hover:text-primary-700 underline"
                        >
                          Revert to original
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Provider Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Image Provider
                    </label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={generation.status !== 'idle'}
                    >
                      <option value="auto">🤖 Auto (Best Available)</option>
                      <option value="openai_dalle">🎨 OpenAI DALL-E 3 (High Quality)</option>
                      <option value="huggingface">🤗 Hugging Face (Free Tier)</option>
                      <option value="gemini_nano_banana">🍌 Gemini Nano Banana</option>
                      <option value="mock">🎭 Mock (Testing)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {provider === 'auto' && '✨ Automatically selects the best available provider'}
                      {provider === 'openai_dalle' && '💰 ~$0.04 per image, best quality'}
                      {provider === 'huggingface' && '🆓 Free tier: 1000 calls/day'}
                      {provider === 'gemini_nano_banana' && '⚡ Fast, may hit quota limits'}
                      {provider === 'mock' && '🧪 For testing without API calls'}
                    </p>
                  </div>

                  {/* Tier Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Quality Tier
                    </label>
                    <div className="space-y-2">
                      {Object.entries(tierCosts).map(([tierKey, cost]) => (
                        <button
                          key={tierKey}
                          onClick={() =>
                            setTier(tierKey as 'standard' | 'premium2' | 'premium4')
                          }
                          className={`w-full p-3 rounded-lg border-2 transition-all ${
                            tier === tierKey
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                          disabled={generation.status !== 'idle'}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">
                              {tierKey === 'premium2'
                                ? 'Premium (2K)'
                                : tierKey === 'premium4'
                                  ? 'Premium (4K)'
                                  : 'Standard'}
                            </span>
                            <Badge variant="secondary">{cost} credits</Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                      {/* Buy Credits from Wallet */}
                      <div className="mt-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Wallet Balance</span>
                          <span className="text-sm font-bold">₹{walletBalance.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-3">Conversion: ₹5 = 1 credit</div>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            min={1}
                            placeholder="Credits"
                            value={creditsToBuy || ''}
                            onChange={(e) => setCreditsToBuy(parseInt(e.target.value || '0', 10))}
                            className="w-28"
                            disabled={generation.status !== 'idle'}
                          />
                          <Button
                            variant="secondary"
                            disabled={generation.status !== 'idle' || !creditsToBuy || creditsToBuy <= 0}
                            onClick={async () => {
                              try {
                                const idk = `buy-${Date.now()}`;
                                await studioAPI.purchaseCredits(creditsToBuy, idk);
                                toast.success(`Purchased ${creditsToBuy} credits`);
                                setCreditsToBuy(0);
                                await refreshBalances();
                              } catch (error: any) {
                                const msg = typeof error?.normalizedMessage === 'string' ? error.normalizedMessage : (error?.response?.data?.detail || 'Purchase failed');
                                const safe = typeof msg === 'string' ? msg : JSON.stringify(msg);
                                toast.error(safe);
                              }
                            }}
                          >
                            Buy
                          </Button>
                          <div className="text-xs text-slate-500 ml-2">Cost: ₹{((creditsToBuy || 0) * 5).toFixed(2)}</div>
                        </div>
                      </div>


                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4">
                    <Button
                      onClick={handleEnhancePrompt}
                      disabled={
                        !prompt.trim() || generation.status === 'enhancing' || generation.status === 'generating'
                      }
                      className="w-full"
                      variant="outline"
                    >
                      {generation.status === 'enhancing' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {generation.enhancedPrompt ? 'Re-enhance Prompt' : 'Enhance Prompt'}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleGenerateImage}
                      disabled={
                        !prompt.trim() ||
                        generation.status !== 'idle' ||
                        creditsBalance < tierCosts[tier]
                      }
                      className="w-full bg-primary-600 hover:bg-primary-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Image
                    </Button>
                    {generation.status !== 'idle' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleReset}
                          variant="ghost"
                          className="flex-1"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          New Generation
                        </Button>
                        <Button
                          onClick={handleClearAll}
                          variant="outline"
                          className="flex-1"
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Preview Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <AnimatePresence mode="wait">
                {generation.status === 'idle' ? (
                  <Card key="idle" className="h-full flex items-center justify-center min-h-96">
                    <div className="text-center">
                      <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">
                        Enter a prompt and click "Generate Image" to create
                      </p>
                    </div>
                  </Card>
                ) : generation.status === 'enhancing' ? (
                  <Card key="enhancing" className="h-full flex items-center justify-center min-h-96">
                    <div className="text-center">
                      <Loader className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                      <p className="text-slate-600">Enhancing your prompt...</p>
                    </div>
                  </Card>
                ) : generation.status === 'generating' ? (
                  <Card key="generating" className="h-full flex items-center justify-center min-h-96">
                    <div className="text-center">
                      <Loader className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                      <p className="text-slate-600">Generating your image...</p>
                      <p className="text-sm text-slate-500 mt-2">
                        This may take a minute
                      </p>
                    </div>
                  </Card>
                ) : generation.status === 'complete' ? (
                  <Card key="complete" className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        Image Generated
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {generation.imageUrl && (
                        <div className="relative rounded-lg overflow-hidden bg-slate-100">
                          <img
                            src={generation.imageUrl.startsWith('http') ? generation.imageUrl : `http://localhost:8000${generation.imageUrl}`}
                            alt="Generated"
                            className="w-full h-auto"
                            onError={(e) => {
                              console.error('Failed to load image:', generation.imageUrl);
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="18"%3EImage failed to load%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            Original Prompt
                          </label>
                          <div className="flex gap-2 mt-1">
                            <input
                              type="text"
                              value={generation.originalPrompt}
                              readOnly
                              className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded text-sm"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleCopyPrompt(generation.originalPrompt)
                              }
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {generation.enhancedPrompt && (
                          <div>
                            <label className="text-sm font-medium text-slate-700">
                              Enhanced Prompt
                            </label>
                            <div className="flex gap-2 mt-1">
                              <input
                                type="text"
                                value={generation.enhancedPrompt}
                                readOnly
                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded text-sm"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleCopyPrompt(generation.enhancedPrompt)
                                }
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {generation.imageUrl && (
                          <Button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = generation.imageUrl!;
                              link.download = `ai-image-${Date.now()}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              toast.success('Download started');
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                        <Button
                          onClick={() => router.push('/studio/my-creations')}
                          className="flex-1"
                        >
                          View My Creations
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card key="error" className="h-full flex items-center justify-center min-h-96 border-red-200 bg-red-50">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-700 font-medium">
                        {generation.error || 'An error occurred'}
                      </p>
                    </div>
                  </Card>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

