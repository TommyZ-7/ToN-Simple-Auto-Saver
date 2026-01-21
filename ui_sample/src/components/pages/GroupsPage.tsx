import { motion, Reorder } from "framer-motion";
import { Plus, Pencil, Trash2, FolderOpen, GripVertical } from "lucide-react";
import { useState } from "react";
import type { Group } from "../../types";
import {
  Button,
  Card,
  SectionHeader,
  EmptyState,
  Input,
  Modal,
  IconDisplay,
  IconPickerGrid,
  ConfirmDialog,
} from "../common";

const PRESET_COLORS = [
  "#22d3ee", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
];

interface GroupsPageProps {
  groups: Group[];
  onUpdate: (group: Group) => void;
  onCreate: (group: Group) => void;
  onDelete: (id: string) => void;
  onReorder: (groups: Group[]) => void;
}

export function GroupsPage({
  groups,
  onUpdate,
  onCreate,
  onDelete,
  onReorder,
}: GroupsPageProps) {
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [newGroup, setNewGroup] = useState<Partial<Group>>({
    name: "",
    color: PRESET_COLORS[0],
    icon: "folder",
  });

  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

  const handleCreate = () => {
    if (!newGroup.name?.trim()) return;

    const group: Group = {
      id: crypto.randomUUID(),
      name: newGroup.name.trim(),
      color: newGroup.color || PRESET_COLORS[0],
      icon: newGroup.icon || "folder",
      order: groups.length,
      isExpanded: true,
    };

    onCreate(group);
    setNewGroup({ name: "", color: PRESET_COLORS[0], icon: "folder" });
    setIsCreating(false);
  };

  const handleUpdate = () => {
    if (!editingGroup?.name?.trim()) return;
    onUpdate(editingGroup);
    setEditingGroup(null);
  };

  const handleDelete = (group: Group) => {
    if (group.id === "default") return;
    setGroupToDelete(group);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (groupToDelete) {
      onDelete(groupToDelete.id);
      setGroupToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="グループ管理"
        description="ショートカットをグループで整理できます"
        action={
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4" />
            新規グループ
          </Button>
        }
      />

      {groups.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-16 h-16" />}
          title="グループがありません"
          description="グループを作成してショートカットを整理しましょう"
          action={
            <Button variant="primary" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4" />
              最初のグループを作成
            </Button>
          }
        />
      ) : (
        <Reorder.Group
          axis="y"
          values={sortedGroups}
          onReorder={(newOrder) => {
            const reorderedGroups = newOrder.map((g, index) => ({
              ...g,
              order: index,
            }));
            onReorder(reorderedGroups);
          }}
          className="space-y-2"
        >
          {sortedGroups.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              onEdit={() => setEditingGroup(group)}
              onDelete={() => handleDelete(group)}
            />
          ))}
        </Reorder.Group>
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="新規グループ"
      >
        <div className="p-6 space-y-6">
          <Input
            label="グループ名"
            value={newGroup.name || ""}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            placeholder="グループ名を入力..."
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              カラー
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewGroup({ ...newGroup, color })}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    newGroup.color === color
                      ? "ring-2 ring-white ring-offset-2 ring-offset-[#2d2d2d] scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              アイコン
            </label>
            <IconPickerGrid
              selectedIcon={newGroup.icon || "folder"}
              onSelect={(icon) => setNewGroup({ ...newGroup, icon })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsCreating(false)}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!newGroup.name?.trim()}
            >
              作成
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        isOpen={!!editingGroup}
        onClose={() => setEditingGroup(null)}
        title="グループを編集"
      >
        {editingGroup && (
          <div className="p-6 space-y-6">
            <Input
              label="グループ名"
              value={editingGroup.name}
              onChange={(e) =>
                setEditingGroup({ ...editingGroup, name: e.target.value })
              }
              placeholder="グループ名を入力..."
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                カラー
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setEditingGroup({ ...editingGroup, color })}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      editingGroup.color === color
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[#2d2d2d] scale-110"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                アイコン
              </label>
              <IconPickerGrid
                selectedIcon={editingGroup.icon}
                onSelect={(icon) => setEditingGroup({ ...editingGroup, icon })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setEditingGroup(null)}>
                キャンセル
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdate}
                disabled={!editingGroup.name.trim()}
              >
                保存
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setGroupToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="グループを削除"
        message={`「${groupToDelete?.name || ""}」を削除しますか？\nこのグループ内のショートカットはデフォルトグループに移動します。`}
        confirmText="削除"
        cancelText="キャンセル"
        variant="danger"
      />
    </div>
  );
}

// ========================================
// Group Item Component
// ========================================

interface GroupItemProps {
  group: Group;
  onEdit: () => void;
  onDelete: () => void;
}

function GroupItem({ group, onEdit, onDelete }: GroupItemProps) {
  const isDefault = group.id === "default";

  return (
    <Reorder.Item value={group} className="list-none">
      <Card hover={false}>
        <motion.div
          layout
          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
          className="flex items-center gap-4 p-4"
        >
          {/* Drag Handle */}
          <div
            className={`cursor-grab active:cursor-grabbing text-gray-500 ${isDefault ? "invisible" : "hover:text-gray-300"}`}
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Color Indicator */}
          <div
            className="w-1 h-10 rounded-full"
            style={{ backgroundColor: group.color }}
          />

          {/* Icon */}
          <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg">
            <IconDisplay iconKey={group.icon} size={20} />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h3 className="font-medium text-white">{group.name}</h3>
            {isDefault && (
              <p className="text-xs text-gray-500">
                デフォルトグループ（削除不可）
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </motion.button>

            {!isDefault && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDelete}
                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>
      </Card>
    </Reorder.Item>
  );
}
