export const provinceApi = {
  getProvinces: async () => {
    const response = await fetch("https://provinces.open-api.vn/api/v2/p/");
    return response.json();
  },
  getWards: async (provinceCode: number) => {
    const response = await fetch(
      `https://provinces.open-api.vn/api/v2/w?province=${provinceCode}`,
    );
    return response.json();
  },
};
