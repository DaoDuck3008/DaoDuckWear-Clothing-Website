import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Variant } from "@/types/product";
import { uid, toSlug, generateSKU } from "@/utils/product.util";
import { SIZES } from "@/constants/product";
import {
  validateProductForm,
  ProductFormErrors,
} from "@/validators/product.validator";
import { productApi } from "@/apis/product.api";
import { categoryApi } from "@/apis/category.api";
import { colorApi } from "@/apis/color.api";
import { CategoryNode } from "@/components/ui/CategorySelect";
import { ImageItem } from "@/components/ui/ImageDropzone";
import { handleApiError } from "@/utils/error.util";
import { useAuthStore } from "@/stores/auth.store";

export interface Color {
  id: string;
  name: string;
  slug: string;
  hexCode: string;
}

/**
 * Custom hook quản lý logic form sản phẩm.
 */
export const useProductCreate = () => {
  const router = useRouter();

  // --- States ---
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("active");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [mainImages, setMainImages] = useState<ImageItem[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, ImageItem[]>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang xử lý...");
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesData, colorsData] = await Promise.all([
          categoryApi.getCategories(),
          colorApi.getAll(),
        ]);
        setCategories(categoriesData);
        setColors(colorsData.data);
      } catch (error) {
        handleApiError(error, "Lỗi khi lấy dữ liệu ban đầu");
      }
    };
    fetchInitialData();
  }, []);

  // --- Computed ---
  const uniqueColors = Array.from(
    new Set(variants.map((v) => v.color.trim()).filter(Boolean)),
  );

  // --- Handlers ---
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(toSlug(val));
  };

  const addVariant = () => {
    const tempColor = `__NEW_${uid()}`;
    setVariants((prev) => [
      ...prev,
      ...SIZES.map((size) => ({
        id: uid(),
        size,
        color: tempColor,
        price: "",
        sku: "",
        stock: "0",
      })),
    ]);
  };

  const addSizeToColor = (color: string, colorHexId?: string) => {
    setVariants((prev) => [
      ...prev,
      {
        id: uid(),
        size: "",
        color: color,
        colorHexId: colorHexId,
        price: "",
        sku: "",
        stock: "0",
      },
    ]);
  };

  const updateVariant = <K extends keyof Variant>(
    id: string,
    field: K,
    value: Variant[K],
  ) => {
    setVariants((prev) => {
      const currentVariant = prev.find((v) => v.id === id);
      if (!currentVariant) return prev;

      if (field === "size" && value !== "") {
        const isDuplicate = prev.some(
          (v) =>
            v.id !== id &&
            v.color.trim().toUpperCase() ===
              currentVariant.color.trim().toUpperCase() &&
            v.size === value,
        );

        if (isDuplicate) {
          toast.error(
            `Size ${value} đã tồn tại cho màu ${currentVariant.color}`,
          );
          return prev;
        }
      }

      return prev.map((v) => (v.id === id ? { ...v, [field]: value } : v));
    });
  };

  const updateColorGroup = (
    oldColor: string,
    newColor: string,
    newColorHexId?: string,
  ) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.color === oldColor) {
          return {
            ...v,
            color: newColor,
            colorHexId: newColorHexId || v.colorHexId,
          };
        }
        return v;
      }),
    );
    if (oldColor !== newColor) {
      setColorImages((prev) => {
        const { [oldColor]: moved, ...rest } = prev;
        return moved ? { ...rest, [newColor]: moved } : rest;
      });
    }
  };

  const removeVariant = (id: string) =>
    setVariants((prev) => prev.filter((v) => v.id !== id));

  const removeColorGroup = (color: string) => {
    setVariants((prev) => prev.filter((v) => v.color !== color));
  };

  const handleColorImages = (color: string, files: File[]) => {
    const added = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setColorImages((prev) => ({
      ...prev,
      [color]: [...(prev[color] || []), ...added].slice(0, 6),
    }));
  };

  const removeColorImage = (color: string, idx: number) => {
    setColorImages((prev) => ({
      ...prev,
      [color]: prev[color].filter((_, i) => i !== idx),
    }));
  };

  const handleSetMainColorImage = (color: string, idx: number) => {
    setColorImages((prev) => {
      const arr = [...(prev[color] || [])];
      const [moved] = arr.splice(idx, 1);
      arr.unshift(moved);
      return { ...prev, [color]: arr };
    });
  };

  const handleMainImages = (files: File[]) => {
    const added = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setMainImages((prev) => [...prev, ...added].slice(0, 6));
  };

  const removeMainImage = (idx: number) =>
    setMainImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSetMainImage = (idx: number) => {
    setMainImages((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(idx, 1);
      arr.unshift(moved);
      return arr;
    });
  };

  const generateAutoSKUs = () => {
    if (!name) {
      toast.warning("Vui lòng nhập tên sản phẩm trước");
      return;
    }

    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        sku: generateSKU(name, v.color, v.size),
      })),
    );
    toast.info("Đã cập nhật mã SKU cho toàn bộ biến thể");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateProductForm({
      name,
      categoryId,
      basePrice,
      variants,
      mainImages,
      colorImages,
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setLoadingMessage("Đang chuẩn bị dữ liệu...");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      formData.append("description", description);
      formData.append("basePrice", basePrice.toString());
      formData.append("categoryId", categoryId);
      formData.append("status", status);
      formData.append("variants", JSON.stringify(variants.map(v => ({
        size: v.size,
        color: v.color,
        colorHexId: v.colorHexId,
        price: v.price,
        sku: v.sku
      }))));

      mainImages.forEach((img, idx) => {
        formData.append(`common_${idx}`, img.file);
      });

      Object.keys(colorImages).forEach((color) => {
        colorImages[color].forEach((img, idx) => {
          formData.append(`color:${color}_${idx}`, img.file);
        });
      });

      setLoadingMessage("Đang upload ảnh và lưu sản phẩm...");
      await productApi.createProduct(formData);

      toast.success("Tạo sản phẩm thành công!");
      router.push("/admin/products");
    } catch (error: any) {
      handleApiError(error, "Lỗi khi tạo sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    slug,
    setSlug,
    description,
    setDescription,
    basePrice,
    setBasePrice,
    categoryId,
    setCategoryId,
    status,
    setStatus,
    variants,
    setVariants,
    mainImages,
    colorImages,
    isSubmitting,
    loadingMessage,
    categories,
    colors,
    errors,
    uniqueColors,
    handleNameChange,
    addVariant,
    addSizeToColor,
    updateVariant,
    updateColorGroup,
    removeVariant,
    removeColorGroup,
    handleColorImages,
    removeColorImage,
    handleSetMainColorImage,
    handleMainImages,
    removeMainImage,
    handleSetMainImage,
    generateAutoSKUs,
    handleSubmit,
    user,
  };
};
