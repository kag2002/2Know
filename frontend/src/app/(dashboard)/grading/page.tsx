"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, MessageSquare, Star, ChevronDown, Eye, ThumbsUp, ThumbsDown, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/context/LanguageContext";

interface Submission {
  id: string;
  student: string;
  quiz: string;
  question: string;
  answer: string;
  submittedAt: string;
  maxScore: number;
}

export default function GradingPage() {
  const { t } = useTranslation();
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [graded, setGraded] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPending = async () => {
      try {
        const data = await apiFetch("/grading/pending");
        if (isMounted && data && Array.isArray(data)) setPendingSubmissions(data);
      } catch (err: any) {
        console.error("Failed to load pending gradings", err);
        // Fallback or just empty
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPending();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGrade = async (id: string) => {
    if (scores[id] === undefined) {
      toast.error(t("dashboard.grading.requireScore"));
      return;
    }
    
    try {
      await apiFetch(`/grading/${id}`, {
        method: "POST",
        body: JSON.stringify({ score: scores[id] })
      });
      setGraded(prev => [...prev, id]);
      toast.success(t("dashboard.grading.saveSuccess"));
    } catch (err: any) {
      toast.error(t("dashboard.grading.saveError") + " " + err.message);
    }
  };

  const filtered = pendingSubmissions.filter(s => 
    !graded.includes(s.id) && (
      s.student.toLowerCase().includes(search.toLowerCase()) ||
      s.quiz.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-[60vh] text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p>{t("grading.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("grading.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("grading.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-sm font-semibold border border-amber-200">
            <Clock className="w-4 h-4" /> {filtered.length} {t("grading.pendingCount")}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("grading.pending"), value: filtered.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
          { label: t("grading.gradedToday"), value: graded.length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: t("grading.avgGraded"), value: "7.8", icon: Star, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: t("grading.feedbackSent"), value: Object.keys(feedback).filter(k => feedback[k]).length, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder={t("grading.searchPlaceholder")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-10 w-full rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3"
        />
      </div>

      {/* Submission Queue */}
      <div className="space-y-4">
        {filtered.map((sub) => (
          <Card key={sub.id} className={`shadow-sm transition-all hover:shadow-md ${expanded === sub.id ? 'ring-2 ring-indigo-200' : ''}`}>
            {/* Collapsed Header */}
            <div 
              className="flex items-center justify-between p-5 cursor-pointer"
              onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-sm font-bold">
                  {sub.student.split(' ').pop()?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{sub.student}</p>
                  <p className="text-xs text-muted-foreground">{sub.quiz} • {sub.submittedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-slate-100 text-muted-foreground px-2 py-1 rounded font-medium">{t("grading.maxScore")}: {sub.maxScore} {t("grading.maxScoreUnit")}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expanded === sub.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Expanded Content */}
            {expanded === sub.id && (
              <div className="px-5 pb-5 border-t animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="mt-4 space-y-4">
                  {/* Question */}
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">{t("grading.question")}</p>
                    <p className="text-sm text-slate-700 font-medium">{sub.question}</p>
                  </div>

                  {/* Answer */}
                  <div className="p-4 bg-muted border rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("grading.studentAnswer")}</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{sub.answer}</p>
                  </div>

                  {/* Grading Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">{t("grading.score")} (/{sub.maxScore})</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={sub.maxScore}
                          step={0.5}
                          value={scores[sub.id] ?? ""}
                          onChange={e => setScores({...scores, [sub.id]: parseFloat(e.target.value)})}
                          className="h-10 w-24 px-3 rounded-md border bg-background text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="0"
                        />
                        <span className="text-slate-400 text-sm">/ {sub.maxScore}</span>
                        <div className="flex gap-1 ml-2">
                          <button onClick={() => setScores({...scores, [sub.id]: sub.maxScore})} className="p-1.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100" title={t("grading.maxScoreTooltip")}>
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button onClick={() => setScores({...scores, [sub.id]: 0})} className="p-1.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-100" title={t("grading.zeroScoreTooltip")}>
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">{t("grading.feedbackLabel")}</label>
                      <input
                        type="text"
                        value={feedback[sub.id] ?? ""}
                        onChange={e => setFeedback({...feedback, [sub.id]: e.target.value})}
                        placeholder={t("grading.feedbackPlaceholder")}
                        className="h-10 w-full px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" className="gap-2" onClick={() => setExpanded(null)}>
                      <Eye className="w-4 h-4" /> {t("grading.skip")}
                    </Button>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleGrade(sub.id)}>
                      <CheckCircle2 className="w-4 h-4" /> {t("grading.confirm")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="shadow-sm border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 mx-auto mb-5 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">{t("grading.noMore")}</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">{t("grading.allGraded")}</p>
              <a href="/reports">
                <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  <Star className="w-4 h-4" /> {t("grading.viewReport")}
                </Button>
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
