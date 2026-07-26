"use client";

import { useEffect, useState } from "react";
import { Key, Copy, Check, RotateCcw, AlertTriangle, Eye, EyeOff, Download, Chrome, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getApiTokenAction,
  generateApiTokenAction,
  revokeApiTokenAction,
} from "@/app/actions/settings";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const isMasked = token ? token.includes("•") : false;

  useEffect(() => {
    async function loadToken() {
      setIsLoading(true);
      const res = await getApiTokenAction();
      if (res.token) {
        setToken(res.token);
      }
      setIsLoading(false);
    }
    loadToken();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const res = await generateApiTokenAction();
    setIsGenerating(false);
    if (res.success && res.token) {
      setToken(res.token);
      setShowToken(true);
      toast.success("API access token generated successfully!");
    } else {
      toast.error(res.error || "Failed to generate token");
    }
  };

  const handleRevoke = async () => {
    if (!confirm("Are you sure you want to revoke this API token? Any applications (like FocusFlow) using it will be immediately disconnected.")) {
      return;
    }
    setIsRevoking(true);
    const res = await revokeApiTokenAction();
    setIsRevoking(false);
    if (res.success) {
      setToken(null);
      setShowToken(false);
      toast.success("API token revoked.");
    } else {
      toast.error(res.error || "Failed to revoke token");
    }
  };

  const handleCopy = () => {
    if (!token) return;
    if (isMasked) {
      toast.error("This token is masked for security. Generate a new token to copy a fresh one.");
      return;
    }
    navigator.clipboard.writeText(token);
    setIsCopied(true);
    toast.success("Token copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Settings Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-charcoal-900 sm:text-4xl">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-charcoal-500">
          Manage your account configurations and external application integrations.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border border-cream-300 bg-white shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-cream-200 bg-cream-50/50 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta-100 text-terracotta-600">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-charcoal-900">API Access Token</CardTitle>
                <CardDescription className="text-charcoal-500">
                  Authenticate the FocusFlow Chrome Extension or other API clients.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {isLoading ? (
              <div className="space-y-2 py-4">
                <div className="h-4 bg-cream-100 rounded animate-pulse w-1/3" />
                <div className="h-10 bg-cream-100 rounded animate-pulse w-full" />
              </div>
            ) : token ? (
              <div className="space-y-6">
                <div className="rounded-2xl bg-cream-50/60 border border-cream-200 p-4 sm:p-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
                    Your API Token
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                      <input
                        type={showToken ? "text" : "password"}
                        readOnly
                        value={token}
                        className="w-full bg-white border border-cream-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-mono text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 focus:outline-none"
                      >
                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      size="icon"
                      className="h-[42px] w-[42px] border-cream-200 hover:bg-cream-100 hover:text-charcoal-900 rounded-xl flex-shrink-0"
                    >
                      {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  {isMasked ? (
                    <p className="mt-2 text-xs text-amber-600 font-medium">
                      Note: This token is masked for security. It can only be copied when first generated. If you lost it, click Revoke below and generate a new one.
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-charcoal-400">
                      Keep this token secure! Copy it now, as you won't be able to see it again after navigating away.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-red-200/60 bg-red-50/30 p-4 sm:p-5">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-red-900">Revoke Token</h4>
                      <p className="text-xs text-red-700 mt-0.5">
                        If your token is compromised, revoking it will immediately terminate active API sync sessions.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRevoke}
                    variant="outline"
                    isLoading={isRevoking}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 rounded-xl sm:self-center"
                  >
                    Revoke Access
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed border-cream-300 rounded-2xl p-8 text-center bg-cream-50/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cream-100 text-charcoal-500 mb-4">
                  <Key className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900">No active API token</h3>
                <p className="mt-1 text-sm text-charcoal-500 max-w-sm">
                  Generate an API Access Token to securely sync your pending tasks with the FocusFlow Chrome Extension.
                </p>
                <Button
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  className="mt-5 gap-2 bg-terracotta-500 text-white hover:bg-terracotta-600 shadow-md shadow-terracotta-500/10 rounded-xl"
                >
                  <RotateCcw className="h-4 w-4" /> Generate API Token
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border border-cream-300 bg-white shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-cream-200 bg-cream-50/50 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta-100 text-terracotta-600">
                <Puzzle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-charcoal-900">FocusFlow Chrome Extension</CardTitle>
                <CardDescription className="text-charcoal-500">
                  Supercharge your productivity by syncing your tasks with a beautiful Pomodoro browser extension.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-cream-50/40 border border-cream-200">
              <div className="space-y-1">
                <h4 className="font-bold text-charcoal-900 flex items-center gap-2">
                  <Chrome className="h-4 w-4 text-terracotta-500" />
                  FocusFlow Extension Bundle
                </h4>
                <p className="text-sm text-charcoal-500 max-w-xl">
                  Download the compiled browser extension bundle (ZIP format). You can install it locally in Chrome in under a minute.
                </p>
              </div>
              <a
                href="/focusflow-extension.zip"
                download="focusflow-extension.zip"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-terracotta-500 text-white hover:bg-terracotta-600 font-semibold text-sm transition-all duration-200 shadow-md shadow-terracotta-500/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              >
                <Download className="h-4 w-4" /> Download Extension
              </a>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-charcoal-900 text-sm uppercase tracking-wider">
                Installation Steps
              </h4>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3 items-start p-4 rounded-xl border border-cream-100 bg-cream-50/20">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream-200 text-xs font-bold text-charcoal-800">
                    1
                  </div>
                  <div>
                    <h5 className="font-semibold text-charcoal-800 text-sm">Download ZIP</h5>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Click the "Download Extension" button above to get the compiled extension bundle.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 rounded-xl border border-cream-100 bg-cream-50/20">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream-200 text-xs font-bold text-charcoal-800">
                    2
                  </div>
                  <div>
                    <h5 className="font-semibold text-charcoal-800 text-sm">Extract Files</h5>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Locate the downloaded `.zip` file on your computer and extract (unzip) its contents to a folder.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 rounded-xl border border-cream-100 bg-cream-50/20">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream-200 text-xs font-bold text-charcoal-800">
                    3
                  </div>
                  <div>
                    <h5 className="font-semibold text-charcoal-800 text-sm">Open Extensions Page</h5>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Open Google Chrome and navigate to <code className="bg-cream-100/80 px-1 py-0.5 rounded text-[11px] font-mono">chrome://extensions</code> in your address bar.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 rounded-xl border border-cream-100 bg-cream-50/20">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream-200 text-xs font-bold text-charcoal-800">
                    4
                  </div>
                  <div>
                    <h5 className="font-semibold text-charcoal-800 text-sm">Developer Mode</h5>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Turn on the **Developer mode** toggle switch in the top-right corner of the Extensions page.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 rounded-xl border border-cream-100 bg-cream-50/20">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream-200 text-xs font-bold text-charcoal-800">
                    5
                  </div>
                  <div>
                    <h5 className="font-semibold text-charcoal-800 text-sm">Load Unpacked</h5>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Click the **Load unpacked** button in the top-left corner, and select the folder you extracted in Step 2.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 rounded-xl border border-cream-100 bg-cream-50/20">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream-200 text-xs font-bold text-charcoal-800">
                    6
                  </div>
                  <div>
                    <h5 className="font-semibold text-charcoal-800 text-sm">Connect & Sync</h5>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Click the extension's puzzle icon in Chrome. Go to the Settings tab, and paste the API Access Token generated above to connect!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
