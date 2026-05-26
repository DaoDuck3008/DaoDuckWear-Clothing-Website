/**
 * Utility functions for Products
 */

export const uid = () => Math.random().toString(36).slice(2, 9);

// Convert string to slug (remove accents, spaces, special characters)
export const toSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD") // Convert to Unicode Normalization Form D (canonical decomposition)
    .replace(/[̀-ͯ]/g, "") // Remove diacritics (accents)
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

/**
 * Generate SKU based on format: [BrandPrefix][TypePrefix][YYMMDD][Warehouse]-[Size]-[ColorCode]-[Suffix]
 * Example: UNLE260507HCM-S-H-K3F (Uniqlo - Len - 2026/05/07 - HCM - S - Hồng - random)
 *
 * Quy tắc tạo SKU:
 * - BrandPrefix (2 ký tự): 2 ký tự đầu của từ CUỐI trong tên sản phẩm (thường là thương hiệu)
 *   VD: "Áo Len Uniqlo" → "UN"
 * - TypePrefix (2 ký tự): 2 ký tự đầu của từ THỨ HAI trong tên sản phẩm (thường là loại hàng)
 *   VD: "Áo Len Uniqlo" → "LE"
 * - YYMMDD (6 ký tự): Ngày tạo theo định dạng năm-tháng-ngày
 *   VD: 07/05/2026 → "260507"
 * - Warehouse: Kho xuất hàng, hiện tại cố định là "HCM"
 * - Size: Kích cỡ sản phẩm (S, M, L, XL...)
 * - ColorCode (1 ký tự): Ký tự đầu tiên của màu sắc
 *   VD: "Hồng" → "H"
 * - Suffix (3 ký tự): Chuỗi ngẫu nhiên để giảm khả năng trùng SKU
 *
 * Lưu ý: SKU này chỉ mang tính gợi ý, không đảm bảo unique tuyệt đối.
 * Cần kiểm tra trùng lặp ở phía server trước khi lưu.
 */
export const generateSKU = (
  productName: string,
  color: string,
  size: string,
): string => {

  console.log(">>> productName: ", productName);
  console.log(">>> color: ", color);
  console.log(">>> size: ", size);
  // Dọn dẹp chuỗi để tránh các ký tự đặc biệt và khoảng trắng
  const cleanString = (str: string) =>
    (str ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .toUpperCase()
      .trim();

  // Tách tên sản phẩm thành các từ
  const words = cleanString(productName).split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";

  // Lấy 2 ký tự đầu của từ CUỐI trong tên sản phẩm (thường là thường hiệu)
  const brandPrefix = words.length > 1 ? words[words.length - 1].substring(0, 2) : "DD";

  // Lấy 2 ký tự đầu của từ THỨ HAI trong tên sản phẩm (thường là loại hàng)
  const typePrefix = words.length > 1 ? (words[1].substring(0, 2) + "X").substring(0, 2) : words[0].substring(0, 2);

  // Lấy ngày tạo theo định dạng năm-tháng-ngày
  const now = new Date();
  const datePart =
    now.getFullYear().toString().slice(2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const warehouse = "HCM";

  // Lấy ký tự đầu tiên của màu sắc
  const colorPart = cleanString(color).substring(0, 1) || "X";
  // Lấy kích cỡ sản phẩm
  const sizePart = cleanString(size) || "N";
  // Lấy chuỗi ngẫu nhiên để giảm khả năng trùng SKU
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();

  return `${brandPrefix}${typePrefix}${datePart}${warehouse}-${colorPart}-${sizePart}-${suffix}`;
};
