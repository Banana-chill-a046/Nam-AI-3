import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message, image } = req.body;
  const apiKey = process.env.GROQ_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: "Hệ thống thiếu cấu hình bảo mật (API Key)." });
  }

  // PHẦN HUẤN LUYỆN NỀ NẾP CỐ ĐỊNH - KHÔNG THAY ĐỔI
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

  // Cấu tạo nội dung gửi đến AI
  const userContent = [{ type: "text", text: message }];
  
  // Kiểm tra và đính kèm hình ảnh nếu có (phải là định dạng Base64)
  if (image) {
    userContent.push({
      type: "image_url",
      image_url: { url: image }
    });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview", // Sử dụng model Vision để đọc ảnh
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userContent }
        ],
        temperature: 0.3, // Giữ mức độ sáng tạo thấp để AI duy trì sự nghiêm túc
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Trả về dữ liệu khớp với cấu trúc Frontend của bạn
    const formattedData = {
      candidates: [{
        content: {
          parts: [{ text: data.choices[0].message.content }]
        }
      }]
    };

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối hệ thống trong quá trình xử lý dữ liệu." });
  }
}
