'use client';

import Link from 'next/link';
import { ArrowLeft, Camera, MapPin, UploadCloud, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from "@/lib/language-context";

export default function ReportIssuePage() {
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/citizen" className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">{t("reportIssueTitle")}</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-8">

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">

            {/* 1. Location */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">{t("locationLabel")}</label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Ghat 4, Varanasi (Detected)</span>
                <button className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-700">{t("change")}</button>
              </div>
            </div>

            {/* 2. Photo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">{t("photoEvidence")}</label>
              <div
                className="h-40 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer flex flex-col items-center justify-center text-center p-4 group"
                onClick={() => setIsUploading(!isUploading)}
              >
                {isUploading ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-blue-600">{t("aiAnalysis")}</p>
                  </div>
                ) : (
                  <>
                    <div className="h-10 w-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center mb-2 transition-colors">
                      <Camera className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">{t("tapToTake")}</p>
                    <p className="text-xs text-slate-400 mt-1">{t("selectGallery")}</p>
                  </>
                )}
              </div>
            </div>

            {/* 3. Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">{t("descriptionLabel")}</label>
              <textarea
                className="w-full h-32 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                placeholder={t("descriptionPlaceholder")}
              ></textarea>
            </div>

            {/* Submit */}
            <button className="w-full py-3.5 bg-[#006DC4] hover:bg-[#005aaff] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">
              {t("submitReport")}
            </button>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {t("aiVerificationNote")}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
