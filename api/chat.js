import { GoogleGenerativeAI } from "@google/generative-ai";

const HE_THONG_GIA_HUAN = `
Bạn là NAM AI , bạn hãy đọc các phần sau và tuân thủ các quy tắc và luật lệ của Nam PC:
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
    if (req.method !== 'POST') return res.status(405).json({ error: "Yêu cầu POST." });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(200).json({ reply: "Lỗi: Chưa tìm thấy GEMINI_API_KEY trong cấu hình Vercel." });

    try {
        const { message, imageBase64 } = req.body;
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Sử dụng tên model chuẩn xác nhất để tránh lỗi 404
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            systemInstruction: HE_THONG_GIA_HUAN 
        });

        const promptParts = [];
        if (message) promptParts.push(message);

        if (imageBase64) {
            const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
            promptParts.push({
                inlineData: { data: base64Data, mimeType: "image/jpeg" }
            });
        }

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ reply: text });
    } catch (error) {
        console.error("Lỗi chi tiết:", error);
        
        // Xử lý các mã lỗi phổ biến từ Google
        let message = "Nam AI đang gặp gián đoạn kết nối. Bạn hãy thử lại sau nhé.";
        if (error.message.includes("404")) {
            message = "Lỗi 404: Model hiện chưa khả dụng tại khu vực này hoặc sai định danh.";
        } else if (error.message.includes("403")) {
            message = "Lỗi 403: API Key không có quyền truy cập hoặc hết hạn.";
        }
        
        return res.status(200).json({ reply: message + " (Chi tiết: " + error.message + ")" });
    }
}
