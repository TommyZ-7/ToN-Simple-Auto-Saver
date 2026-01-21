import { motion, Reorder } from "framer-motion";
import {
  Plus,
  Play,
  Pencil,
  Trash2,
  ChevronRight,
  Zap,
  GripVertical,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { Shortcut, Group } from "../../types";
import {
  Button,
  Card,
  SectionHeader,
  EmptyState,
  Spinner,
  IconDisplay,
} from "../common";
import { CreateDesktopShortcutModal } from "../CreateDesktopShortcutModal";

interface ShortcutsPageProps {
  shortcuts: Shortcut[];
  groups: Group[];
  loading: boolean;
  onExecute: (shortcut: Shortcut) => Promise<string[]>;
  onEdit: (shortcut: Shortcut) => void;
  onDelete: (shortcut: Shortcut) => void;
  onCreate: () => void;
  onToggleGroup: (groupId: string) => void;
  onReorderShortcuts: (groupId: string, shortcuts: Shortcut[]) => void;
}

export function ShortcutsPage({
  shortcuts,
  groups,
  loading,
  onExecute,
  onEdit,
  onDelete,
  onCreate,
  onToggleGroup,
  onReorderShortcuts,
}: ShortcutsPageProps) {
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<{
    id: string;
    success: boolean;
  } | null>(null);
  const [desktopShortcutModal, setDesktopShortcutModal] =
    useState<Shortcut | null>(null);
  const [isDesktopShortcutModalOpen, setIsDesktopShortcutModalOpen] =
    useState(false);

  const handleExecute = async (shortcut: Shortcut) => {
    setExecutingId(shortcut.id);
    setExecutionResult(null);
    try {
      await onExecute(shortcut);
      setExecutionResult({ id: shortcut.id, success: true });
    } catch {
      setExecutionResult({ id: shortcut.id, success: false });
    } finally {
      setExecutingId(null);
      setTimeout(() => setExecutionResult(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="ショートカット"
        description="ワンクリックで複数のアプリを起動したり、プロセスを終了したりできます"
        action={
          <Button variant="primary" onClick={onCreate}>
            <Plus className="w-4 h-4" />
            新規作成
          </Button>
        }
      />

      {shortcuts.length === 0 ? (
        <EmptyState
          icon={<Zap className="w-16 h-16" />}
          title="ショートカットがありません"
          description="新しいショートカットを作成して、作業を効率化しましょう"
          action={
            <Button variant="primary" onClick={onCreate}>
              <Plus className="w-4 h-4" />
              最初のショートカットを作成
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {sortedGroups.map((group) => {
            const groupShortcuts = shortcuts
              .filter((s) => s.groupId === group.id)
              .sort((a, b) => a.order - b.order);

            if (groupShortcuts.length === 0) return null;

            return (
              <GroupSection
                key={group.id}
                group={group}
                shortcuts={groupShortcuts}
                executingId={executingId}
                executionResult={executionResult}
                onToggle={() => onToggleGroup(group.id)}
                onExecute={handleExecute}
                onEdit={onEdit}
                onDelete={onDelete}
                onCreateDesktopShortcut={(shortcut) => {
                  setDesktopShortcutModal(shortcut);
                  setIsDesktopShortcutModalOpen(true);
                }}
                onReorder={(newOrder) => onReorderShortcuts(group.id, newOrder)}
              />
            );
          })}
        </div>
      )}

      {/* Desktop Shortcut Modal */}
      {desktopShortcutModal && (
        <CreateDesktopShortcutModal
          isOpen={isDesktopShortcutModalOpen}
          onClose={() => setIsDesktopShortcutModalOpen(false)}
          shortcut={desktopShortcutModal}
        />
      )}
    </div>
  );
}

// ========================================
// Group Section Component
// ========================================

interface GroupSectionProps {
  group: Group;
  shortcuts: Shortcut[];
  executingId: string | null;
  executionResult: { id: string; success: boolean } | null;
  onToggle: () => void;
  onExecute: (shortcut: Shortcut) => void;
  onEdit: (shortcut: Shortcut) => void;
  onDelete: (shortcut: Shortcut) => void;
  onCreateDesktopShortcut: (shortcut: Shortcut) => void;
  onReorder: (shortcuts: Shortcut[]) => void;
}

// Wrapper type for stable reordering
type ShortcutWrapper = { id: string; shortcut: Shortcut };

function GroupSection({
  group,
  shortcuts,
  executingId,
  executionResult,
  onToggle,
  onExecute,
  onEdit,
  onDelete,
  onCreateDesktopShortcut,
  onReorder,
}: GroupSectionProps) {
  // Use wrapper objects with stable IDs for Reorder
  const [items, setItems] = useState<ShortcutWrapper[]>([]);

  // Sync with props when shortcuts change
  useEffect(() => {
    setItems(shortcuts.map((s) => ({ id: s.id, shortcut: s })));
  }, [shortcuts]);

  const handleReorder = (newItems: ShortcutWrapper[]) => {
    setItems(newItems);
    onReorder(newItems.map((item) => item.shortcut));
  };

  return (
    <Card hover={false} className="overflow-hidden">
      {/* Group Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <motion.div
          animate={{ rotate: group.isExpanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </motion.div>
        <span style={{ color: group.color }}>
          <IconDisplay iconKey={group.icon} size={20} />
        </span>
        <span className="font-medium text-white">{group.name}</span>
        <span className="text-sm text-gray-500">({items.length})</span>
      </button>

      {/* Shortcuts List - No AnimatePresence to avoid conflicts with Reorder */}
      {group.isExpanded && (
        <div className="px-4 pb-4">
          <Reorder.Group
            axis="y"
            values={items}
            onReorder={handleReorder}
            className="space-y-2"
          >
            {items.map((item) => (
              <ShortcutItem
                key={item.id}
                item={item}
                isExecuting={executingId === item.shortcut.id}
                executionResult={
                  executionResult?.id === item.shortcut.id
                    ? executionResult.success
                    : null
                }
                onExecute={() => onExecute(item.shortcut)}
                onEdit={() => onEdit(item.shortcut)}
                onDelete={() => onDelete(item.shortcut)}
                onCreateDesktopShortcut={() =>
                  onCreateDesktopShortcut(item.shortcut)
                }
              />
            ))}
          </Reorder.Group>
        </div>
      )}
    </Card>
  );
}

// ========================================
// Shortcut Item Component
// ========================================

interface ShortcutItemProps {
  item: ShortcutWrapper;
  isExecuting: boolean;
  executionResult: boolean | null;
  onExecute: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateDesktopShortcut: () => void;
}

function ShortcutItem({
  item,
  isExecuting,
  executionResult,
  onExecute,
  onEdit,
  onDelete,
  onCreateDesktopShortcut,
}: ShortcutItemProps) {
  const { shortcut } = item;

  return (
    <Reorder.Item value={item} className="list-none">
      <div
        className={`flex items-center gap-3 p-3 rounded-lg bg-white/5 border transition-colors hover:bg-white/8 ${
          executionResult === true
            ? "border-green-500/50"
            : executionResult === false
              ? "border-red-500/50"
              : "border-transparent"
        }`}
      >
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Icon */}
        <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg">
          <IconDisplay iconKey={shortcut.icon} size={20} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{shortcut.name}</h3>
          <p className="text-sm text-gray-400">
            {shortcut.actions.length} アクション
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onExecute}
            disabled={isExecuting}
            className={`p-2 rounded-lg transition-colors ${
              isExecuting
                ? "bg-[#0078d4] text-white"
                : "hover:bg-white/10 text-gray-400 hover:text-white"
            }`}
            title="実行"
          >
            {isExecuting ? <Spinner size="sm" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={onCreateDesktopShortcut}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="デスクトップショートカットを作成"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="編集"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}
