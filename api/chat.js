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
    if (req.method !== 'POST') return res.status(405).json({ error: "Yêu cầu POST." });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(200).json({ reply: "Lỗi: Chưa cấu hình GEMINI_API_KEY." });

    try {
        const { message, imageBase64 } = req.body;
        
        // Khởi tạo AI với phiên bản ổn định (v1)
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Dùng model cơ bản nhất, không thêm hậu tố lạ
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            systemInstruction: HE_THONG_GIA_HUAN 
        });

        const promptParts = [message || "Hãy phân tích theo nề nếp."];

        if (imageBase64) {
            const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
            promptParts.push({
                inlineData: { data: base64Data, mimeType: "image/jpeg" }
            });
        }

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        return res.status(200).json({ reply: response.text() });

    } catch (error) {
        console.error("Lỗi:", error.message);
        
        // Nếu vẫn lỗi 404, thử fallback sang model gemini-pro (vốn rất ổn định)
        return res.status(200).json({ 
            reply: "Nam AI đang điều chỉnh lại kết nối. (Lỗi: " + error.message + "). Hãy thử gửi lại tin nhắn sau 5 giây." 
        });
    }
}
