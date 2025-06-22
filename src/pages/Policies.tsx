import Footer from "@/components/Footer";
import Header from "@/components/Header";

const Policies = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <section className="grow w-sm flex flex-col items-center">
        <h1 className="w-full my-5 text-4xl text-white text-center font-bold py-10 bg-[url(/assets/images/green-background.jpg)] bg-center">CHÍNH SÁCH HOẠT ĐỘNG CỦA CHỢ CỨU NÔNG</h1>

        {/* Classes wont work here for reasons unkown to me */}
        <div style={{ width: "1000px", maxWidth: "100vw" }}>
          <section className="text-lg text-gray-700 text-justify">
            <h2 className="text-3xl text-green-700 font-semibold pb-2">I. MỤC ĐÍCH</h2>
            <p className="pb-4">
              Chính sách này quy định quyền và nghĩa vụ của người bán và người mua khi tham gia vào sàn TMDT Chợ Cứu Nông, nhằm đảm bảo hoạt động giao dịch minh bạch, an toàn và hiệu quả, góp phần hỗ trợ tiêu thụ nông sản cho nông dân, hợp tác xã và các đơn vị sản xuất địa phương.
            </p>
          </section>

          <section className="text-lg text-gray-700 text-justify">
            <h2 className="text-3xl text-green-700 font-semibold pb-2">II. PHẠM VI ÁP DỤNG</h2>
            <p className="pb-4">
              Áp dụng cho tất cả người bán (nông dân, hợp tác xã, doanh nghiệp) và người mua (cá nhân, tổ chức) tham gia mua bán hàng hóa trên sàn Chợ Cứu Nông.
            </p>
            <p className="pb-4">Áp dụng cho mọi hoạt động: đăng bán, đặt hàng, thanh toán, vận chuyển, đánh giá.</p>
          </section>

          <section className="text-lg text-gray-700 text-justify">
            <h2 className="text-3xl text-green-700 font-semibold pb-2">III. CHÍNH SÁCH DÀNH CHO NGƯỜI BÁN</h2>
            <h3 className="text-2xl font-semibold">1. Điều kiện trở thành người bán</h3>
            <ul className="list-disc pl-5 py-2">
              <li>Có giấy tờ xác minh cá nhân hoặc pháp nhân hợp lệ (CMND/CCCD hoặc Giấy ĐKKD, Hợp tác xã…).</li>
              <li>Cung cấp đầy đủ giấy tờ chứng minh nguồn gốc, chất lượng sản phẩm (nếu có): VietGAP, HACCP, VSATTP, hoặc xác nhận của địa phương.</li>
              <li>Cam kết sản phẩm sạch, đúng mô tả, đúng nguồn gốc.</li>
            </ul>

            <h3 className="text-2xl font-semibold">2. Quyền lợi người bán</h3>
            <ul className="list-disc pl-5 py-2">
              <li>Được miễn phí đăng ký gian hàng, đăng sản phẩm.</li>
              <li>Được hỗ trợ truyền thông, quảng bá (trong các chiến dịch cứu nông sản).</li>
              <li>Được sử dụng hệ thống quản lý đơn hàng, kho hàng và thống kê miễn phí.</li>
              <li>Hỗ trợ logistics giá ưu đãi (đối tác vận chuyển của sàn).</li>
            </ul>

            <h3 className="text-2xl font-semibold">3. Nghĩa vụ người bán</h3>
            <ul className="list-disc pl-5 py-2">
              <li>Cập nhật đầy đủ, chính xác thông tin sản phẩm (giá, trọng lượng, mô tả…).</li>
              <li>Đảm bảo chất lượng, thời hạn sử dụng, và đúng số lượng khi giao hàng.</li>
              <li>Xử lý đơn hàng đúng thời hạn.</li>
              <li>Cam kết không bán hàng giả, hàng kém chất lượng, hàng không rõ nguồn gốc.</li>
              <li>Tuân thủ chính sách đổi trả, bảo hành, hoàn tiền.</li>
            </ul>
          </section>

          <section className="text-lg text-gray-700 text-justify">
            <h2 className="text-3xl text-green-700 font-semibold pb-2">IV. CHÍNH SÁCH DÀNH CHO NGƯỜI MUA</h2>
            <h3 className="text-2xl font-semibold">1. Quyền lợi người mua</h3>
            <ul className="list-disc pl-5 py-2">
              <li>Được truy cập, tìm kiếm và mua sản phẩm dễ dàng.</li>
              <li>Được hỗ trợ đổi trả/hoàn tiền nếu sản phẩm không đúng mô tả, hư hỏng, hoặc giao thiếu.</li>
              <li>Được hỗ trợ phản ánh, khiếu nại và bảo vệ quyền lợi bởi Ban quản trị sàn.</li>
              <li>Nhận thông báo khuyến mãi, mã giảm giá từ chương trình hỗ trợ nông sản.</li>
            </ul>

            <h3 className="text-2xl font-semibold">2. Nghĩa vụ người mua</h3>
            <ul className="list-disc pl-5 py-2">
              <li>Cung cấp thông tin cá nhân chính xác khi đặt hàng.</li>
              <li>Thanh toán đầy đủ, đúng hạn.</li>
              <li>Không hủy đơn hàng không lý do sau khi đã xác nhận.</li>
              <li>Kiểm tra hàng hóa ngay khi nhận và phản hồi trong vòng 24h nếu có sự cố.</li>
            </ul>
          </section>

          <section className="text-lg text-gray-700 text-justify">
            <h2 className="text-3xl text-green-700 font-semibold pb-2">V. CHÍNH SÁCH GIAO HÀNG, ĐỔI TRẢ, HOÀN TIỀN</h2>
            <h3 className="text-2xl font-semibold">1. Giao hàng</h3>
            <ul className="list-disc pl-5 py-2">
              <li>Giao hàng tận nơi toàn quốc (qua đối tác vận chuyển uy tín).</li>
              <li>Thời gian giao hàng từ 1–5 ngày tùy khu vực và sản phẩm.</li>
              <li>Người mua có quyền kiểm tra hàng trước khi thanh toán (COD).</li>
            </ul>

            <h3 className="text-2xl font-semibold">2. Đổi trả và hoàn tiền</h3>
            <ul className="list-disc pl-5 py-2">
              <li>Điều kiện chấp nhận: Sản phẩm bị dập, thối, hư hỏng, sai loại, giao thiếu, hết hạn.</li>
              <li>Thời gian thông báo: Trong vòng 24h kể từ khi nhận hàng.</li>
              <li>Cách thức hoàn tiền: Qua tài khoản ngân hàng hoặc ví điện tử trong vòng 3–5 ngày.</li>
            </ul>
          </section>

          <section className="text-lg text-gray-700 text-justify">
            <h2 className="text-3xl text-green-700 font-semibold pb-2">VI. CHÍNH SÁCH XỬ LÝ VI PHẠM</h2>
            <p>Người bán/người mua sẽ bị xử lý (cảnh báo, tạm khóa tài khoản, chấm dứt hoạt động) nếu vi phạm các quy định sau:</p>
            <ul className="list-disc pl-5 py-2">
              <li>Gian lận thương mại, thông tin sai lệch.</li>
              <li>Giao hàng không đúng cam kết, lừa đảo, giả mạo giấy tờ.</li>
              <li>Có hành vi xúc phạm, quấy rối, gây rối hệ thống.</li>
            </ul>
          </section>

          <section className="text-lg text-gray-700 text-justify">
            <h2 className="text-3xl text-green-700 font-semibold pb-2">VII. BẢO VỆ DỮ LIỆU VÀ THÔNG TIN NGƯỜI DÙNG</h2>
            <ul className="list-disc pl-5 py-2">
              <li>Sàn cam kết bảo mật thông tin cá nhân người bán và người mua.</li>
              <li>Không tiết lộ thông tin cho bên thứ ba nếu không có sự đồng ý, trừ trường hợp pháp luật yêu cầu.</li>
            </ul>
          </section>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Policies;
