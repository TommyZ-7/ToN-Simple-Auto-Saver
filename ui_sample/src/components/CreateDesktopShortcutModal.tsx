import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Folder, Monitor, ImageIcon, RotateCcw } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { Button, Input, Modal, IconPickerGrid, IconDisplay } from "./common";
import type { Shortcut, DesktopShortcutOptions } from "../types";

type IconSourceType = "image" | "preset";

interface CreateDesktopShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcut: Shortcut;
}

interface CropArea {
  x: number;
  y: number;
  size: number;
}

// Get SVG path for preset icons
const getIconPath = (iconKey: string): string => {
  const paths: Record<string, string> = {
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
    rocket:
      '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>',
    briefcase:
      '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
    gamepad:
      '<line x1="6" x2="10" y1="12" y2="12"></line><line x1="8" x2="8" y1="10" y2="14"></line><line x1="15" x2="15.01" y1="13" y2="13"></line><line x1="18" x2="18.01" y1="11" y2="11"></line><rect width="20" height="12" x="2" y="6" rx="2"></rect>',
    wrench:
      '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>',
    chart:
      '<line x1="12" x2="12" y1="20" y2="10"></line><line x1="18" x2="18" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="16"></line>',
    palette:
      '<circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"></path>',
    settings:
      '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>',
    lightbulb:
      '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
    target:
      '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',
    folder:
      '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>',
    globe:
      '<circle cx="12" cy="12" r="10"></circle><line x1="2" x2="22" y1="12" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
    clock:
      '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    terminal:
      '<polyline points="4 17 10 11 4 5"></polyline><line x1="12" x2="20" y1="19" y2="19"></line>',
    code: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
    music:
      '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>',
    image:
      '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>',
    video:
      '<path d="m22 8-6 4 6 4V8Z"></path><rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><line x1="10" x2="8" y1="9" y2="9"></line>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>',
    message:
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
    calendar:
      '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line>',
    calculator:
      '<rect width="16" height="20" x="4" y="2" rx="2"></rect><line x1="8" x2="16" y1="6" y2="6"></line><line x1="16" x2="16" y1="14" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path>',
  };
  return paths[iconKey] || paths.zap;
};

export function CreateDesktopShortcutModal({
  isOpen,
  onClose,
  shortcut,
}: CreateDesktopShortcutModalProps) {
  // State
  const [name, setName] = useState(shortcut.name);
  const [borderRadius, setBorderRadius] = useState(20);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Icon source type
  const [iconSource, setIconSource] = useState<IconSourceType>("image");
  const [selectedPresetIcon, setSelectedPresetIcon] = useState<string>("zap");

  // Image state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(shortcut.name);
      setBorderRadius(20);
      setIconSource("image");
      setSelectedPresetIcon("zap");
      setImagePreview(null);
      setCropArea(null);
      setCroppedImage(null);
      setError(null);
    }
  }, [isOpen, shortcut.name]);

  // Handle image selection
  const handleSelectImage = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Images",
            extensions: ["png", "jpg", "jpeg", "gif", "bmp", "webp"],
          },
        ],
      });

      if (selected) {
        // Read file using Tauri fs plugin
        const fileData = await readFile(selected as string);
        const blob = new Blob([fileData]);
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setImagePreview(dataUrl);
          setCroppedImage(null);
          setCropArea(null);
        };
        reader.readAsDataURL(blob);
      }
    } catch (err) {
      console.error("Failed to select image:", err);
    }
  };

  // Handle image load to get dimensions
  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

      // Auto-center crop area
      const size = Math.min(img.naturalWidth, img.naturalHeight);
      setCropArea({
        x: (img.naturalWidth - size) / 2,
        y: (img.naturalHeight - size) / 2,
        size,
      });
    },
    [],
  );

  // Apply crop and corner radius
  const applyCropAndRadius = useCallback(() => {
    if (!imagePreview || !cropArea || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const outputSize = 256;

      canvas.width = outputSize;
      canvas.height = outputSize;

      // Clear canvas
      ctx.clearRect(0, 0, outputSize, outputSize);

      // Create rounded rectangle path if borderRadius > 0
      const radius = (outputSize * borderRadius) / 100;

      ctx.beginPath();
      if (radius > 0) {
        ctx.moveTo(radius, 0);
        ctx.lineTo(outputSize - radius, 0);
        ctx.quadraticCurveTo(outputSize, 0, outputSize, radius);
        ctx.lineTo(outputSize, outputSize - radius);
        ctx.quadraticCurveTo(
          outputSize,
          outputSize,
          outputSize - radius,
          outputSize,
        );
        ctx.lineTo(radius, outputSize);
        ctx.quadraticCurveTo(0, outputSize, 0, outputSize - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
      } else {
        ctx.rect(0, 0, outputSize, outputSize);
      }
      ctx.closePath();
      ctx.clip();

      // Draw cropped image
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.size,
        cropArea.size,
        0,
        0,
        outputSize,
        outputSize,
      );

      // Get the result as base64
      setCroppedImage(canvas.toDataURL("image/png"));
    };
    img.src = imagePreview;
  }, [imagePreview, cropArea, borderRadius]);

  // Auto-apply when crop area or border radius changes
  useEffect(() => {
    if (cropArea) {
      applyCropAndRadius();
    }
  }, [cropArea, borderRadius, applyCropAndRadius]);

  // Generate icon from preset
  const generatePresetIconImage = useCallback(async () => {
    if (iconSource !== "preset" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const outputSize = 256;

    canvas.width = outputSize;
    canvas.height = outputSize;

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, outputSize, outputSize);

    // Draw background with border radius
    const radius = (outputSize * borderRadius) / 100;
    ctx.beginPath();
    if (radius > 0) {
      ctx.moveTo(radius, 0);
      ctx.lineTo(outputSize - radius, 0);
      ctx.quadraticCurveTo(outputSize, 0, outputSize, radius);
      ctx.lineTo(outputSize, outputSize - radius);
      ctx.quadraticCurveTo(
        outputSize,
        outputSize,
        outputSize - radius,
        outputSize,
      );
      ctx.lineTo(radius, outputSize);
      ctx.quadraticCurveTo(0, outputSize, 0, outputSize - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
    } else {
      ctx.rect(0, 0, outputSize, outputSize);
    }
    ctx.closePath();
    ctx.fillStyle = "#3d3d3d";
    ctx.fill();

    // Draw icon using SVG
    const iconKey = selectedPresetIcon;
    // Create SVG string for the icon
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${getIconPath(iconKey)}</svg>`;

    const img = new Image();
    img.onload = () => {
      const iconSize = 160;
      const iconX = (outputSize - iconSize) / 2;
      const iconY = (outputSize - iconSize) / 2;
      ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
      setCroppedImage(canvas.toDataURL("image/png"));
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgString);
  }, [iconSource, selectedPresetIcon, borderRadius]);

  // Update preset icon when changed
  useEffect(() => {
    if (iconSource === "preset") {
      generatePresetIconImage();
    }
  }, [iconSource, selectedPresetIcon, borderRadius, generatePresetIconImage]);

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Get desktop path
      const desktopPath = await invoke<string>("get_desktop_path");
      const targetPath = `${desktopPath}\\${name}`;

      // Prepare options
      const options: DesktopShortcutOptions = {
        name,
        borderRadius,
        customIconData: croppedImage
          ? croppedImage.replace(/^data:image\/\w+;base64,/, "")
          : undefined,
      };

      // Create shortcut
      await invoke("create_desktop_shortcut", {
        request: {
          shortcutId: shortcut.id,
          targetPath,
          options,
        },
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  // Handle save to custom location
  const handleSaveAs = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "保存先フォルダを選択",
      });

      if (selected) {
        setSaving(true);
        setError(null);

        const targetPath = `${selected}\\${name}`;

        const options: DesktopShortcutOptions = {
          name,
          borderRadius,
          customIconData: croppedImage
            ? croppedImage.replace(/^data:image\/\w+;base64,/, "")
            : undefined,
        };

        await invoke("create_desktop_shortcut", {
          request: {
            shortcutId: shortcut.id,
            targetPath,
            options,
          },
        });

        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="デスクトップショートカットを作成"
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Name */}
        <Input
          label="ショートカット名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ショートカット名を入力..."
        />

        {/* Icon Image Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-300">
            アイコン
          </label>

          {/* Source Type Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
            <button
              onClick={() => setIconSource("image")}
              className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
                iconSource === "image"
                  ? "bg-[#0078d4] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Upload className="w-4 h-4 inline-block mr-2" />
              画像から作成
            </button>
            <button
              onClick={() => setIconSource("preset")}
              className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
                iconSource === "preset"
                  ? "bg-[#0078d4] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ImageIcon className="w-4 h-4 inline-block mr-2" />
              プリセットアイコン
            </button>
          </div>

          <div className="flex gap-4">
            {/* Image Selection / Preset Selection */}
            <div className="flex-1">
              {iconSource === "image" ? (
                // Image upload mode
                !imagePreview ? (
                  <button
                    onClick={handleSelectImage}
                    className="w-full h-40 border-2 border-dashed border-white/20 rounded-lg hover:border-[#0078d4]/50 hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      クリックして画像を選択
                    </span>
                  </button>
                ) : (
                  <div className="relative">
                    {/* Image Preview with Crop Overlay */}
                    <div className="relative w-full h-40 bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        ref={imageRef}
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                        onLoad={handleImageLoad}
                      />
                      {cropArea && (
                        <div
                          className="absolute border-2 border-[#0078d4] pointer-events-none"
                          style={{
                            left: `${(cropArea.x / imageSize.width) * 100}%`,
                            top: `${(cropArea.y / imageSize.height) * 100}%`,
                            width: `${(cropArea.size / imageSize.width) * 100}%`,
                            height: `${(cropArea.size / imageSize.height) * 100}%`,
                          }}
                        />
                      )}
                    </div>
                    <button
                      onClick={handleSelectImage}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded hover:bg-black/70 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )
              ) : (
                // Preset icon mode
                <div className="space-y-3">
                  <IconPickerGrid
                    selectedIcon={selectedPresetIcon}
                    onSelect={setSelectedPresetIcon}
                  />
                </div>
              )}
            </div>

            {/* Result Preview */}
            <div className="w-32 flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500">プレビュー</span>
              <div
                className="w-24 h-24 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden"
                style={{
                  borderRadius: `${(24 * borderRadius) / 100}px`,
                }}
              >
                {croppedImage ? (
                  <img
                    src={croppedImage}
                    alt="Result"
                    className="w-full h-full object-cover"
                  />
                ) : iconSource === "preset" ? (
                  <IconDisplay
                    iconKey={selectedPresetIcon}
                    size={40}
                    className="text-gray-300"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-600" />
                )}
              </div>
            </div>
          </div>

          {/* Border Radius Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">角丸め</span>
              <span className="text-sm text-gray-500">{borderRadius}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#0078d4]"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>四角</span>
              <span>丸</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="secondary" onClick={handleSaveAs} disabled={saving}>
            <Folder className="w-4 h-4" />
            保存先を選択...
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? (
              <>保存中...</>
            ) : (
              <>
                <Monitor className="w-4 h-4" />
                デスクトップに作成
              </>
            )}
          </Button>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Modal>
  );
}
