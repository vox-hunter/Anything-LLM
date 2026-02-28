import { useEffect, useState, useCallback } from "react";
import DocumentFolder from "@/models/documentFolder";
import Workspace from "@/models/workspace";
import showToast from "@/utils/toast";
import {
  FolderNotch,
  CaretDown,
  Plus,
  Trash,
  PencilSimple,
  File,
  FolderPlus,
} from "@phosphor-icons/react";

export default function Documents({ workspace }) {
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!workspace?.slug) return;
    setLoading(true);
    try {
      const tree = await DocumentFolder.list(workspace.slug);
      setFolders(tree);

      const fullWorkspace = await Workspace.bySlug(workspace.slug);
      const allDocs = fullWorkspace?.documents || [];
      setDocuments(allDocs);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [workspace?.slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!workspace) return null;

  return (
    <div className="w-full relative">
      <div className="flex flex-col gap-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Document Folders
            </h3>
            <p className="text-white/60 text-sm mt-1">
              Organize workspace documents into folders and subfolders.
            </p>
          </div>
          <CreateFolderButton
            workspaceSlug={workspace.slug}
            parentId={null}
            onCreated={fetchData}
          />
        </div>

        <div className="bg-theme-settings-input-bg rounded-xl border border-theme-modal-border p-4 min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-white/40 text-sm animate-pulse">
                Loading document folders...
              </p>
            </div>
          ) : (
            <FolderTree
              folders={folders}
              documents={documents}
              workspaceSlug={workspace.slug}
              onRefresh={fetchData}
              depth={0}
            />
          )}

          <UnfiledDocuments
            documents={documents}
            workspaceSlug={workspace.slug}
            folders={folders}
            onRefresh={fetchData}
          />
        </div>
      </div>
    </div>
  );
}

function FolderTree({ folders, documents, workspaceSlug, onRefresh, depth }) {
  if (!folders || folders.length === 0) {
    if (depth === 0) {
      return (
        <p className="text-white/40 text-sm text-center py-4">
          No folders created yet. Click &quot;New Folder&quot; to get started.
        </p>
      );
    }
    return null;
  }

  return (
    <div className={depth > 0 ? "ml-4 border-l border-white/10 pl-2" : ""}>
      {folders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          documents={documents}
          workspaceSlug={workspaceSlug}
          onRefresh={onRefresh}
          depth={depth}
        />
      ))}
    </div>
  );
}

function FolderNode({ folder, documents, workspaceSlug, onRefresh, depth }) {
  const [expanded, setExpanded] = useState(depth === 0);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [dragOver, setDragOver] = useState(false);

  const folderDocuments = documents.filter((d) => d.folderId === folder.id);

  const handleRename = async () => {
    if (editName.trim() === folder.name) {
      setEditing(false);
      return;
    }
    const result = await DocumentFolder.update(workspaceSlug, folder.id, {
      name: editName.trim(),
    });
    if (result.error) {
      showToast(`Error: ${result.error}`, "error");
    } else {
      showToast("Folder renamed", "success");
      onRefresh();
    }
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete folder "${folder.name}"? Documents will be moved out of the folder.`))
      return;
    const result = await DocumentFolder.delete(workspaceSlug, folder.id);
    if (result.success) {
      showToast("Folder deleted", "success");
      onRefresh();
    } else {
      showToast("Failed to delete folder", "error");
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const documentId = parseInt(e.dataTransfer.getData("documentId"), 10);
    if (!documentId) return;

    const result = await DocumentFolder.moveDocument(
      workspaceSlug,
      documentId,
      folder.id
    );
    if (result.success) {
      showToast("Document moved", "success");
      onRefresh();
    } else {
      showToast(result.error || "Failed to move document", "error");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div
      className={`rounded-lg mb-1 ${
        dragOver ? "bg-primary-button/20 ring-1 ring-primary-button" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex items-center gap-x-1 py-1.5 px-2 rounded-lg hover:bg-theme-file-picker-hover cursor-pointer group">
        <button
          onClick={() => setExpanded(!expanded)}
          className="border-none bg-transparent cursor-pointer p-0"
        >
          <CaretDown
            className={`text-white/70 w-3.5 h-3.5 transition-transform ${
              expanded ? "" : "-rotate-90"
            }`}
          />
        </button>
        <FolderNotch
          className="text-white/70 w-4 h-4 shrink-0"
          weight="fill"
        />
        {editing ? (
          <input
            className="bg-transparent border border-white/20 text-white text-sm rounded px-1 py-0.5 outline-none flex-1"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") {
                setEditName(folder.name);
                setEditing(false);
              }
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="text-white text-sm flex-1 truncate"
            onClick={() => setExpanded(!expanded)}
          >
            {folder.name}
          </span>
        )}
        <span className="text-white/30 text-xs mr-1">
          {folderDocuments.length + (folder.children?.length || 0)}
        </span>
        <div className="hidden group-hover:flex items-center gap-x-0.5">
          <CreateFolderButton
            workspaceSlug={workspaceSlug}
            parentId={folder.id}
            onCreated={onRefresh}
            small
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            className="border-none bg-transparent text-white/40 hover:text-white cursor-pointer p-0.5"
            title="Rename folder"
          >
            <PencilSimple className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="border-none bg-transparent text-white/40 hover:text-red-400 cursor-pointer p-0.5"
            title="Delete folder"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="ml-3">
          <FolderTree
            folders={folder.children || []}
            documents={documents}
            workspaceSlug={workspaceSlug}
            onRefresh={onRefresh}
            depth={depth + 1}
          />
          {folderDocuments.map((doc) => (
            <DocumentRow
              key={doc.id}
              document={doc}
              workspaceSlug={workspaceSlug}
              onRefresh={onRefresh}
            />
          ))}
          {folderDocuments.length === 0 &&
            (!folder.children || folder.children.length === 0) && (
              <p className="text-white/30 text-xs py-1 pl-6">
                Empty folder — drag documents here
              </p>
            )}
        </div>
      )}
    </div>
  );
}

function DocumentRow({ document, workspaceSlug, onRefresh }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("documentId", String(document.id));
  };

  const handleRemoveFromFolder = async () => {
    const result = await DocumentFolder.moveDocument(
      workspaceSlug,
      document.id,
      null
    );
    if (result.success) {
      showToast("Document removed from folder", "success");
      onRefresh();
    }
  };

  return (
    <div
      className="flex items-center gap-x-2 py-1 px-2 ml-4 rounded hover:bg-theme-file-picker-hover cursor-grab group"
      draggable
      onDragStart={handleDragStart}
    >
      <File className="text-white/50 w-3.5 h-3.5 shrink-0" />
      <span className="text-white/80 text-sm truncate flex-1">
        {document.filename}
      </span>
      <button
        onClick={handleRemoveFromFolder}
        className="border-none bg-transparent text-white/30 hover:text-white/60 cursor-pointer p-0.5 hidden group-hover:block"
        title="Remove from folder"
      >
        <Trash className="w-3 h-3" />
      </button>
    </div>
  );
}

function UnfiledDocuments({ documents, workspaceSlug, folders, onRefresh }) {
  const [dragOver, setDragOver] = useState(false);
  const allFolderIds = getAllFolderIds(folders);
  const unfiledDocs = documents.filter(
    (d) => !d.folderId || !allFolderIds.includes(d.folderId)
  );

  if (unfiledDocs.length === 0) return null;

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const documentId = parseInt(e.dataTransfer.getData("documentId"), 10);
    if (!documentId) return;

    const result = await DocumentFolder.moveDocument(
      workspaceSlug,
      documentId,
      null
    );
    if (result.success) {
      showToast("Document removed from folder", "success");
      onRefresh();
    }
  };

  return (
    <div
      className={`mt-4 pt-4 border-t border-white/10 ${
        dragOver ? "bg-primary-button/10 rounded-lg" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
    >
      <p className="text-white/50 text-xs font-medium mb-2 px-2">
        Unfiled Documents ({unfiledDocs.length})
      </p>
      {unfiledDocs.map((doc) => (
        <DocumentRow
          key={doc.id}
          document={doc}
          workspaceSlug={workspaceSlug}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}

function CreateFolderButton({
  workspaceSlug,
  parentId,
  onCreated,
  small = false,
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setCreating(false);
      return;
    }
    const result = await DocumentFolder.create(
      workspaceSlug,
      name.trim(),
      parentId
    );
    if (result.error) {
      showToast(`Error: ${result.error}`, "error");
    } else {
      showToast("Folder created", "success");
      onCreated();
    }
    setName("");
    setCreating(false);
  };

  if (creating) {
    return (
      <div className="flex items-center gap-x-1" onClick={(e) => e.stopPropagation()}>
        <input
          className="bg-transparent border border-white/20 text-white text-sm rounded px-2 py-1 outline-none w-32"
          placeholder="Folder name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
            if (e.key === "Escape") {
              setName("");
              setCreating(false);
            }
          }}
          autoFocus
        />
        <button
          onClick={handleCreate}
          className="border-none bg-primary-button text-white text-xs px-2 py-1 rounded hover:bg-primary-button/80 cursor-pointer"
        >
          Add
        </button>
      </div>
    );
  }

  if (small) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCreating(true);
        }}
        className="border-none bg-transparent text-white/40 hover:text-white cursor-pointer p-0.5"
        title="New subfolder"
      >
        <FolderPlus className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setCreating(true)}
      className="border-none flex items-center gap-x-2 px-3 py-1.5 rounded-lg bg-primary-button hover:bg-primary-button/80 text-white text-sm cursor-pointer"
    >
      <Plus size={14} weight="bold" />
      New Folder
    </button>
  );
}

function getAllFolderIds(folders) {
  const ids = [];
  for (const f of folders) {
    ids.push(f.id);
    if (f.children) ids.push(...getAllFolderIds(f.children));
  }
  return ids;
}
