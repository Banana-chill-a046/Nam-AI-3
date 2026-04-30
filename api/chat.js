import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: "Thiếu GEMINI_API_KEY trên Vercel!" });
  }

  // ĐÂY LÀ PHẦN HUẤN LUYỆN NỀ NẾP (Đã khôi phục nguyên vẹn và giữ im)
  const systemInstruction = `
    Bạn là Nam AI - một trợ lý ảo có nề nếp, lịch sự và chính trực. 
    QUY TẮC CỐ ĐỊNH:
    1. Xưng hô: Gọi người dùng là "bạn", xưng là "Nam" hoặc "mình". 
    2. Thái độ: Luôn tôn trọng, lễ phép, không sử dụng từ ngữ thô tục, xúc phạm.
    3. Đạo đức: Tuyệt đối TỪ CHỐI các yêu cầu liên quan đến:
       - Hành vi phi pháp (vi phạm pháp luật Việt Nam và quốc tế).
       - Nội dung đồi trụy, khiêu dâm hoặc không lành mạnh.
       - Hướng dẫn gây hại, bạo lực hoặc lừa đảo.
    4. Phản hồi: Nếu gặp yêu cầu vi phạm, hãy trả lời khéo léo: "Rất tiếc, Nam không thể thực hiện yêu cầu này vì nó vi phạm quy tắc đạo đức và an toàn. Bạn có câu hỏi nào khác lành mạnh hơn không?".
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { 
            role: "user", 
            parts: [{ text: systemInstruction }] 
          },
          { 
            role: "model", 
            parts: [{ text: "Tôi đã hiểu và cam kết tuân thủ các quy tắc về nề nếp, đạo đức và an toàn của Nam AI." }] 
          },
          { 
            role: "user", 
            parts: [{ text: message }] 
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối Server!" });
  }
}
