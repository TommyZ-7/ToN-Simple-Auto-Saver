import { useState, useCallback, useEffect } from "react";
import { check, Update } from "@tauri-apps/plugin-updater";
import { getVersion } from "@tauri-apps/api/app";

export interface UpdateInfo {
  version: string;
  currentVersion: string;
  body?: string;
  date?: string;
}

export interface UpdateProgress {
  downloaded: number;
  total: number;
  percent: number;
}

export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "installing"
  | "error"
  | "up-to-date";

export function useUpdater() {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updateInstance, setUpdateInstance] = useState<Update | null>(null);

  const checkForUpdates = useCallback(async (silent = false) => {
    try {
      setStatus("checking");
      setError(null);

      const update = await check();
      const currentVersion = await getVersion();

      if (update) {
        setUpdateInfo({
          version: update.version,
          currentVersion,
          body: update.body || undefined,
          date: update.date || undefined,
        });
        setUpdateInstance(update);
        setStatus("available");
        return true;
      } else {
        setStatus("up-to-date");
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      // 開発モードや設定エラーの場合は静かに失敗
      if (silent || errorMessage.includes("Could not fetch a valid release")) {
        setStatus("idle");
        return false;
      }
      setError(errorMessage);
      setStatus("error");
      return false;
    }
  }, []);

  const downloadAndInstall = useCallback(async () => {
    if (!updateInstance) {
      setError("No update available");
      return;
    }

    try {
      setStatus("downloading");
      setProgress({ downloaded: 0, total: 0, percent: 0 });

      let contentLength = 0;
      let downloaded = 0;

      await updateInstance.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength || 0;
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            const percent =
              contentLength > 0 ? (downloaded / contentLength) * 100 : 0;
            setProgress({
              downloaded,
              total: contentLength,
              percent: Math.min(percent, 100),
            });
            break;
          case "Finished":
            setProgress({
              downloaded: contentLength,
              total: contentLength,
              percent: 100,
            });
            break;
        }
      });

      setStatus("installing");
      // アプリは自動的に再起動される
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, [updateInstance]);

  const dismissUpdate = useCallback(() => {
    setStatus("idle");
    setUpdateInfo(null);
    setUpdateInstance(null);
    setProgress(null);
    setError(null);
  }, []);

  // 起動時に自動チェック
  useEffect(() => {
    // 少し遅延させて起動後にチェック
    const timer = setTimeout(() => {
      checkForUpdates(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [checkForUpdates]);

  return {
    status,
    updateInfo,
    progress,
    error,
    checkForUpdates,
    downloadAndInstall,
    dismissUpdate,
  };
}
