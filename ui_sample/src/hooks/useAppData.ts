import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type {
  Shortcut,
  Group,
  AppData,
  InstalledApp,
  ProcessInfo,
} from "../types";

// ========================================
// App Data Hook
// ========================================

export function useAppData() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoke<AppData>("get_app_data");
      setShortcuts(data.shortcuts);
      setGroups(data.groups);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveShortcuts = useCallback(async (newShortcuts: Shortcut[]) => {
    try {
      await invoke("save_shortcuts", { shortcuts: newShortcuts });
      setShortcuts(newShortcuts);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const saveGroups = useCallback(async (newGroups: Group[]) => {
    try {
      await invoke("save_groups", { groups: newGroups });
      setGroups(newGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const addShortcut = useCallback(
    async (shortcut: Shortcut) => {
      const newShortcuts = [...shortcuts, shortcut];
      await saveShortcuts(newShortcuts);
    },
    [shortcuts, saveShortcuts],
  );

  const updateShortcut = useCallback(
    async (shortcut: Shortcut) => {
      const newShortcuts = shortcuts.map((s) =>
        s.id === shortcut.id ? shortcut : s,
      );
      await saveShortcuts(newShortcuts);
    },
    [shortcuts, saveShortcuts],
  );

  const deleteShortcut = useCallback(
    async (id: string) => {
      const newShortcuts = shortcuts.filter((s) => s.id !== id);
      await saveShortcuts(newShortcuts);
    },
    [shortcuts, saveShortcuts],
  );

  const updateShortcuts = useCallback(
    async (updatedShortcuts: Shortcut[]) => {
      const newShortcuts = shortcuts.map((s) => {
        const updated = updatedShortcuts.find((u) => u.id === s.id);
        return updated || s;
      });
      await saveShortcuts(newShortcuts);
    },
    [shortcuts, saveShortcuts],
  );

  const addGroup = useCallback(
    async (group: Group) => {
      const newGroups = [...groups, group];
      await saveGroups(newGroups);
    },
    [groups, saveGroups],
  );

  const updateGroup = useCallback(
    async (group: Group) => {
      const newGroups = groups.map((g) => (g.id === group.id ? group : g));
      await saveGroups(newGroups);
    },
    [groups, saveGroups],
  );

  const deleteGroup = useCallback(
    async (id: string) => {
      // Move shortcuts from deleted group to default
      const updatedShortcuts = shortcuts.map((s) =>
        s.groupId === id ? { ...s, groupId: "default" } : s,
      );
      const newGroups = groups.filter((g) => g.id !== id);

      await saveShortcuts(updatedShortcuts);
      await saveGroups(newGroups);
    },
    [shortcuts, groups, saveShortcuts, saveGroups],
  );

  const executeShortcut = useCallback(async (shortcut: Shortcut) => {
    try {
      const results = await invoke<string[]>("execute_shortcut", { shortcut });
      return results;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : String(err));
    }
  }, []);

  return {
    shortcuts,
    groups,
    loading,
    error,
    loadData,
    addShortcut,
    updateShortcut,
    updateShortcuts,
    deleteShortcut,
    addGroup,
    updateGroup,
    deleteGroup,
    executeShortcut,
    saveGroups,
  };
}

// ========================================
// Process List Hook
// ========================================

export function useProcessList() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProcesses = useCallback(async () => {
    try {
      setLoading(true);
      const list = await invoke<ProcessInfo[]>("get_process_list");
      setProcesses(list);
    } catch (err) {
      console.error("Failed to load processes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { processes, loading, loadProcesses };
}

// ========================================
// Installed Apps Hook
// ========================================

export function useInstalledApps() {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(false);

  const loadApps = useCallback(async () => {
    try {
      setLoading(true);
      const list = await invoke<InstalledApp[]>("get_installed_apps");
      setApps(list);
    } catch (err) {
      console.error("Failed to load apps:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { apps, loading, loadApps };
}

// ========================================
// Window Position Hook
// ========================================

export function useWindowPosition() {
  const getWindowPosition = useCallback(async (processName: string) => {
    try {
      const position = await invoke<{
        x?: number;
        y?: number;
        width?: number;
        height?: number;
      }>("get_window_position", { processName });
      return position;
    } catch (err) {
      console.error("Failed to get window position:", err);
      return null;
    }
  }, []);

  return { getWindowPosition };
}

// ========================================
// Resolve Shortcut Link Hook
// ========================================

export function useResolveShortcut() {
  const resolveShortcut = useCallback(async (lnkPath: string) => {
    try {
      const result = await invoke<{ path: string; args: string }>(
        "resolve_shortcut_link",
        { lnkPath },
      );
      return result;
    } catch (err) {
      console.error("Failed to resolve shortcut:", err);
      return null;
    }
  }, []);

  return { resolveShortcut };
}
