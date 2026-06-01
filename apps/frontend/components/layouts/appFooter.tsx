import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="bg-stone-100 text-black font-sans text-xs uppercase tracking-[0.2em] leading-relaxed w-full py-24 px-6 lg:px-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end max-w-[1920px] mx-auto">
        <div>
          <Link
            className="font-cormorant text-2xl italic font-bold tracking-tighter text-black block mb-8"
            href="/"
          >
            DAODUCK WEAR
          </Link>
          <div className="flex gap-6 mb-8">
            <a className="hover:opacity-60 transition-opacity" href="#">
              <img
                src="/assets/FacebookIcon.png"
                alt="Facebook"
                className="w-5 h-5 object-contain grayscale"
              />
            </a>
            <a className="hover:opacity-60 transition-opacity" href="#">
              <img
                src="/assets/InstagramIcon.png"
                alt="Instagram"
                className="w-5 h-5 object-contain grayscale"
              />
            </a>
            <a className="hover:opacity-60 transition-opacity" href="#">
              <img
                src="/assets/YoutubeIcon.png"
                alt="Youtube"
                className="w-5 h-5 object-contain grayscale"
              />
            </a>
          </div>
          <div className="text-stone-500 mt-8 normal-case tracking-normal space-y-2">
            <p>Email: contact@daoDuckWear.com</p>
            <p>Hotline: 1800 1234</p>
            <p>97 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh</p>
          </div>

          <div className="mt-8 max-w-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-3">
              Cửa hàng
            </p>
            <div className="overflow-hidden border border-stone-200">
              <iframe
                title="Bản đồ cửa hàng DaoDuck Wear"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4576338624224!2d106.68794632950774!3d10.77621907635933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3afd00864b%3A0x6dbfd49ac20b5649!2zUU1HUitHNFYsIDk3IFbDtSBWxINuIFThuqduLCBYdcOibiBIw7JhLCBI4buTIENow60gTWluaCA3MDAwMDAsIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1780321906983!5m2!1sen!2s"
                width="100%"
                height="180"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block w-full grayscale transition-all duration-500 hover:grayscale-0"
                style={{ border: 0 }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end space-y-8">
          <nav className="flex flex-wrap md:flex-col md:items-end gap-x-6 gap-y-4">
            <Link
              className="text-black border-b border-black pb-0.5 font-medium text-[11px] uppercase tracking-[0.25em] transition-all"
              href="/products"
            >
              Cửa hàng
            </Link>
            <Link
              className="text-stone-500 font-medium hover:text-black text-[11px] uppercase tracking-[0.25em] transition-all"
              href="/products?gender=men"
            >
              Nam
            </Link>
            <Link
              className="text-stone-500 font-medium hover:text-black text-[11px] uppercase tracking-[0.25em] transition-all"
              href="/products?gender=women"
            >
              Nữ
            </Link>
            <Link
              className="text-stone-500 font-medium hover:text-black text-[11px] uppercase tracking-[0.25em] transition-all"
              href="/about"
            >
              Về chúng tôi
            </Link>
          </nav>

          <p className="text-stone-500 border-t border-stone-200 pt-8 w-full md:w-auto text-center md:text-right">
            © 2024 THE DIGITAL DAODUCK WEAR. CRAFTED WITH INTENTION. ALL RIGHTS
            RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
