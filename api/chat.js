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
    if (!apiKey) return res.status(200).json({ reply: "Lỗi: API Key chưa được cấu hình." });

    try {
        const { message, imageBase64 } = req.body;
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // SỬ DỤNG GEMINI-PRO ĐỂ TRÁNH LỖI 404 ĐỊNH DANH
        // Model này ổn định nhất trên toàn cầu
        const modelName = imageBase64 ? "gemini-pro-vision" : "gemini-pro";
        const model = genAI.getGenerativeModel({ 
            model: modelName, 
            systemInstruction: HE_THONG_GIA_HUAN 
        });

        const promptParts = [message || "Chào bạn."];

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
        let msg = "Kết nối không thành công.";
        if (error.message.includes("403")) msg = "Lỗi 403: Vercel hoặc Google chặn truy cập. Hãy kiểm tra lại quyền của API Key.";
        if (error.message.includes("404")) msg = "Lỗi 404: Model này không tồn tại hoặc không hỗ trợ khu vực của bạn.";
        
        return res.status(200).json({ reply: msg + " (Chi tiết: " + error.message + ")" });
    }
}
