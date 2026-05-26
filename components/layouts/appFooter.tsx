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
