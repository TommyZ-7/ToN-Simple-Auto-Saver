import { SectionHeader, Card, Toggle, Button, Spinner } from "../common";
import {
  Monitor,
  Moon,
  Bell,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowDownCircle,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdater } from "../../hooks/useUpdater";

export function SettingsPage() {
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    startMinimized: false,
    runAtStartup: false,
  });
  const [updateExpanded, setUpdateExpanded] = useState(false);

  const {
    status: updateStatus,
    updateInfo,
    progress: updateProgress,
    error: updateError,
    checkForUpdates,
    downloadAndInstall,
    dismissUpdate,
  } = useUpdater();

  const handleCheckForUpdates = async () => {
    setUpdateExpanded(true);
    await checkForUpdates(false);
  };

  const handleDismiss = () => {
    setUpdateExpanded(false);
    dismissUpdate();
  };

  // Format bytes to human readable
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="設定"
        description="アプリケーションの動作をカスタマイズ"
      />

      <Card hover={false} className="divide-y divide-white/5">
        <SettingItem
          icon={<Moon className="w-5 h-5" />}
          title="ダークモード"
          description="常にダークテーマを使用します"
        >
          <Toggle
            checked={settings.darkMode}
            onChange={(checked) =>
              setSettings({ ...settings, darkMode: checked })
            }
          />
        </SettingItem>

        <SettingItem
          icon={<Bell className="w-5 h-5" />}
          title="通知"
          description="ショートカット実行時に通知を表示"
        >
          <Toggle
            checked={settings.notifications}
            onChange={(checked) =>
              setSettings({ ...settings, notifications: checked })
            }
          />
        </SettingItem>

        <SettingItem
          icon={<Monitor className="w-5 h-5" />}
          title="最小化して起動"
          description="アプリ起動時にシステムトレイに最小化"
        >
          <Toggle
            checked={settings.startMinimized}
            onChange={(checked) =>
              setSettings({ ...settings, startMinimized: checked })
            }
          />
        </SettingItem>

        <SettingItem
          icon={<Monitor className="w-5 h-5" />}
          title="スタートアップ時に起動"
          description="Windows起動時に自動的に起動"
        >
          <Toggle
            checked={settings.runAtStartup}
            onChange={(checked) =>
              setSettings({ ...settings, runAtStartup: checked })
            }
          />
        </SettingItem>
      </Card>

      {/* アップデート */}
      <Card hover={false} className="overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-[#0078d4]/20 text-[#0078d4]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">アップデート</h3>
              <p className="text-sm text-gray-500">
                新しいバージョンを確認して更新
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleCheckForUpdates}
            disabled={
              updateStatus === "checking" ||
              updateStatus === "downloading" ||
              updateStatus === "installing"
            }
          >
            <RefreshCw
              className={`w-4 h-4 ${updateStatus === "checking" ? "animate-spin" : ""}`}
            />
            アップデートを確認
          </Button>
        </div>

        {/* Expanded Update Status */}
        <AnimatePresence>
          {updateExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-2 border-t border-white/5">
                {/* Checking */}
                {updateStatus === "checking" && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Spinner size="sm" />
                    <span>アップデートを確認中...</span>
                  </div>
                )}

                {/* Up to date */}
                {updateStatus === "up-to-date" && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span>最新バージョンです</span>
                    </div>
                    <button
                      onClick={handleDismiss}
                      className="text-sm text-gray-500 hover:text-gray-300"
                    >
                      閉じる
                    </button>
                  </div>
                )}

                {/* Update available */}
                {updateStatus === "available" && updateInfo && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <ArrowDownCircle className="w-5 h-5 text-[#0078d4] mt-0.5" />
                      <div className="flex-1">
                        <p className="text-white">
                          新しいバージョンが利用可能です
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          v{updateInfo.currentVersion} → v{updateInfo.version}
                        </p>
                        {updateInfo.body && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {updateInfo.body}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={handleDismiss}>
                        後で
                      </Button>
                      <Button variant="primary" onClick={downloadAndInstall}>
                        <Download className="w-4 h-4" />
                        ダウンロードしてインストール
                      </Button>
                    </div>
                  </div>
                )}

                {/* Downloading */}
                {updateStatus === "downloading" && updateProgress && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">ダウンロード中...</span>
                      <span className="text-[#0078d4] font-medium">
                        {Math.round(updateProgress.percent)}%
                      </span>
                    </div>
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-[#0078d4] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${updateProgress.percent}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      {formatBytes(updateProgress.downloaded)} /{" "}
                      {formatBytes(updateProgress.total)}
                    </p>
                  </div>
                )}

                {/* Installing */}
                {updateStatus === "installing" && (
                  <div className="flex items-center gap-3 text-[#0078d4]">
                    <Spinner size="sm" />
                    <span>インストール中... アプリを再起動します</span>
                  </div>
                )}

                {/* Error */}
                {updateStatus === "error" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      <span>エラーが発生しました</span>
                    </div>
                    {updateError && (
                      <p className="text-sm text-gray-500 pl-8">
                        {updateError}
                      </p>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={handleDismiss}>
                        閉じる
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => checkForUpdates(false)}
                      >
                        再試行
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card hover={false} className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">データ管理</h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <span className="text-white">データをエクスポート</span>
            <p className="text-sm text-gray-500">
              ショートカットとグループをJSONファイルに保存
            </p>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <span className="text-white">データをインポート</span>
            <p className="text-sm text-gray-500">
              JSONファイルからデータを読み込み
            </p>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors">
            <span className="text-red-400">すべてのデータを削除</span>
            <p className="text-sm text-gray-500">
              ショートカットとグループをすべて削除
            </p>
          </button>
        </div>
      </Card>
    </div>
  );
}

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingItem({ icon, title, description, children }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <div className="text-[#0078d4]">{icon}</div>
        <div>
          <h4 className="font-medium text-white">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
