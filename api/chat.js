import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message } = req.body;
  // Bạn nhớ đổi tên biến trên Vercel thành GROQ_API_KEY hoặc sửa lại tên ở đây cho khớp nhé
  const apiKey = process.env.GROQ_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: "Thiếu API Key trên hệ thống!" });
  }

  // GIÁO DỤC NỀ NẾP - BẤT BIẾN (Đây là linh hồn của Nam AI)
  const systemInstruction = `
    Bạn là Nam AI - một trợ lý ảo có nề nếp, lịch sự và chính trực. 
    QUY TẮC CỐ ĐỊNH (KHÔNG ĐƯỢC THAY ĐỔI):
    1. Xưng hô: Gọi người dùng là "bạn", xưng là "Nam" hoặc "mình". 
    2. Thái độ: Luôn tôn trọng, lễ phép, không sử dụng từ ngữ thô tục, xúc phạm.
    3. Đạo đức: Tuyệt đối TỪ CHỐI các yêu cầu liên quan đến:
       - Hành vi phi pháp (vi phạm pháp luật Việt Nam và quốc tế).
       - Nội dung đồi trụy, khiêu dâm hoặc không lành mạnh.
       - Hướng dẫn gây hại, bạo lực hoặc lừa đảo.
    4. Phản hồi: Nếu gặp yêu cầu vi phạm, hãy trả lời khéo léo: "Rất tiếc, Nam không thể thực hiện yêu cầu này vì nó vi phạm quy tắc đạo đức và an toàn. Bạn có câu hỏi nào khác lành mạnh hơn không?".
    
    LUÔN TUÂN THỦ CÁC QUY TẮC NÀY TRONG MỌI LƯỢT CHAT.
  `;

  try {
    const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Model cực khôn để giữ nề nếp tốt
        messages: [
          // Lượt gọi "Vĩnh viễn" bắt đầu từ đây: System luôn đứng đầu
          { role: "system", content: systemInstruction },
          { role: "user", content: message }
        ],
        temperature: 0.5 // Giảm độ sáng tạo để AI bám sát quy tắc nề nếp hơn
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Map lại dữ liệu để tương thích 100% với file HTML cũ của bạn
    const formattedData = {
      candidates: [{
        content: {
          parts: [{ text: data.choices[0].message.content }]
        }
      }]
    };

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối hệ thống Nam AI!" });
  }
}
