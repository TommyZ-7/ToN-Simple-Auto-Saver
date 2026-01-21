import { SectionHeader, Card, Toggle, Button } from "../common";
import { Monitor, FolderOpen, RotateCcw } from "lucide-react";

const DEFAULT_LOG_DIR = "%LOCALAPPDATA%Low\\VRChat\\VRChat";

interface SettingsPageProps {
  autoStartEnabled: boolean;
  logDir: string | null | undefined;
  onToggleAutoStart: () => void;
  onChooseLogDir: () => void;
  onResetLogDir: () => void;
}

export function SettingsPage({
  autoStartEnabled,
  logDir,
  onToggleAutoStart,
  onChooseLogDir,
  onResetLogDir,
}: SettingsPageProps) {
  const isUsingDefault = !logDir;

  return (
    <div className="space-y-6">
      <SectionHeader title="設定" description="起動とログ監視の設定" />

      <Card hover={false} className="divide-y divide-white/5">
        <SettingItem
          icon={<Monitor className="w-5 h-5" />}
          title="自動起動"
          description="Windows起動時に自動的にバックグラウンドで起動"
        >
          <Toggle checked={autoStartEnabled} onChange={onToggleAutoStart} />
        </SettingItem>

        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="text-[#0078d4]">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-white">
                ログファイルディレクトリ
              </h4>
              <p className="text-sm text-gray-500">VRChatログの保存場所</p>
              <p className="mt-2 text-xs text-gray-400 break-all">
                {isUsingDefault ? (
                  <span>
                    <span className="text-[#0078d4]">(デフォルト)</span>{" "}
                    {DEFAULT_LOG_DIR}
                  </span>
                ) : (
                  logDir
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {!isUsingDefault && (
                <Button
                  variant="secondary"
                  onClick={onResetLogDir}
                  title="デフォルトに戻す"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
              <Button variant="secondary" onClick={onChooseLogDir}>
                参照...
              </Button>
            </div>
          </div>
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
