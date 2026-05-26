import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { productApi } from "@/apis/product.api";
import { categoryApi } from "@/apis/category.api";
import { colorApi } from "@/apis/color.api";
import { useAuthStore } from "@/stores/auth.store";
import { handleApiError } from "@/utils/error.util";
import { ImageItem, ExistingImageItem } from "@/components/ui/ImageDropzone";
import { CategoryNode } from "@/components/ui/CategorySelect";
import { Color } from "./useProductCreate";
import { generateSKU } from "@/utils/product.util";
import { SIZES } from "@/constants/product";

export interface EditVariant {
  id: string;
  size: string;
  color: string;
  colorHexId?: string;
  price: string;
  sku: string;
  image?: string | null;
}

export const useProductEdit = (slugOrId: string) => {
  const router = useRouter();
  const { user } = useAuthStore();

  // --- Product Info ---
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("active");

  // --- Variants ---
  const [variants, setVariants] = useState<EditVariant[]>([]);

  // --- Images ---
  // Ảnh cũ từ Cloudinary (ảnh chung)
  const [existingMainImages, setExistingMainImages] = useState<
    ExistingImageItem[]
  >([]);
  // Ảnh cũ theo màu
  const [existingColorImages, setExistingColorImages] = useState<
    Record<string, ExistingImageItem[]>
  >({});
  // Ảnh mới chọn thêm (chung)
  const [newMainImages, setNewMainImages] = useState<ImageItem[]>([]);
  // Ảnh mới chọn theo màu
  const [newColorImages, setNewColorImages] = useState<
    Record<string, ImageItem[]>
  >({});
  // IDs ảnh cần xóa
  const [deleteImageIds, setDeleteImageIds] = useState<string[]>([]);

  // --- Meta ---
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang xử lý...");
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [colors, setColors] = useState<Color[]>([]);

  const uniqueColors = Array.from(
    new Set(variants.map((v) => v.color.trim()).filter(Boolean)),
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productData, categoriesData, colorsData] = await Promise.all([
          productApi.getProductBySlug(slugOrId),
          categoryApi.getCategories(),
          colorApi.getAll(),
        ]);

        setCategories(categoriesData);
        setColors(colorsData.data);

        // Fill product fields
        setProductId(productData.id);
        setName(productData.name);
        setSlug(productData.slug);
        setDescription(productData.description || "");
        setBasePrice(productData.basePrice?.toString() || "");
        setCategoryId(
          productData.category?.id || productData.category?._id || "",
        );
        setStatus(productData.status || "active");

        // Phân loại ảnh chung vs ảnh màu
        const allImages: any[] = productData.images || [];
        const mainImgs = allImages.filter((img: any) => !img.color);
        const colorImgsGrouped: Record<string, ExistingImageItem[]> = {};

        allImages
          .filter((img: any) => !!img.color)
          .forEach((img: any) => {
            const c = img.color?.toUpperCase();
            if (!c) return;
            if (!colorImgsGrouped[c]) colorImgsGrouped[c] = [];
            colorImgsGrouped[c].push({
              id: img.id || img._id,
              url: img.url,
              color: c,
              isMain: img.isMain,
            });
          });

        setExistingMainImages(
          mainImgs.map((img: any) => ({
            id: img.id || img._id,
            url: img.url,
            isMain: img.isMain || img.isThumbnail,
          })),
        );
        setExistingColorImages(colorImgsGrouped);

        const processedVariants: EditVariant[] = productData.variants.map(
          (v: any) => {
            return {
              id: v.id,
              size: v.size,
              color: v.color,
              colorHexId: v.colorHexId,
              price: v.price?.toString() || "",
              sku: v.sku || "",
              image: v.image,
            };
          },
        );
        setVariants(processedVariants);
      } catch (error) {
        handleApiError(error, "Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    if (slugOrId) fetchData();
  }, [slugOrId, user]);

  // --- Variant Handlers ---
  const updateVariant = (
    id: string,
    field: keyof EditVariant,
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  const addVariant = () => {
    const newVariant: EditVariant = {
      id: `new-${Date.now()}`, // ID tạm thời để React quản lý key
      size: "M",
      color: "DEFAULT",
      price: basePrice || "",
      sku: "",
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const addSizeToColor = (color: string, colorHexId?: string) => {
    setVariants((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        size: "M",
        color,
        colorHexId,
        price: basePrice || "",
        sku: "",
      },
    ]);
  };

  const updateColorGroup = (
    oldColor: string,
    newColor: string,
    newColorHexId?: string,
  ) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.color.trim() === oldColor.trim()
          ? { ...v, color: newColor, colorHexId: newColorHexId !== undefined ? newColorHexId : v.colorHexId }
          : v,
      ),
    );
    if (oldColor !== newColor) {
      setExistingColorImages((prev) => {
        const { [oldColor]: moved, ...rest } = prev;
        return moved ? { ...rest, [newColor]: moved } : rest;
      });
      setNewColorImages((prev) => {
        const { [oldColor]: moved, ...rest } = prev;
        return moved ? { ...rest, [newColor]: moved } : rest;
      });
    }
  };

  const removeColorGroup = (color: string) => {
    setVariants((prev) =>
      prev.filter((v) => v.color.trim() !== color.trim()),
    );
  };

  const addColorGroup = () => {
    const tempColor = `__NEW_COLOR_${Date.now()}`;
    setVariants((prev) => [
      ...prev,
      ...SIZES.map((size, i) => ({
        id: `new-${Date.now()}-${i}`,
        size,
        color: tempColor,
        price: basePrice || "",
        sku: "",
      })),
    ]);
  };

  // --- Existing Image Handlers ---
  const removeExistingMainImage = (id: string) => {
    setExistingMainImages((prev) => prev.filter((img) => img.id !== id));
    setDeleteImageIds((prev) => [...prev, id]);
  };

  const setMainExistingImage = (id: string) => {
    setExistingMainImages((prev) => {
      const idx = prev.findIndex((img) => img.id === id);
      if (idx <= 0) return prev;
      const arr = [...prev];
      const [moved] = arr.splice(idx, 1);
      arr.unshift(moved);
      return arr;
    });
  };

  const removeExistingColorImage = (color: string, id: string) => {
    setExistingColorImages((prev) => ({
      ...prev,
      [color]: (prev[color] || []).filter((img) => img.id !== id),
    }));
    setDeleteImageIds((prev) => [...prev, id]);
  };

  // --- New Image Handlers ---
  const addNewMainImages = (files: File[]) => {
    const added = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewMainImages((prev) => [...prev, ...added].slice(0, 8));
  };

  const removeNewMainImage = (idx: number) => {
    setNewMainImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const addNewColorImages = (color: string, files: File[]) => {
    const added = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewColorImages((prev) => ({
      ...prev,
      [color]: [...(prev[color] || []), ...added].slice(0, 8),
    }));
  };

  const removeNewColorImage = (color: string, idx: number) => {
    setNewColorImages((prev) => ({
      ...prev,
      [color]: prev[color].filter((_, i) => i !== idx),
    }));
  };

  const generateAutoSKUs = () => {
    if (!name) {
      toast.warning("Vui lòng nhập tên sản phẩm trước");
      return;
    }
    setVariants((prev) =>
      prev.map((v) => ({ ...v, sku: generateSKU(name, v.color, v.size) })),
    );
    toast.info("Đã cập nhật mã SKU cho toàn bộ biến thể");
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoadingMessage("Đang chuẩn bị dữ liệu...");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("basePrice", basePrice);
      formData.append("categoryId", categoryId);
      formData.append("status", status);
      formData.append(
        "variants",
        JSON.stringify(
          variants.map((v) => ({
            id: v.id.startsWith("new-") ? undefined : v.id,
            price: v.price,
            sku: v.sku,
            size: v.size,
            color: v.color,
            colorHexId: v.colorHexId,
          })),
        ),
      );
      formData.append("deleteImageIds", JSON.stringify(deleteImageIds));

      // Ảnh chung mới
      newMainImages.forEach((img, idx) => {
        formData.append(`common_${idx}`, img.file);
      });

      // Ảnh màu mới
      Object.keys(newColorImages).forEach((color) => {
        (newColorImages[color] || []).forEach((img, idx) => {
          formData.append(`color:${color}_${idx}`, img.file);
        });
      });

      setLoadingMessage("Đang upload ảnh và lưu sản phẩm...");
      const result = await productApi.updateProduct(productId, formData);

      toast.success("Cập nhật sản phẩm thành công!");
      router.push("/admin/products");
    } catch (error) {
      handleApiError(error, "Lỗi khi cập nhật sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Info
    productId,
    name,
    setName,
    slug,
    description,
    setDescription,
    basePrice,
    setBasePrice,
    categoryId,
    setCategoryId,
    status,
    setStatus,
    // Variants
    variants,
    updateVariant,
    generateAutoSKUs,
    // Existing images
    existingMainImages,
    existingColorImages,
    removeExistingMainImage,
    setMainExistingImage,
    removeExistingColorImage,
    // New images
    newMainImages,
    newColorImages,
    addNewMainImages,
    removeNewMainImage,
    addNewColorImages,
    removeNewColorImage,
    // Meta
    loading,
    isSubmitting,
    loadingMessage,
    categories,
    colors,
    uniqueColors,
    user,
    addVariant,
    addColorGroup,
    addSizeToColor,
    updateColorGroup,
    removeVariant,
    removeColorGroup,
    handleSubmit,
  };
};
