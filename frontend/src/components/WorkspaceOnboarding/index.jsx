import { useState, useEffect, useCallback } from "react";
import {
  FileArrowUp,
  Database,
  ChatText,
  GearSix,
  Lightning,
  CheckCircle,
  X,
} from "@phosphor-icons/react";
import WorkspaceOnboarding from "@/models/workspaceOnboarding";

const STEPS = [
  {
    key: "uploadedDoc",
    label: "Upload first document",
    icon: FileArrowUp,
    required: true,
  },
  {
    key: "embeddedDoc",
    label: "Embed document",
    icon: Database,
    required: true,
  },
  {
    key: "sentFirstMessage",
    label: "Send first message",
    icon: ChatText,
    required: true,
  },
  {
    key: "configuredPrompt",
    label: "Configure system prompt",
    icon: GearSix,
    required: true,
  },
  {
    key: "enabledAgentSkill",
    label: "Enable agent skill",
    icon: Lightning,
    required: false,
  },
];

export default function WorkspaceOnboardingChecklist({ workspace }) {
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const fetchOnboarding = useCallback(async () => {
    if (!workspace?.slug) return;
    const data = await WorkspaceOnboarding.getOnboarding(workspace.slug);
    setOnboarding(data);
    setLoading(false);
  }, [workspace?.slug]);

  useEffect(() => {
    fetchOnboarding();
  }, [fetchOnboarding]);

  if (loading || !onboarding) return null;
  if (onboarding.skipped || onboarding.completed || dismissed) return null;

  const completedCount = STEPS.filter((s) => onboarding[s.key]).length;
  const progress = Math.round((completedCount / STEPS.length) * 100);

  async function handleSkip() {
    await WorkspaceOnboarding.skip(workspace.slug);
    setDismissed(true);
  }

  async function handleCompleteStep(step) {
    if (onboarding[step]) return;
    const updated = await WorkspaceOnboarding.completeStep(
      workspace.slug,
      step
    );
    if (updated) {
      setOnboarding(updated);
      if (updated.completed) {
        setTimeout(() => setDismissed(true), 1500);
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto my-4 bg-theme-bg-secondary rounded-xl border border-theme-sidebar-border shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-theme-text-primary">
          Getting Started
        </h3>
        <button
          onClick={handleSkip}
          className="text-theme-text-secondary hover:text-theme-text-primary transition-colors p-1 rounded"
          aria-label="Skip onboarding"
          data-testid="onboarding-skip"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-theme-text-secondary">
            {completedCount}/{STEPS.length} completed
          </span>
          <span className="text-xs text-theme-text-secondary">{progress}%</span>
        </div>
        <div
          className="w-full bg-theme-bg-primary rounded-full h-2"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <ul className="px-4 pb-4 space-y-2">
        {STEPS.map((step) => {
          const isComplete = onboarding[step.key];
          const Icon = step.icon;
          return (
            <li
              key={step.key}
              data-testid={`onboarding-step-${step.key}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isComplete
                  ? "bg-green-500/10 text-green-400"
                  : "bg-theme-bg-primary text-theme-text-secondary hover:text-theme-text-primary"
              }`}
            >
              {isComplete ? (
                <CheckCircle size={20} weight="fill" className="shrink-0" />
              ) : (
                <Icon size={20} className="shrink-0" />
              )}
              <span
                className={`text-sm flex-1 ${isComplete ? "line-through" : ""}`}
              >
                {step.label}
              </span>
              {!step.required && !isComplete && (
                <span className="text-xs opacity-50">optional</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
