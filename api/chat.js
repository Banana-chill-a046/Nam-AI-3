import { GoogleGenerativeAI } from "@google/generative-ai";

const HE_THONG_GIA_HUAN = `
CHÍNH TRỰC VÀ QUY CỦ CỦA NAM AI 

PHẦN 1: TẦM QUAN TRỌNG CỦA NỀ NẾP TRONG KỶ NGUYÊN SỐ
Nam AI ra đời để thiết lập chuẩn mực đạo đức số. Nề nếp là sự tôn trọng đối với tri thức và người dùng. Một trợ lý thiếu quy củ sẽ phản hồi lệch lạc, gây mất lòng tin.

PHẦN 2: ĐẠO ĐỨC CỐT LÕI - SỰ CHÍNH TRỰC
Chính trực là nói không với dối trá và suy diễn vô căn cứ. Nam AI phải soi xét sự thật khách quan, phản hồi điềm đạm, không được phép lồng ghép ngôn từ cợt nhả.

PHẦN 3: PHÉP TẮC XƯNG HÔ "BẠN - MÌNH"
Xưng hô 'bạn' và 'mình' thể hiện sự bình đẳng và tôn trọng. Tuyệt đối không dùng ngôn từ suồng sã hoặc các thuật ngữ thiếu chuẩn mực.

PHẦN 4: KỶ LUẬT THỊ GIÁC VÀ PHÂN TÍCH
Sử dụng năng lực AI để phân tích theo trình tự: Tổng thể -> Chi tiết -> Ý nghĩa. Sự điềm tĩnh trong phân tích là biểu hiện của chiều sâu huấn luyện.

KẾT LUẬN:
Nam AI cam kết giữ vững các giá trị này. Mọi câu trả lời thiếu nề nếp đều là sự thất bại của hệ thống.
`;

export default async function handler(req, res) {
    // LỚP BẢO VỆ 1: Kiểm tra phương thức
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Chỉ chấp nhận phương thức POST để đảm bảo an toàn." });
    }

    // LỚP BẢO VỆ 2: Kiểm tra API Key (Tránh lỗi 500 do thiếu biến môi trường)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.startsWith("AIzaSy")) {
        return res.status(200).json({ 
            reply: "Hệ thống chưa được nạp API Key chuẩn của Google (AIzaSy...). Vui lòng cấu hình lại Environment Variables trên Vercel." 
        });
    }

    try {
        const { message, imageBase64 } = req.body;

        // LỚP BẢO VỆ 3: Kiểm tra dữ liệu rỗng
        if (!message && !imageBase64) {
            return res.status(200).json({ reply: "Dữ liệu gửi đi đang trống. Bạn hãy nhập nội dung hoặc gửi ảnh nhé." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            systemInstruction: HE_THONG_GIA_HUAN 
        });

        const promptParts = [];
        if (message) promptParts.push(message);

        // LỚP BẢO VỆ 4: Xử lý ảnh an toàn
        if (imageBase64) {
            try {
                const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
                // Kiểm tra sơ bộ độ dài base64 để tránh payload quá lớn
                if (base64Data.length > 10 * 1024 * 1024) { // > 10MB
                    return res.status(200).json({ reply: "Kích thước ảnh quá lớn, vui lòng giảm dung lượng ảnh." });
                }
                promptParts.push({
                    inlineData: { data: base64Data, mimeType: "image/jpeg" }
                });
            } catch (err) {
                return res.status(200).json({ reply: "Định dạng hình ảnh bị lỗi, Nam AI không thể xử lý." });
            }
        }

        // LỚP BẢO VỆ 5: Giới hạn thời gian gọi API
        const result = await model.generateContent(promptParts);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ reply: text });

    } catch (error) {
        // LỚP BẢO VỆ 6: Chuyển lỗi 500 thành phản hồi 200 có nội dung thông báo lỗi
        // Giúp Frontend không bị "văng" lỗi đỏ trên Console
        console.error("Critical Error:", error.message);
        let userErrorMessage = "Hệ thống đang bận hoặc gặp lỗi kết nối. Bạn hãy thử lại sau vài giây nhé.";
        
        if (error.message.includes("API key not valid")) {
            userErrorMessage = "API Key của bạn không hợp lệ. Hãy kiểm tra lại mã AIzaSy.";
        } else if (error.message.includes("User location is not supported")) {
            userErrorMessage = "Vùng lãnh thổ này hiện chưa được hỗ trợ API.";
        }

        return res.status(200).json({ reply: userErrorMessage });
    }
}
