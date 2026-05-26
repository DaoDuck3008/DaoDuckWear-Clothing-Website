"use client";

import { useEffect, useRef, useState } from "react";
import {
  Edit,
  Filter,
  Loader2,
  Plus,
  Image,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Upload,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { bannerApi } from "@/apis/banner.api";
import { Select } from "@/components/ui/Select";
import { handleApiError } from "@/utils/error.util";
import { useConfirm } from "@/hooks/useConfirm";

const PAGE_OPTIONS = [
  { value: "home", label: "Trang chủ" },
  { value: "shop", label: "Cửa hàng" },
  { value: "login", label: "Đăng nhập" },
  { value: "register", label: "Đăng ký" },
];

const POSITION_OPTIONS = [
  { value: "hero", label: "Hero (Banner chính)" },
  { value: "sidebar", label: "Sidebar" },
  { value: "footer", label: "Footer" },
  { value: "popup", label: "Popup" },
];

const PAGE_LABELS: Record<string, string> = {
  home: "Trang chủ",
  shop: "Cửa hàng",
  login: "Đăng nhập",
  register: "Đăng ký",
};

const POSITION_LABELS: Record<string, string> = {
  hero: "Hero",
  sidebar: "Sidebar",
  footer: "Footer",
  popup: "Popup",
};

interface BannerForm {
  title: string;
  linkUrl: string;
  page: string;
  position: string;
  sortOrder: number;
  isActive: boolean;
  startAt: string;
  endAt: string;
}

const DEFAULT_FORM: BannerForm = {
  title: "",
  linkUrl: "",
  page: "home",
  position: "hero",
  sortOrder: 0,
  isActive: true,
  startAt: "",
  endAt: "",
};

function getBannerId(banner: any): string {
  return banner.id ?? banner._id;
}

export default function AdminBannersPage() {
  const { confirm, confirmDialog } = useConfirm();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [positionFilter, setPositionFilter] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<BannerForm>(DEFAULT_FORM);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [mobilePreview, setMobilePreview] = useState("");

  const imageRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await bannerApi.getBanners({
        position: positionFilter || undefined,
        isActive: isActiveFilter !== "" ? isActiveFilter : undefined,
      });
      setBanners(Array.isArray(data) ? data : data?.data ?? []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [positionFilter, isActiveFilter]);

  const openCreate = () => {
    setEditingBanner(null);
    setForm(DEFAULT_FORM);
    setImageFile(null);
    setImagePreview("");
    setMobileFile(null);
    setMobilePreview("");
    setShowModal(true);
  };

  const openEdit = (banner: any) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title ?? "",
      linkUrl: banner.linkUrl ?? "",
      page: banner.page ?? "home",
      position: banner.position ?? "hero",
      sortOrder: banner.sortOrder ?? 0,
      isActive: banner.isActive ?? true,
      startAt: banner.startAt ? banner.startAt.slice(0, 10) : "",
      endAt: banner.endAt ? banner.endAt.slice(0, 10) : "",
    });
    setImageFile(null);
    setImagePreview(banner.imageUrl ?? "");
    setMobileFile(null);
    setMobilePreview(banner.mobileImageUrl ?? "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "desktop" | "mobile",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "desktop") {
      setImageFile(file);
      setImagePreview(url);
    } else {
      setMobileFile(file);
      setMobilePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner && !imageFile) {
      toast.error("Vui lòng chọn ảnh desktop cho banner");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("page", form.page);
      fd.append("position", form.position);
      fd.append("sortOrder", String(form.sortOrder));
      fd.append("isActive", String(form.isActive));
      if (form.linkUrl) fd.append("linkUrl", form.linkUrl);
      if (form.startAt) fd.append("startAt", form.startAt);
      if (form.endAt) fd.append("endAt", form.endAt);
      if (imageFile) fd.append("image", imageFile);
      if (mobileFile) fd.append("mobileImage", mobileFile);

      if (editingBanner) {
        await bannerApi.updateBanner(getBannerId(editingBanner), fd);
        toast.success("Cập nhật banner thành công");
      } else {
        await bannerApi.createBanner(fd);
        toast.success("Thêm banner thành công");
      }

      closeModal();
      fetchBanners();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (banner: any) => {
    try {
      await bannerApi.toggleStatus(getBannerId(banner));
      toast.success(banner.isActive ? "Đã tắt banner" : "Đã bật banner");
      fetchBanners();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (banner: any) => {
    const ok = await confirm({
      title: "Xóa banner",
      description: "Bạn có chắc muốn xóa banner này? Thao tác không thể hoàn tác.",
      confirmText: "Xóa",
    });
    if (!ok) return;
    try {
      await bannerApi.deleteBanner(getBannerId(banner));
      toast.success("Đã xóa banner");
      fetchBanners();
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Banner</h1>
          <p className="text-sm text-slate-500">
            Quản lý các banner hiển thị trên website.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm banner
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <Select
          value={positionFilter}
          onChange={setPositionFilter}
          options={[
            { value: "", label: "Tất cả vị trí" },
            ...POSITION_OPTIONS,
          ]}
          className="w-full md:w-52"
        />
        <Select
          value={isActiveFilter}
          onChange={setIsActiveFilter}
          options={[
            { value: "", label: "Tất cả trạng thái" },
            { value: "true", label: "Đang hiển thị" },
            { value: "false", label: "Đã tắt" },
          ]}
          className="w-full md:w-48"
        />
        <button
          onClick={fetchBanners}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Filter className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            <p className="text-sm text-slate-500 font-medium">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <Image className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="text-slate-900 font-semibold">
                Chưa có banner nào
              </p>
              <p className="text-sm text-slate-500">
                Nhấn &quot;Thêm banner&quot; để bắt đầu.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ảnh
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Trang / Vị trí
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Thứ tự
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Hiển thị
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {banners.map((banner) => (
                  <tr
                    key={getBannerId(banner)}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="w-24 h-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                        {banner.imageUrl ? (
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-[200px]">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {banner.title}
                      </p>
                      {banner.linkUrl && (
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                          {banner.linkUrl}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider">
                          {PAGE_LABELS[banner.page] ?? banner.page}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                          {POSITION_LABELS[banner.position] ?? banner.position}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">
                        {banner.sortOrder ?? 0}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(banner)}
                        className="flex items-center gap-1.5 transition-colors"
                        title={
                          banner.isActive
                            ? "Đang hiển thị — nhấn để tắt"
                            : "Đang tắt — nhấn để bật"
                        }
                      >
                        {banner.isActive ? (
                          <ToggleRight className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-300" />
                        )}
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            banner.isActive
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          {banner.isActive ? "Bật" : "Tắt"}
                        </span>
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600">
                        {new Date(banner.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(banner)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-900">
                {editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner mới"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="VD: Summer Sale 2025"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all"
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Đường dẫn khi nhấn (tùy chọn)
                </label>
                <input
                  type="text"
                  value={form.linkUrl}
                  onChange={(e) =>
                    setForm({ ...form, linkUrl: e.target.value })
                  }
                  placeholder="/shop?sale=true"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all"
                />
              </div>

              {/* Page & Position */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Trang hiển thị <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={form.page}
                    onChange={(val) => setForm({ ...form, page: val })}
                    options={PAGE_OPTIONS}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Vị trí <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={form.position}
                    onChange={(val) => setForm({ ...form, position: val })}
                    options={POSITION_OPTIONS}
                  />
                </div>
              </div>

              {/* Sort order & isActive toggle */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Thứ tự sắp xếp
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm({ ...form, sortOrder: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all"
                  />
                </div>
                <div className="flex flex-col justify-end pb-1">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, isActive: !form.isActive })
                    }
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <div
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                        form.isActive ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                          form.isActive ? "translate-x-5" : ""
                        }`}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {form.isActive ? "Đang hiển thị" : "Tắt"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={form.startAt}
                    onChange={(e) =>
                      setForm({ ...form, startAt: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={form.endAt}
                    onChange={(e) =>
                      setForm({ ...form, endAt: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              {/* Desktop image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Ảnh Desktop{" "}
                  {!editingBanner && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "desktop")}
                />
                {imagePreview ? (
                  <div className="relative group w-full aspect-[3/1] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={imagePreview}
                      alt="preview desktop"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => imageRef.current?.click()}
                        className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg"
                      >
                        Đổi ảnh
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageRef.current?.click()}
                    className="w-full aspect-[3/1] rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-400 flex flex-col items-center justify-center gap-2 transition-colors group"
                  >
                    <Upload className="w-6 h-6 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    <span className="text-xs text-slate-400 group-hover:text-slate-600 font-medium">
                      Nhấn để chọn ảnh desktop
                    </span>
                    <span className="text-[10px] text-slate-300">
                      Khuyến nghị: 1920×600px
                    </span>
                  </button>
                )}
              </div>

              {/* Mobile image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Ảnh Mobile{" "}
                  <span className="text-slate-400 normal-case font-normal">
                    (tùy chọn)
                  </span>
                </label>
                <input
                  ref={mobileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "mobile")}
                />
                {mobilePreview ? (
                  <div className="relative group w-full aspect-[2/1] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={mobilePreview}
                      alt="preview mobile"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => mobileRef.current?.click()}
                        className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg"
                      >
                        Đổi ảnh
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileFile(null);
                          setMobilePreview("");
                        }}
                        className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => mobileRef.current?.click()}
                    className="w-full aspect-[2/1] rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-400 flex flex-col items-center justify-center gap-2 transition-colors group"
                  >
                    <Upload className="w-6 h-6 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    <span className="text-xs text-slate-400 group-hover:text-slate-600 font-medium">
                      Nhấn để chọn ảnh mobile
                    </span>
                    <span className="text-[10px] text-slate-300">
                      Khuyến nghị: 768×400px
                    </span>
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all"
                >
                  {submitting && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {editingBanner ? "Lưu thay đổi" : "Tạo banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDialog}
    </div>
  );
}
