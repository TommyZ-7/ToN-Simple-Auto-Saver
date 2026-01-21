import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import "./App.css";
import { Sidebar, TitleBar, PageContainer } from "./components/layout";
import {
  HomePage,
  HistoryPage,
  SettingsPage,
  AboutPage,
} from "./components/pages";
import { UpdateBanner, UpdateModal } from "./components/common";
import { useUpdater } from "./hooks";

type CodeEntry = {
  code: string;
  timestamp: string;
  round_type?: string | null;
};

type RoundTypeStats = {
  survivals: number;
  deaths: number;
};

type RoundStats = {
  total_rounds: number;
  deaths: number;
  round_types: Record<string, RoundTypeStats>;
};

type AppSettings = {
  log_dir?: string | null;
};

type AppSnapshot = {
  settings: AppSettings;
  history: CodeEntry[];
  latest_code?: CodeEntry | null;
  stats: RoundStats;
  survivals: number;
};

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [snapshot, setSnapshot] = useState<AppSnapshot>({
    settings: {},
    history: [],
    latest_code: null,
    stats: { total_rounds: 0, deaths: 0, round_types: {} },
    survivals: 0,
  });
  const [autoStartEnabled, setAutoStartEnabled] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  // アップデート機能
  const {
    status: updateStatus,
    updateInfo,
    progress: updateProgress,
    error: updateError,
    checkForUpdates,
    downloadAndInstall,
    dismissUpdate,
  } = useUpdater();

  useEffect(() => {
    let unlistenState: (() => void) | undefined;
    let unlistenSettings: (() => void) | undefined;

    const init = async () => {
      await refreshState();
      setAutoStartEnabled(await isEnabled());
      unlistenState = await listen("state_updated", (event) => {
        setSnapshot(event.payload as AppSnapshot);
      });
      unlistenSettings = await listen("open_settings", () => {
        setCurrentPage("settings");
      });
    };

    init();

    return () => {
      unlistenState?.();
      unlistenSettings?.();
    };
  }, []);

  const refreshState = async () => {
    const data = (await invoke("get_state")) as AppSnapshot;
    setSnapshot(data);
  };

  const handleChooseLogDir = async () => {
    const dir = await open({ directory: true, multiple: false });
    if (typeof dir === "string") {
      const data = (await invoke("set_log_dir", {
        logDir: dir,
      })) as AppSettings;
      setSnapshot((prev) => ({ ...prev, settings: data }));
    }
  };

  const handleResetLogDir = async () => {
    const data = (await invoke("set_log_dir", {
      logDir: null,
    })) as AppSettings;
    setSnapshot((prev) => ({ ...prev, settings: data }));
  };

  const toggleAutoStart = async () => {
    if (autoStartEnabled) {
      await disable();
      setAutoStartEnabled(false);
    } else {
      await enable();
      setAutoStartEnabled(true);
    }
  };

  const handleOpenUpdateModal = () => {
    setUpdateModalOpen(true);
    if (updateStatus === "idle" || updateStatus === "up-to-date") {
      checkForUpdates();
    }
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
    if (updateStatus === "up-to-date" || updateStatus === "error") {
      dismissUpdate();
    }
  };

  const handleUpdateFromBanner = () => {
    setUpdateModalOpen(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomePage
            latestCode={snapshot.latest_code}
            stats={snapshot.stats}
            survivals={snapshot.survivals}
          />
        );
      case "history":
        return <HistoryPage history={snapshot.history} />;
      case "settings":
        return (
          <SettingsPage
            autoStartEnabled={autoStartEnabled}
            logDir={snapshot.settings.log_dir}
            onToggleAutoStart={toggleAutoStart}
            onChooseLogDir={handleChooseLogDir}
            onResetLogDir={handleResetLogDir}
          />
        );
      case "about":
        return <AboutPage onCheckForUpdates={handleOpenUpdateModal} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a]">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <PageContainer currentPage={currentPage}>{renderPage()}</PageContainer>
      </div>

      {/* アップデート通知バナー */}
      <UpdateBanner
        isVisible={updateStatus === "available" && !updateModalOpen}
        updateInfo={updateInfo}
        onUpdate={handleUpdateFromBanner}
        onDismiss={dismissUpdate}
      />

      {/* アップデートモーダル */}
      <UpdateModal
        isOpen={updateModalOpen}
        onClose={handleCloseUpdateModal}
        status={updateStatus}
        updateInfo={updateInfo}
        progress={updateProgress}
        error={updateError}
        onCheckForUpdates={checkForUpdates}
        onDownloadAndInstall={downloadAndInstall}
      />
    </div>
  );
}

export default App;
