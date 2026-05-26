const DAODUCKWEARNewsletter = () => {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 text-center bg-white border-t border-stone-100">
      <div className="max-w-2xl mx-auto">
        <h2 className=" text-3xl font-cormorant italic md:text-4xl font-bold tracking-tighter mb-6">
          Trở thành một phần của DAODUCK WEAR
        </h2>
        <p className="font-sans text-stone-500 mb-10 text-sm md:text-base leading-relaxed">
          Đăng ký nhận bản tin để không bỏ lỡ những bộ sưu tập mới nhất, ưu đãi
          đặc quyền và những câu chuyện thời trang truyền cảm hứng.
        </p>
        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            className="flex-1 border-b border-stone-300 py-3 px-2 bg-transparent focus:border-black focus:ring-0 font-sans text-sm transition-colors outline-none"
            placeholder="Địa chỉ Email của bạn"
            required
            type="email"
          />
          <button
            className="bg-black text-white px-8 py-3 text-[11px] font-medium uppercase tracking-widest hover:bg-stone-800 transition-colors"
            type="submit"
          >
            Đăng ký
          </button>
        </form>
      </div>
    </section>
  );
};

export default DAODUCKWEARNewsletter;
