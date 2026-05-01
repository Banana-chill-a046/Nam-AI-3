export default async function handler(req, res) {
    // Đảm bảo chỉ nhận yêu cầu POST theo đúng quy trình
    if (req.method !== 'POST') return res.status(200).json({ reply: "Đang chờ lệnh từ bạn..." });

    // Lấy API Key từ biến môi trường Vercel
    const apiKey = process.env.GROK_API_KEY; 

    // HỆ THỐNG GIA HUẤN CỦA NAM AI - ĐÃ ĐƯỢC CẬP NHẬT ĐẦY ĐỦ
    const HE_THONG_GIA_HUAN = `
    Bạn là NAM AI. Bạn phải tuân thủ các quy tắc và luật lệ sau của Nam PC:

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
        const { message } = req.body;

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "grok-beta", 
                messages: [
                    { role: "system", content: HE_THONG_GIA_HUAN },
                    { role: "user", content: message }
                ],
                temperature: 0.5 // Thiết lập độ ổn định thấp để AI giữ đúng tác phong điềm đạm
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ reply: `Nam AI báo lỗi hệ thống: ${data.error.message}` });
        }

        // Trả về phản hồi nề nếp từ AI
        const replyText = data.choices[0].message.content;
        return res.status(200).json({ reply: replyText });

    } catch (error) {
        // Phản hồi khi có lỗi ngoại vi, đảm bảo không làm gián đoạn trải nghiệm người dùng
        return res.status(200).json({ reply: "Nam AI đang được tái thiết lập: " + error.message });
    }
}
