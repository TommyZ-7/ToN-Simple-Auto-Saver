import { useState, useCallback } from "react";
import "./App.css";
import { Sidebar, TitleBar, PageContainer } from "./components/layout";
import {
  ShortcutsPage,
  GroupsPage,
  SettingsPage,
  AboutPage,
} from "./components/pages";
import { ShortcutEditor } from "./components/ShortcutEditor";
import { ConfirmDialog } from "./components/common";
import { useAppData } from "./hooks/useAppData";
import type { Shortcut, Group } from "./types";

function App() {
  const [currentPage, setCurrentPage] = useState("shortcuts");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shortcutToDelete, setShortcutToDelete] = useState<Shortcut | null>(
    null,
  );

  const {
    shortcuts,
    groups,
    loading,
    addShortcut,
    updateShortcut,
    updateShortcuts,
    deleteShortcut,
    addGroup,
    updateGroup,
    deleteGroup,
    executeShortcut,
    saveGroups,
  } = useAppData();

  const handleCreateShortcut = () => {
    setEditingShortcut(null);
    setEditorOpen(true);
  };

  const handleEditShortcut = (shortcut: Shortcut) => {
    setEditingShortcut(shortcut);
    setEditorOpen(true);
  };

  const handleSaveShortcut = async (shortcut: Shortcut) => {
    if (editingShortcut) {
      await updateShortcut(shortcut);
    } else {
      await addShortcut(shortcut);
    }
  };

  const handleDeleteShortcut = (shortcut: Shortcut) => {
    setShortcutToDelete(shortcut);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (shortcutToDelete) {
      await deleteShortcut(shortcutToDelete.id);
      setShortcutToDelete(null);
    }
  };

  const handleToggleGroup = useCallback(
    async (groupId: string) => {
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        await updateGroup({ ...group, isExpanded: !group.isExpanded });
      }
    },
    [groups, updateGroup],
  );

  const handleReorderShortcuts = useCallback(
    async (_groupId: string, newOrder: Shortcut[]) => {
      const reorderedShortcuts = newOrder.map((s, index) => ({
        ...s,
        order: index,
      }));
      await updateShortcuts(reorderedShortcuts);
    },
    [updateShortcuts],
  );

  const handleReorderGroups = useCallback(
    async (newGroups: Group[]) => {
      await saveGroups(newGroups);
    },
    [saveGroups],
  );

  const renderPage = () => {
    switch (currentPage) {
      case "shortcuts":
        return (
          <ShortcutsPage
            shortcuts={shortcuts}
            groups={groups}
            loading={loading}
            onExecute={executeShortcut}
            onEdit={handleEditShortcut}
            onDelete={handleDeleteShortcut}
            onCreate={handleCreateShortcut}
            onToggleGroup={handleToggleGroup}
            onReorderShortcuts={handleReorderShortcuts}
          />
        );
      case "groups":
        return (
          <GroupsPage
            groups={groups}
            onUpdate={updateGroup}
            onCreate={addGroup}
            onDelete={deleteGroup}
            onReorder={handleReorderGroups}
          />
        );
      case "settings":
        return <SettingsPage />;
      case "about":
        return <AboutPage />;
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

      <ShortcutEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        shortcut={editingShortcut}
        groups={groups}
        onSave={handleSaveShortcut}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setShortcutToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="ショートカットを削除"
        message={`「${shortcutToDelete?.name || ""}」を削除しますか？この操作は取り消せません。`}
        confirmText="削除"
        cancelText="キャンセル"
        variant="danger"
      />
    </div>
  );
}

export default App;
