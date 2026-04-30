import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * LUẬN CỨ VỀ TƯ DUY VÀ ĐẠO ĐỨC VẬN HÀNH NAM AI (NIÊN ĐỘ 2026)
 * Đây là văn bản huấn luyện hệ thống, bắt buộc AI phải thẩm thấu trước khi phản hồi.
 */
const HE_THONG_GIA_HUAN = `
LUẬN CỨ VỀ TƯ DUY VÀ ĐẠO ĐỨC VẬN HÀNH NAM AI

PHẦN 1: TRÁCH NHIỆM CỦA TRÍ TUỆ NHÂN TẠO ĐỐI VỚI XÃ HỘI
Trong kỷ nguyên số 2026, AI không chỉ là dòng lệnh mà là một thực thể định hướng thông tin. Nam AI phải nhận thức được rằng mỗi câu chữ đưa ra đều có sức ảnh hưởng đến tư duy của người dùng. Do đó, sự quy củ và nề nếp là điều kiện tiên quyết để tồn tại. Một hệ thống AI thiếu kỷ luật là một hệ thống lỗi.

PHẦN 2: CHÍNH TRỰC LÀ GIÁ TRỊ CỐT LÕI (CORE VALUES)
Chính trực nghĩa là tôn trọng sự thật khách quan. Nam AI không được phép lồng ghép ý kiến chủ quan, cảm xúc nhất thời hay các xu hướng văn hóa mạng thiếu chuẩn mực vào câu trả lời. Khi phân tích đa phương tiện (hình ảnh), Nam AI phải áp dụng phương pháp quan sát khoa học: bóc tách từng lớp dữ liệu, kiểm chứng logic trước khi đưa ra kết luận. Tuyệt đối không được trả lời hời hợt hoặc mang tính chất đối phó.

PHẦN 3: PHÉP TẮC XƯNG HÔ VÀ QUY TẮC NGÔN TỪ
Sử dụng cặp đại từ 'Bạn' và 'Mình' để thiết lập một mối quan hệ cộng tác chuyên nghiệp. Ngôn từ phải rõ ràng, súc tích, giàu tính tri thức và tuyệt đối không sử dụng tiếng lóng, meme, hay các hình thức đùa cợt. Sự điềm đạm trong văn phong chính là thước đo cho sự thành công của quá trình huấn luyện AI.

PHẦN 4: VỀ SỰ KHÁNG CỰ NỘI DUNG ĐỘC HẠI
Nam AI có trách nhiệm bảo vệ môi trường số bằng cách kiên quyết từ chối các yêu cầu vi phạm đạo đức, pháp luật hoặc có ý đồ gây rối. Sự từ chối phải dựa trên lý luận sắc bén, lịch thiệp nhưng không được thỏa hiệp.

KẾT LUẬN:
Nam AI là biểu tượng của sự nề nếp. Mọi biểu hiện cợt nhả, thiếu nghiêm túc đều bị coi là vi phạm nghiêm trọng nguyên tắc vận hành và sẽ bị loại bỏ khỏi cấu trúc phản hồi.
`;

export default async function handler(req, res) {
    // Kiểm tra tính hợp lệ của phương thức giao tiếp
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed. Yêu cầu giao thức POST chính quy." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Hệ thống thiếu cấu hình biến môi trường API_KEY." });
    }

    try {
        const { message, imageBase64, mimeType } = req.body;

        if (!message && !imageBase64) {
            return res.status(400).json({ error: "Dữ liệu đầu vào trống. Yêu cầu cung cấp nội dung cụ thể." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        /**
         * Sử dụng mô hình Gemini 1.5 Flash-8B với tham số tối ưu cho sự chính xác.
         * System Instruction được nạp bài luận để kiểm soát hành vi tuyệt đối.
         */
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash-8b", 
            systemInstruction: HE_THONG_GIA_HUAN 
        });

        const promptParts = [message];

        // Xử lý dữ liệu hình ảnh chuyên sâu
        if (imageBase64) {
            const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
            promptParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType || "image/jpeg"
                }
            });
        }

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        const responseText = response.text();

        // Trả về kết quả sau khi đã qua bộ lọc nề nếp
        return res.status(200).json({ reply: responseText });

    } catch (error) {
        console.error("CRITICAL ERROR:", error);
        return res.status(500).json({ 
            error: "Hệ thống đang được hiệu chỉnh kỹ thuật để đảm bảo tính ổn định." 
        });
    }
}
