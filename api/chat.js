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
    if (req.method !== 'POST') return res.status(405).json({ error: "Method Not Allowed" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(200).json({ reply: "Lỗi: Hệ thống chưa có API Key." });

    try {
        const { message, imageBase64 } = req.body;
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // SỬ DỤNG MODEL 1.0 PRO - ĐÂY LÀ BẢN ỔN ĐỊNH NHẤT KHÔNG BỊ LỖI 404
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Đưa phần huấn luyện trực tiếp vào Prompt để AI luôn ghi nhớ quy củ
        const promptToAi = `${HE_THONG_GIA_HUAN}\n\nNgười dùng nói: ${message || "Chào bạn"}\nNam AI hãy phản hồi theo đúng nề nếp:`;

        const result = await model.generateContent(promptToAi);
        const response = await result.response;
        return res.status(200).json({ reply: response.text() });

    } catch (error) {
        console.error("Critical Error:", error.message);
        
        // Nếu vẫn lỗi, đây là lớp phòng thủ cuối cùng để bạn biết nguyên nhân
        return res.status(200).json({ 
            reply: "Hệ thống đang được hiệu chỉnh nề nếp. Vui lòng thử lại sau giây lát. (Mã lỗi: " + error.message + ")" 
        });
    }
}
