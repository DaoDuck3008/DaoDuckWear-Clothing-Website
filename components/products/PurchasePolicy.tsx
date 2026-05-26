"use client";

import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";

export default function PurchasePolicy() {
  const policies = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Giao hàng toàn quốc",
      desc: "Miễn phí vận chuyển cho đơn hàng từ 1.000.000đ. Giao hàng hỏa tốc trong nội thành Hà Nội/TP.HCM.",
    },
    {
      icon: <RotateCcw className="w-6 h-6" />,
      title: "Đổi trả dễ dàng",
      desc: "Hỗ trợ đổi size hoặc mẫu khác trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên tem mác.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Chất lượng đảm bảo",
      desc: "Tất cả sản phẩm đều được kiểm tra kỹ lưỡng về chất liệu và đường may trước khi đóng gói gửi tới khách hàng.",
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Hỗ trợ 24/7",
      desc: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng giải đáp mọi thắc mắc của bạn qua Hotline hoặc Fanpage.",
    },
  ];

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {policies.map((item, idx) => (
          <div
            key={idx}
            className="flex gap-6 p-6 border border-stone-100 hover:border-black transition-all group"
          >
            <div className="text-stone-300 group-hover:text-black transition-colors shrink-0">
              {item.icon}
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black mb-2">
                {item.title}
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-stone-900 text-white text-center">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-4">
          Cam kết của DaoDuck Wear
        </h4>
        <p className="text-xs text-stone-400 max-w-lg mx-auto leading-loose">
          "Chúng tôi không chỉ bán quần áo, chúng tôi mang đến sự tự tin và
          phong cách sống. Sự hài lòng của bạn là ưu tiên cao nhất của chúng
          tôi."
        </p>
      </div>
    </div>
  );
}
