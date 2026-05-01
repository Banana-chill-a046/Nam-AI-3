import { GoogleGenerativeAI } from "@google/generative-ai";

// GIỮ NGUYÊN HỆ THỐNG GIA HUAN CỦA BẠN
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
    if (!apiKey || !apiKey.startsWith("AIzaSy")) {
        return res.status(200).json({ reply: "Lỗi: API Key không hợp lệ hoặc chưa cấu hình đúng mã AIzaSy." });
    }

    try {
        const { message, imageBase64 } = req.body;
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Sửa định danh model thành "gemini-1.5-flash-latest" để tránh lỗi 404
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash-latest", 
            systemInstruction: HE_THONG_GIA_HUAN 
        });

        const promptParts = [];
        if (message) promptParts.push(message);

        if (imageBase64) {
            try {
                const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
                promptParts.push({
                    inlineData: { data: base64Data, mimeType: "image/jpeg" }
                });
            } catch (e) {
                return res.status(200).json({ reply: "Dữ liệu hình ảnh không đúng định dạng." });
            }
        }

        const result = await model.generateContent(promptParts);
        const responseText = result.response.text();

        return res.status(200).json({ reply: responseText });
    } catch (error) {
        console.error("Lỗi thực thi:", error.message);
        // Trả về thông báo lỗi thân thiện thay vì lỗi 500
        return res.status(200).json({ 
            reply: "Nam AI đang gặp gián đoạn kết nối. Vui lòng kiểm tra lại cấu hình hoặc thử lại sau. (Chi tiết: " + error.message + ")" 
        });
    }
}
