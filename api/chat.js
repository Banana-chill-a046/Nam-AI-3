export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).json({ reply: "Hệ thống đang chờ lệnh..." });

    const apiKey = process.env.GEMINI_API_KEY;
    
    // ĐÂY LÀ PHẦN QUY CỦ CỦA BẠN - ĐÃ ĐƯỢC KHÔI PHỤC
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

    try {
        const { message, imageBase64 } = req.body;
        
        // Gắn chặt Gia Huấn vào mọi yêu cầu gửi đi
        const payload = {
            contents: [{
                parts: [{ text: `${HE_THONG_GIA_HUAN}\n\nNgười dùng yêu cầu: ${message || "Kiểm tra hệ thống"}` }]
            }],
            generationConfig: {
                temperature: 0.4, // Giảm độ ngẫu nhiên để AI trả lời điềm đạm hơn
                topP: 0.8,
                topK: 40
            }
        };

        if (imageBase64) {
            const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
            payload.contents[0].parts.push({
                inline_data: { mime_type: "image/jpeg", data: base64Data }
            });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ reply: `Nam AI tạm nghỉ vì: ${data.error.message}` });
        }

        const replyText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: replyText });

    } catch (error) {
        return res.status(200).json({ reply: " Đang tái thiết lập: " + error.message });
    }
}
