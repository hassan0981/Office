"use client";

import { Download, Chrome, Puzzle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function SettingsPage() {
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
                <Puzzle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-charcoal-900">FocusFlow Chrome Extension</CardTitle>
                <CardDescription className="text-charcoal-500">
                  Supercharge your productivity by keeping track of your focus sessions with a beautiful browser Pomodoro timer.
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
                    <h5 className="font-semibold text-charcoal-800 text-sm">Start Focusing</h5>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Click the extension's puzzle icon in Chrome. Now, you can open the extension and start focusing with the Pomodoro timer!
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
