import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus,
  Trash2,
  GripVertical,
  Play,
  XCircle,
  FolderOpen,
  Globe,
  Clock,
  Search,
  ChevronDown,
  ChevronRight,
  AppWindow,
  X,
} from "lucide-react";
import { useState, useEffect, ChangeEvent } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import type {
  Shortcut,
  Action,
  Group,
  InstalledApp,
  ProcessInfo,
  WindowInfo,
} from "../types";
import {
  Modal,
  Button,
  Input,
  Card,
  IconDisplay,
  IconPickerGrid,
} from "./common";

// ========================================
// Constants
// ========================================

const ACTION_TYPES = [
  { value: "launch", label: "アプリを起動", icon: Play },
  { value: "kill", label: "プロセスを終了", icon: XCircle },
  { value: "open_folder", label: "フォルダを開く", icon: FolderOpen },
  { value: "open_url", label: "URLを開く", icon: Globe },
  { value: "delay", label: "遅延", icon: Clock },
];

// ========================================
// Main Modal Component
// ========================================

interface ShortcutEditorProps {
  isOpen: boolean;
  onClose: () => void;
  shortcut: Shortcut | null;
  groups: Group[];
  onSave: (shortcut: Shortcut) => void;
}

export function ShortcutEditor({
  isOpen,
  onClose,
  shortcut,
  groups,
  onSave,
}: ShortcutEditorProps) {
  const isEditing = !!shortcut;

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("zap");
  const [groupId, setGroupId] = useState("default");
  // Use internal type with stable IDs for Reorder
  const [actionItems, setActionItems] = useState<
    { id: string; action: Action }[]
  >([]);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (shortcut) {
        setName(shortcut.name);
        setIcon(shortcut.icon);
        setGroupId(shortcut.groupId);
        setActionItems(
          shortcut.actions.map((action) => ({
            id: crypto.randomUUID(),
            action,
          })),
        );
      } else {
        setName("");
        setIcon("zap");
        setGroupId("default");
        setActionItems([]);
      }
    }
  }, [isOpen, shortcut]);

  const handleSave = () => {
    if (!name.trim() || actionItems.length === 0) return;

    const newShortcut: Shortcut = {
      id: shortcut?.id || crypto.randomUUID(),
      name: name.trim(),
      icon,
      groupId,
      actions: actionItems.map((item) => item.action),
      order: shortcut?.order || 0,
      createdAt: shortcut?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newShortcut);
    onClose();
  };

  const addAction = (type: Action["type"]) => {
    let newAction: Action;

    switch (type) {
      case "launch":
        newAction = { type: "launch", path: "" };
        break;
      case "kill":
        newAction = { type: "kill", processName: "" };
        break;
      case "open_folder":
        newAction = { type: "open_folder", path: "" };
        break;
      case "open_url":
        newAction = { type: "open_url", url: "" };
        break;
      case "delay":
        newAction = { type: "delay", ms: 1000 };
        break;
    }

    setActionItems([
      ...actionItems,
      { id: crypto.randomUUID(), action: newAction },
    ]);
  };

  const updateAction = (id: string, action: Action) => {
    setActionItems(
      actionItems.map((item) => (item.id === id ? { ...item, action } : item)),
    );
  };

  const removeAction = (id: string) => {
    setActionItems(actionItems.filter((item) => item.id !== id));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "ショートカットを編集" : "新規ショートカット"}
      width="max-w-3xl"
    >
      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-[auto_1fr] gap-4">
          {/* Icon Picker */}
          <div className="relative">
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/15 transition-colors"
            >
              <IconDisplay iconKey={icon} size={32} />
            </button>

            <AnimatePresence>
              {showIconPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute top-full left-0 mt-2 z-10"
                >
                  <IconPickerGrid
                    selectedIcon={icon}
                    onSelect={(key) => {
                      setIcon(key);
                      setShowIconPicker(false);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <Input
              label="名前"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="ショートカット名..."
            />

            <GroupSelector
              groups={groups}
              selectedGroupId={groupId}
              onSelect={setGroupId}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              アクション ({actionItems.length})
            </label>
            <ActionTypePicker onSelect={addAction} />
          </div>

          {actionItems.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
              <p className="text-gray-500">アクションを追加してください</p>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={actionItems}
              onReorder={setActionItems}
              className="space-y-2"
            >
              {actionItems.map((item) => (
                <ActionItem
                  key={item.id}
                  item={item}
                  onUpdate={(a) => updateAction(item.id, a)}
                  onRemove={() => removeAction(item.id)}
                />
              ))}
            </Reorder.Group>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!name.trim() || actionItems.length === 0}
          >
            {isEditing ? "保存" : "作成"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ========================================
// Group Selector (Custom Dropdown)
// ========================================

interface GroupSelectorProps {
  groups: Group[];
  selectedGroupId: string;
  onSelect: (groupId: string) => void;
}

function GroupSelector({
  groups,
  selectedGroupId,
  onSelect,
}: GroupSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedGroup =
    groups.find((g) => g.id === selectedGroupId) || groups[0];

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-300">
        グループ
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white hover:bg-white/8 focus:outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-colors"
        >
          {/* Color Indicator */}
          <div
            className="w-1 h-6 rounded-full shrink-0"
            style={{ backgroundColor: selectedGroup?.color || "#666" }}
          />
          {/* Icon */}
          <div
            className="shrink-0 w-7 h-7 flex items-center justify-center bg-white/10 rounded-md"
            style={{ color: selectedGroup?.color }}
          >
            <IconDisplay iconKey={selectedGroup?.icon || "folder"} size={16} />
          </div>
          {/* Name */}
          <span className="flex-1 text-left truncate">
            {selectedGroup?.name || "グループを選択"}
          </span>
          {/* Chevron */}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 right-0 top-full mt-2 py-1 bg-[#2d2d2d] rounded-lg shadow-xl border border-white/10 z-20 max-h-60 overflow-y-auto"
              >
                {groups.map((group) => {
                  const isSelected = group.id === selectedGroupId;
                  return (
                    <button
                      key={group.id}
                      onClick={() => {
                        onSelect(group.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                        isSelected
                          ? "bg-[#0078d4]/20 text-white"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {/* Color Indicator */}
                      <div
                        className="w-1 h-6 rounded-full shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                      {/* Icon */}
                      <div
                        className="shrink-0 w-7 h-7 flex items-center justify-center bg-white/10 rounded-md"
                        style={{ color: group.color }}
                      >
                        <IconDisplay iconKey={group.icon} size={16} />
                      </div>
                      {/* Name */}
                      <span className="flex-1 text-left truncate">
                        {group.name}
                      </span>
                      {/* Check mark for selected */}
                      {isSelected && (
                        <div className="w-4 h-4 flex items-center justify-center text-[#0078d4]">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ========================================
// Action Type Picker
// ========================================

interface ActionTypePickerProps {
  onSelect: (type: Action["type"]) => void;
}

function ActionTypePicker({ onSelect }: ActionTypePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="secondary" size="sm" onClick={() => setIsOpen(!isOpen)}>
        <Plus className="w-4 h-4" />
        追加
        <ChevronDown className="w-3 h-3" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 py-1 bg-[#3d3d3d] rounded-lg shadow-xl border border-white/10 z-20 min-w-45"
            >
              {ACTION_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    onSelect(value as Action["type"]);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ========================================
// Action Item Component
// ========================================

interface ActionItemProps {
  item: { id: string; action: Action };
  onUpdate: (action: Action) => void;
  onRemove: () => void;
}

function ActionItem({ item, onUpdate, onRemove }: ActionItemProps) {
  const actionType = ACTION_TYPES.find((t) => t.value === item.action.type);
  const Icon = actionType?.icon || Play;

  return (
    <Reorder.Item value={item} className="list-none">
      <Card hover={false} className="overflow-hidden">
        <div className="flex items-start gap-2 p-3">
          {/* Drag Handle */}
          <div className="pt-2 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 shrink-0">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Type Badge */}
          <div className="shrink-0 pt-1">
            <div className="w-8 h-8 flex items-center justify-center bg-[#0078d4]/20 rounded-lg text-[#0078d4]">
              <Icon className="w-4 h-4" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-xs text-gray-500 mb-2">
              {actionType?.label}
            </div>
            <ActionContent action={item.action} onUpdate={onUpdate} />
          </div>

          {/* Remove */}
          <button
            onClick={onRemove}
            className="p-1.5 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </Reorder.Item>
  );
}

// ========================================
// Window Config Editor Component (Shared)
// ========================================

import type { WindowConfig } from "../types";

interface WindowConfigEditorProps {
  windowConfig?: WindowConfig;
  onChange: (config: WindowConfig | undefined) => void;
  defaultExpanded?: boolean;
}

function WindowConfigEditor({
  windowConfig,
  onChange,
  defaultExpanded = false,
}: WindowConfigEditorProps) {
  const [showConfig, setShowConfig] = useState(
    defaultExpanded ||
      !!(
        windowConfig?.x !== undefined ||
        windowConfig?.y !== undefined ||
        windowConfig?.width !== undefined ||
        windowConfig?.height !== undefined
      ),
  );
  const [showWindowPicker, setShowWindowPicker] = useState(false);
  const [windows, setWindows] = useState<WindowInfo[]>([]);
  const [loadingWindows, setLoadingWindows] = useState(false);
  const [windowSearchQuery, setWindowSearchQuery] = useState("");

  const filteredWindows = windows.filter(
    (w) =>
      w.title.toLowerCase().includes(windowSearchQuery.toLowerCase()) ||
      w.processName.toLowerCase().includes(windowSearchQuery.toLowerCase()),
  );

  const loadWindows = async () => {
    setLoadingWindows(true);
    try {
      const windowList = await invoke<WindowInfo[]>("get_window_list");
      setWindows(windowList);
    } catch (error) {
      console.error("Failed to load windows:", error);
    } finally {
      setLoadingWindows(false);
    }
  };

  const handleSelectWindow = (window: WindowInfo) => {
    onChange({
      x: window.x,
      y: window.y,
      width: window.width,
      height: window.height,
    });
    setShowWindowPicker(false);
  };

  const updateConfig = (partial: Partial<WindowConfig>) => {
    onChange({
      ...windowConfig,
      ...partial,
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          {showConfig ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          ウィンドウサイズと位置
        </button>
      </div>
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => {
                  loadWindows();
                  setShowWindowPicker(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <AppWindow className="w-4 h-4" />
                ウィンドウから取得
              </button>
              {windowConfig && (
                <button
                  onClick={() => onChange(undefined)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  クリア
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={windowConfig?.x ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateConfig({
                    x: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="X座標"
              />
              <Input
                type="number"
                value={windowConfig?.y ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateConfig({
                    y: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="Y座標"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={windowConfig?.width ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateConfig({
                    width: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="幅"
              />
              <Input
                type="number"
                value={windowConfig?.height ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateConfig({
                    height: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="高さ"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Window Picker Modal */}
      <Modal
        isOpen={showWindowPicker}
        onClose={() => setShowWindowPicker(false)}
        title="ウィンドウを選択"
        width="max-w-2xl"
      >
        <div className="p-4 space-y-4">
          <Input
            value={windowSearchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWindowSearchQuery(e.target.value)
            }
            placeholder="ウィンドウタイトルまたはプロセス名で検索..."
          />
          <div className="max-h-96 overflow-y-auto space-y-1">
            {loadingWindows ? (
              <div className="text-center py-8 text-gray-500">
                読み込み中...
              </div>
            ) : filteredWindows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                ウィンドウが見つかりません
              </div>
            ) : (
              filteredWindows.map((window) => (
                <button
                  key={window.hwnd}
                  onClick={() => handleSelectWindow(window)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-left transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded">
                    <AppWindow className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">
                      {window.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {window.processName} • {window.width}×{window.height} @ (
                      {window.x}, {window.y})
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

// ========================================
// Action Content Components
// ========================================

interface ActionContentProps {
  action: Action;
  onUpdate: (action: Action) => void;
}

function ActionContent({ action, onUpdate }: ActionContentProps) {
  switch (action.type) {
    case "launch":
      return <LaunchActionContent action={action} onUpdate={onUpdate} />;
    case "kill":
      return <KillActionContent action={action} onUpdate={onUpdate} />;
    case "open_folder":
      return <OpenFolderActionContent action={action} onUpdate={onUpdate} />;
    case "open_url":
      return <OpenUrlActionContent action={action} onUpdate={onUpdate} />;
    case "delay":
      return <DelayActionContent action={action} onUpdate={onUpdate} />;
  }
}

// ========================================
// Launch Action Content
// ========================================

function LaunchActionContent({
  action,
  onUpdate,
}: {
  action: Extract<Action, { type: "launch" }>;
  onUpdate: (action: Action) => void;
}) {
  const [showAppPicker, setShowAppPicker] = useState(false);
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadApps = async () => {
    setLoadingApps(true);
    try {
      const list = await invoke<InstalledApp[]>("get_installed_apps");
      setApps(list);
    } catch (err) {
      console.error("Failed to load apps:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleBrowse = async () => {
    const selected = await open({
      multiple: false,
      filters: [
        { name: "Executable", extensions: ["exe", "lnk", "bat", "cmd"] },
      ],
    });

    if (selected) {
      let path = selected as string;

      // If it's a .lnk file, resolve it
      if (path.toLowerCase().endsWith(".lnk")) {
        try {
          const resolved = await invoke<{ path: string; args: string }>(
            "resolve_shortcut_link",
            { lnkPath: path },
          );
          path = resolved.path;
          if (resolved.args) {
            onUpdate({
              ...action,
              path,
              args: resolved.args.split(" ").filter(Boolean),
            });
            return;
          }
        } catch {
          // Use original path if resolution fails
        }
      }

      onUpdate({ ...action, path });
    }
  };

  const handleSelectApp = async (app: InstalledApp) => {
    let path = app.path;

    // If it's a .lnk file, resolve it
    if (path.toLowerCase().endsWith(".lnk")) {
      try {
        const resolved = await invoke<{ path: string; args: string }>(
          "resolve_shortcut_link",
          { lnkPath: path },
        );
        path = resolved.path;
        if (resolved.args) {
          onUpdate({
            ...action,
            path,
            args: resolved.args.split(" ").filter(Boolean),
          });
          setShowAppPicker(false);
          return;
        }
      } catch {
        // Use original path if resolution fails
      }
    }

    onUpdate({ ...action, path });
    setShowAppPicker(false);
  };

  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={action.path}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onUpdate({ ...action, path: e.target.value })
          }
          placeholder="実行ファイルのパス..."
          wrapperClassName="flex-1 min-w-0"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleBrowse}
          className="shrink-0"
        >
          参照
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={() => {
            setShowAppPicker(true);
            loadApps();
          }}
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <Input
        value={action.args?.join(" ") || ""}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onUpdate({
            ...action,
            args: e.target.value.split(" ").filter(Boolean),
          })
        }
        placeholder="引数（オプション）..."
      />

      <WindowConfigEditor
        windowConfig={action.windowConfig}
        onChange={(config) => onUpdate({ ...action, windowConfig: config })}
      />

      {/* App Picker Modal */}
      <Modal
        isOpen={showAppPicker}
        onClose={() => setShowAppPicker(false)}
        title="アプリケーションを選択"
        width="max-w-lg"
      >
        <div className="p-4 space-y-4">
          <Input
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="検索..."
          />
          <div className="max-h-80 overflow-y-auto space-y-1">
            {loadingApps ? (
              <div className="text-center py-8 text-gray-500">
                読み込み中...
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                アプリが見つかりません
              </div>
            ) : (
              filteredApps.map((app, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectApp(app)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-left transition-colors"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded text-lg">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">
                      {app.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {app.path}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ========================================
// Kill Action Content
// ========================================

function KillActionContent({
  action,
  onUpdate,
}: {
  action: Extract<Action, { type: "kill" }>;
  onUpdate: (action: Action) => void;
}) {
  const [showProcessPicker, setShowProcessPicker] = useState(false);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadProcesses = async () => {
    setLoadingProcesses(true);
    try {
      const list = await invoke<ProcessInfo[]>("get_process_list");
      setProcesses(list);
    } catch (err) {
      console.error("Failed to load processes:", err);
    } finally {
      setLoadingProcesses(false);
    }
  };

  const filteredProcesses = processes.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={action.processName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onUpdate({ ...action, processName: e.target.value })
          }
          placeholder="プロセス名（例：notepad.exe）..."
          wrapperClassName="flex-1 min-w-0"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setShowProcessPicker(true);
            loadProcesses();
          }}
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Process Picker Modal */}
      <Modal
        isOpen={showProcessPicker}
        onClose={() => setShowProcessPicker(false)}
        title="プロセスを選択"
        width="max-w-lg"
      >
        <div className="p-4 space-y-4">
          <Input
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="検索..."
          />
          <div className="max-h-80 overflow-y-auto space-y-1">
            {loadingProcesses ? (
              <div className="text-center py-8 text-gray-500">
                読み込み中...
              </div>
            ) : filteredProcesses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                プロセスが見つかりません
              </div>
            ) : (
              filteredProcesses.map((process) => (
                <button
                  key={process.pid}
                  onClick={() => {
                    onUpdate({ ...action, processName: process.name });
                    setShowProcessPicker(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-left transition-colors"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded text-lg">
                    ⚙️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">
                      {process.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      PID: {process.pid} • メモリ:{" "}
                      {(process.memoryUsage / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ========================================
// Open Folder Action Content
// ========================================

function OpenFolderActionContent({
  action,
  onUpdate,
}: {
  action: Extract<Action, { type: "open_folder" }>;
  onUpdate: (action: Action) => void;
}) {
  const handleBrowse = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });

    if (selected) {
      onUpdate({ ...action, path: selected as string });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={action.path}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onUpdate({ ...action, path: e.target.value })
          }
          placeholder="フォルダパス..."
          wrapperClassName="flex-1 min-w-0"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleBrowse}
          className="shrink-0"
        >
          参照
        </Button>
      </div>

      <WindowConfigEditor
        windowConfig={action.windowConfig}
        onChange={(config) => onUpdate({ ...action, windowConfig: config })}
      />
    </div>
  );
}

// ========================================
// Open URL Action Content
// ========================================

function OpenUrlActionContent({
  action,
  onUpdate,
}: {
  action: Extract<Action, { type: "open_url" }>;
  onUpdate: (action: Action) => void;
}) {
  return (
    <div className="space-y-3">
      <Input
        value={action.url}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onUpdate({ ...action, url: e.target.value })
        }
        placeholder="https://..."
      />

      <WindowConfigEditor
        windowConfig={action.windowConfig}
        onChange={(config) => onUpdate({ ...action, windowConfig: config })}
      />
    </div>
  );
}

// ========================================
// Delay Action Content
// ========================================

function DelayActionContent({
  action,
  onUpdate,
}: {
  action: Extract<Action, { type: "delay" }>;
  onUpdate: (action: Action) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={action.ms}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onUpdate({ ...action, ms: parseInt(e.target.value) || 0 })
        }
        className="w-32"
        min={0}
        step={100}
      />
      <span className="text-sm text-gray-400">ミリ秒</span>
    </div>
  );
}
