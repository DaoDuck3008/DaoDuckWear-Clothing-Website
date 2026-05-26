"use client";

import { useDropzone } from "react-dropzone";
import { Upload, X, Star } from "lucide-react";

export type ImageItem = { file: File; preview: string };
export type ExistingImageItem = {
  id: string;
  url: string;
  color?: string;
  isMain?: boolean;
};

interface MainImageDropzoneProps {
  images: ImageItem[];
  onAdd: (files: File[]) => void;
  onRemove: (idx: number) => void;
  onSetMain?: (idx: number) => void;
  maxImages?: number;
  title?: string;
  note?: string;
  isMainPanel?: boolean;
}

export function MainImageDropzone({
  images,
  onAdd,
  onRemove,
  onSetMain,
  maxImages = 6,
  title = "Ảnh sản phẩm",
  note = "Ảnh đầu tiên là ảnh chính. Sẽ upload lên Cloudinary khi lưu.",
  isMainPanel = true,
}: MainImageDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    disabled: images.length >= maxImages,
    onDrop: (accepted) => onAdd(accepted),
  });

  return (
    <div className="bg-white border border-stone-100 p-5 space-y-4">
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-50">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-stone-400">
          {title}
        </h2>
        <span className="text-sm text-stone-300 font-bold">
          {images.length} / {maxImages}
        </span>
      </div>

      <div className="grid grid-cols-2  md:grid-cols-3 gap-3">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden bg-stone-50 aspect-square rounded-sm border border-stone-100"
          >
            <img src={img.preview} alt="" className="w-full h-full object-cover" />
            {isMainPanel && idx === 0 && (
              <span className="absolute top-1 left-1 bg-black text-white text-[8px] uppercase tracking-widest px-1.5 py-0.5 font-bold shadow-sm rounded-sm">
                Ảnh chính
              </span>
            )}
            {isMainPanel && idx > 0 && onSetMain && (
              <button
                type="button"
                onClick={() => onSetMain(idx)}
                className="absolute top-1 left-1 bg-white/90 shadow-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white transition-all text-stone-400"
                title="Đặt làm ảnh chính"
              >
                <Star className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="absolute top-1 right-1 bg-white/90 shadow-sm rounded-full p-1 hover:bg-white hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3 text-stone-700 hover:text-red-500 transition-colors" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <div
            {...getRootProps()}
            className={`border border-dashed transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer outline-none rounded-sm
              ${images.length === 0 ? "col-span-full py-8" : "aspect-square"}
              ${
                isDragActive
                  ? "border-black bg-stone-50 scale-[0.99]"
                  : "border-stone-200 hover:border-black hover:bg-stone-50"
              }`}
          >
            <input {...getInputProps()} />
            <Upload
              className={`w-4 h-4 transition-colors ${
                isDragActive ? "text-black" : "text-stone-300"
              }`}
            />
            {images.length === 0 ? (
              <div className="text-center space-y-0.5 px-4">
                <p
                  className={`text-[9px] uppercase tracking-widest font-medium transition-colors ${
                    isDragActive ? "text-black" : "text-stone-400"
                  }`}
                >
                  {isDragActive ? "Thả ảnh vào đây" : "Kéo thả hoặc click để chọn"}
                </p>
                <p className="text-[8px] text-stone-300 uppercase tracking-wider">
                  PNG, JPG, WEBP — Tối đa {maxImages} ảnh
                </p>
              </div>
            ) : (
              <span className="text-[8px] font-bold uppercase text-stone-400 tracking-widest mt-1">
                Thêm ảnh
              </span>
            )}
          </div>
        )}
      </div>

      {note && (
        <p className="text-[9px] text-stone-300 uppercase tracking-wider leading-relaxed">
          {note}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EditableImageDropzone: Dùng khi sửa sản phẩm để quản lý 
   ảnh cũ (từ Cloudinary URL) + ảnh mới (File local) cùng lúc.
   Badge "Cloud" = ảnh cũ, Badge "Mới" = ảnh vừa chọn thêm.
   ───────────────────────────────────────────────────────────── */

interface EditableImageDropzoneProps {
  existingImages: ExistingImageItem[];
  newImages: ImageItem[];
  onAddNew: (files: File[]) => void;
  onRemoveExisting: (id: string) => void;
  onRemoveNew: (idx: number) => void;
  onSetMainExisting?: (id: string) => void;
  maxImages?: number;
  title?: string;
  note?: string;
}

export function EditableImageDropzone({
  existingImages,
  newImages,
  onAddNew,
  onRemoveExisting,
  onRemoveNew,
  onSetMainExisting,
  maxImages = 8,
  title = "Ảnh sản phẩm",
  note,
}: EditableImageDropzoneProps) {
  const totalCount = existingImages.length + newImages.length;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    disabled: totalCount >= maxImages,
    onDrop: (accepted) => onAddNew(accepted),
  });

  return (
    <div className="bg-white border border-stone-100 p-5 space-y-4">
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-50">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-stone-400">
          {title}
        </h2>
        <span className="text-sm text-stone-300 font-bold">
          {totalCount} / {maxImages}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
        {/* Ảnh cũ từ Cloudinary */}
        {existingImages.map((img, idx) => (
          <div
            key={img.id}
            className="group relative overflow-hidden bg-stone-50 aspect-square rounded-sm border border-stone-100"
          >
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            {idx === 0 && (
              <span className="absolute top-1 left-1 bg-black text-white text-[8px] uppercase tracking-widest px-1.5 py-0.5 font-bold shadow-sm rounded-sm">
                Ảnh chính
              </span>
            )}
            {idx > 0 && onSetMainExisting && (
              <button
                type="button"
                onClick={() => onSetMainExisting(img.id)}
                className="absolute top-1 left-1 bg-white/90 shadow-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white transition-all text-stone-400"
                title="Đặt làm ảnh chính"
              >
                <Star className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemoveExisting(img.id)}
              className="absolute top-1 right-1 bg-white/90 shadow-sm rounded-full p-1 hover:bg-white hover:text-red-500 transition-colors"
              title="Xóa ảnh"
            >
              <X className="w-3 h-3 text-stone-700" />
            </button>
            <span className="absolute bottom-1 right-1 bg-sky-500/80 text-white text-[7px] px-1 py-0.5 rounded-sm font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              Cloud
            </span>
          </div>
        ))}

        {/* Ảnh mới thêm (local) */}
        {newImages.map((img, idx) => (
          <div
            key={`new-${idx}`}
            className="group relative overflow-hidden bg-stone-50 aspect-square rounded-sm border border-dashed border-emerald-300"
          >
            <img src={img.preview} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemoveNew(idx)}
              className="absolute top-1 right-1 bg-white/90 shadow-sm rounded-full p-1 hover:bg-white hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3 text-stone-700" />
            </button>
            <span className="absolute bottom-1 right-1 bg-emerald-500/80 text-white text-[7px] px-1 py-0.5 rounded-sm font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              Mới
            </span>
          </div>
        ))}

        {totalCount < maxImages && (
          <div
            {...getRootProps()}
            className={`border border-dashed transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer outline-none rounded-sm
              ${totalCount === 0 ? "col-span-full py-8" : "aspect-square"}
              ${
                isDragActive
                  ? "border-black bg-stone-50 scale-[0.99]"
                  : "border-stone-200 hover:border-black hover:bg-stone-50"
              }`}
          >
            <input {...getInputProps()} />
            <Upload
              className={`w-4 h-4 transition-colors ${
                isDragActive ? "text-black" : "text-stone-300"
              }`}
            />
            {totalCount === 0 ? (
              <div className="text-center space-y-0.5 px-4">
                <p className="text-[9px] uppercase tracking-widest font-medium text-stone-400">
                  {isDragActive ? "Thả ảnh vào đây" : "Kéo thả hoặc click để chọn"}
                </p>
                <p className="text-[8px] text-stone-300 uppercase tracking-wider">
                  PNG, JPG, WEBP
                </p>
              </div>
            ) : (
              <span className="text-[8px] font-bold uppercase text-stone-400 tracking-widest mt-1">
                Thêm ảnh
              </span>
            )}
          </div>
        )}
      </div>

      {note && (
        <p className="text-[9px] text-stone-300 uppercase tracking-wider leading-relaxed">
          {note}
        </p>
      )}
    </div>
  );
}
