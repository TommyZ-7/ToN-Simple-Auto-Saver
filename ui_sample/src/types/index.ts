// ========================================
// Data Types (matches Rust backend)
// ========================================

export interface WindowConfig {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export type Action =
  | {
      type: "launch";
      path: string;
      args?: string[];
      windowConfig?: WindowConfig;
    }
  | { type: "kill"; processName: string }
  | { type: "open_folder"; path: string; windowConfig?: WindowConfig }
  | { type: "open_url"; url: string; windowConfig?: WindowConfig }
  | { type: "delay"; ms: number };

export interface Shortcut {
  id: string;
  name: string;
  icon: string;
  groupId: string;
  actions: Action[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  isExpanded: boolean;
}

export interface AppData {
  shortcuts: Shortcut[];
  groups: Group[];
}

export interface ProcessInfo {
  pid: number;
  name: string;
  memoryUsage: number;
}

export interface WindowInfo {
  hwnd: number;
  title: string;
  processName: string;
  pid: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InstalledApp {
  name: string;
  path: string;
  icon?: string;
}

// ========================================
// UI Types
// ========================================

export type ActionType = Action["type"];

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export type ModalType = "shortcut" | "group" | "action" | null;

// ========================================
// Desktop Shortcut Types
// ========================================

export interface DesktopShortcutOptions {
  name: string;
  iconPath?: string;
  iconIndex?: number;
  customIconData?: string; // Base64 encoded ICO data
  borderRadius: number; // 0-50 for icon corner radius percentage
}

export interface CreateDesktopShortcutRequest {
  shortcutId: string;
  targetPath: string; // Path to save the .lnk file
  options: DesktopShortcutOptions;
}
