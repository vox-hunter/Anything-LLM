import { useEffect, useState } from "react";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Admin from "@/models/admin";

const REACTION_LABELS = {
  helpful: { emoji: "👍", label: "Helpful" },
  inaccurate: { emoji: "❌", label: "Inaccurate" },
  needs_more_detail: { emoji: "🔍", label: "Needs More Detail" },
  perfect: { emoji: "⭐", label: "Perfect" },
};

export default function ReactionReport() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({});
  const [workspaceMap, setWorkspaceMap] = useState({});
  const [validReactions, setValidReactions] = useState([]);

  useEffect(() => {
    async function fetchReport() {
      const data = await Admin.reactionReport();
      setReport(data.report || {});
      setWorkspaceMap(data.workspaceMap || {});
      setValidReactions(data.validReactions || []);
      setLoading(false);
    }
    fetchReport();
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
      <Sidebar />
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
      >
        <div className="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
          <div className="w-full flex flex-col gap-y-1 pb-6 border-white/10 border-b-2">
            <p className="text-lg leading-6 font-bold text-theme-text-primary">
              Reaction Report
            </p>
            <p className="text-xs leading-[18px] font-base text-theme-text-secondary mt-2">
              Aggregated message reactions across all workspaces. Use this to
              identify LLM quality issues and track user satisfaction.
            </p>
          </div>
          <ReportContent
            loading={loading}
            report={report}
            workspaceMap={workspaceMap}
            validReactions={validReactions}
          />
        </div>
      </div>
    </div>
  );
}

function ReportContent({ loading, report, workspaceMap, validReactions }) {
  if (loading) {
    return (
      <Skeleton.default
        height="80vh"
        width="100%"
        highlightColor="var(--theme-bg-primary)"
        baseColor="var(--theme-bg-secondary)"
        count={1}
        className="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
        containerClassName="flex w-full"
      />
    );
  }

  const workspaceIds = Object.keys(report);
  if (workspaceIds.length === 0) {
    return (
      <div className="mt-6 text-theme-text-secondary text-sm">
        No reactions recorded yet. Reactions will appear here once users start
        reacting to chat messages.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto mt-6">
      <table className="w-full text-xs text-left rounded-lg min-w-[640px] border-spacing-0">
        <thead className="text-theme-text-secondary text-xs leading-[18px] font-bold uppercase border-white/10 border-b">
          <tr>
            <th scope="col" className="px-6 py-3 rounded-tl-lg">
              Workspace
            </th>
            {validReactions.map((r) => (
              <th key={r} scope="col" className="px-6 py-3 text-center">
                {REACTION_LABELS[r]?.emoji || ""}{" "}
                {REACTION_LABELS[r]?.label || r}
              </th>
            ))}
            <th scope="col" className="px-6 py-3 text-center rounded-tr-lg">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {workspaceIds.map((wsId) => {
            const reactions = report[wsId] || {};
            const total = Object.values(reactions).reduce(
              (sum, c) => sum + c,
              0
            );
            return (
              <tr
                key={wsId}
                className="text-theme-text-primary text-xs font-medium border-b border-white/10"
              >
                <td className="px-6 py-3">
                  {workspaceMap[wsId] || `Workspace #${wsId}`}
                </td>
                {validReactions.map((r) => (
                  <td key={r} className="px-6 py-3 text-center">
                    {reactions[r] || 0}
                  </td>
                ))}
                <td className="px-6 py-3 text-center font-bold">{total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
