export interface ProductFormErrors {
  name?: string;
  categoryId?: string;
  shopId?: string;
  basePrice?: string;
  variants?: string;
  images?: string;
}

export const validateProductForm = (data: {
  name: string;
  categoryId: string;
  basePrice: number | string;
  variants: any[];
  mainImages: any[];
  colorImages: Record<string, any[]>;
}): ProductFormErrors => {
  const errors: ProductFormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Tên sản phẩm không được để trống';
  }

  if (!data.categoryId) {
    errors.categoryId = 'Vui lòng chọn danh mục';
  }

  const price = Number(data.basePrice);
  if (isNaN(price) || price < 0) {
    errors.basePrice = 'Giá sản phẩm không hợp lệ';
  }

  if (data.variants.length === 0) {
    errors.variants = 'Cần ít nhất một biến thể';
  } else {
    // Check if colors and sizes are filled
    const hasEmpty = data.variants.some((v) => !v.color || !v.size || !v.sku);
    if (hasEmpty) {
      errors.variants = 'Vui lòng điền đủ Size, Màu và SKU cho các biến thể';
    }
    
    // Check if each unique color has at least one image
    const uniqueColors = Array.from(new Set(data.variants.map(v => v.color).filter(Boolean)));
    for (const color of uniqueColors) {
        if (!data.colorImages[color] || data.colorImages[color].length === 0) {
            errors.images = `Màu "${color}" chưa có hình ảnh nào`;
            break;
        }
    }
  }

  return errors;
};
