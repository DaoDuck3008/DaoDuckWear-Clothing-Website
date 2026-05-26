"use client";

export default function SizeGuide() {
  const sizeData = [
    {
      size: "S",
      weight: "45 - 55kg",
      height: "1m50 - 1m60",
      length: "68",
      width: "52",
    },
    {
      size: "M",
      weight: "55 - 65kg",
      height: "1m60 - 1m70",
      length: "70",
      width: "54",
    },
    {
      size: "L",
      weight: "65 - 75kg",
      height: "1m70 - 1m80",
      length: "72",
      width: "56",
    },
    {
      size: "XL",
      weight: "75 - 85kg",
      height: "1m80 - 1m90",
      length: "74",
      width: "58",
    },
  ];

  return (
    <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="overflow-hidden border border-stone-100 rounded-sm mb-8">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">
                Size
              </th>
              <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-center">
                Cân nặng
              </th>
              <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-center">
                Chiều cao
              </th>
              <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-right">
                Dài/Rộng (cm)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {sizeData.map((item) => (
              <tr
                key={item.size}
                className="hover:bg-stone-50/50 transition-colors"
              >
                <td className="px-6 py-4 font-bold text-black">{item.size}</td>
                <td className="px-6 py-4 text-stone-500 text-center">
                  {item.weight}
                </td>
                <td className="px-6 py-4 text-stone-500 text-center">
                  {item.height}
                </td>
                <td className="px-6 py-4 text-stone-900 font-medium text-right">
                  {item.length} / {item.width}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black mb-3">
            Lưu ý về kích thước:
          </h4>
          <ul className="list-disc list-inside text-xs text-stone-500 leading-relaxed space-y-2">
            <li>Thông số trên mang tính chất tham khảo (độ chính xác ~95%).</li>
            <li>
              Nếu bạn nằm giữa 2 size, chúng tôi khuyên bạn nên chọn size lớn
              hơn để thoải mái hơn.
            </li>
            <li>Sản phẩm có độ co giãn nhẹ sau lần giặt đầu tiên.</li>
          </ul>
        </div>

        <div className="p-6 bg-stone-50 border-l-2 border-black">
          <p className="text-xs italic text-stone-600 leading-relaxed">
            "Chúng tôi hiểu rằng mỗi vóc dáng là duy nhất. Nếu bạn vẫn còn băn
            khoăn, hãy nhắn tin trực tiếp để đội ngũ stylist của DaoDuck hỗ trợ
            bạn chọn được size ưng ý nhất."
          </p>
        </div>
      </div>
    </div>
  );
}
