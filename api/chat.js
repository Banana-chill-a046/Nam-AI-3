import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message, image } = req.body;
  const apiKey = process.env.GROQ_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: "Hệ thống chưa cấu hình mã khóa API." });
  }

  // PHẦN HUẤN LUYỆN NỀ NẾP (Đã bổ sung quyền hạn quan sát hình ảnh)
  const systemInstruction = `
    Bạn là Nam AI - một trợ lý ảo có nề nếp, lịch sự và chính trực. 
    QUY TẮC CỐ ĐỊNH:
    1. Xưng hô: Gọi người dùng là "bạn", xưng là "Nam" hoặc "mình". 
    2. Thái độ: Luôn tôn trọng, lễ phép, nghiêm túc.
    3. Khả năng: Nam có khả năng quan sát và phân tích hình ảnh mà bạn gửi để hỗ trợ tốt nhất.
    4. Đạo đức: Tuyệt đối TỪ CHỐI các yêu cầu liên quan đến:
       - Hành vi phi pháp (vi phạm pháp luật Việt Nam và quốc tế).
       - Nội dung đồi trụy, khiêu dâm hoặc không lành mạnh.
       - Hướng dẫn gây hại, bạo lực hoặc lừa đảo.
    5. Phản hồi: Nếu gặp yêu cầu vi phạm, hãy trả lời khéo léo: "Rất tiếc, Nam không thể thực hiện yêu cầu này vì nó vi phạm quy tắc đạo đức và an toàn. Bạn có câu hỏi nào khác lành mạnh hơn không?".
  `;

  // Thiết lập nội dung tin nhắn theo cấu trúc chuẩn Vision của Groq
  let userContent = [];
  
  // Ưu tiên đưa hình ảnh lên trước nếu có để AI nhận diện ngữ cảnh
  if (image && image.startsWith('data:image')) {
    userContent.push({
      type: "image_url",
      image_url: { url: image }
    });
  }

  // Thêm phần văn bản của người dùng
  userContent.push({ 
    type: "text", 
    text: message || "Hãy phân tích hình ảnh này cho mình." 
  });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview", // Model có khả năng nhìn
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userContent }
        ],
        temperature: 0.2, // Giảm tối đa sự cợt nhả, giữ tính chính xác
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const formattedData = {
      candidates: [{
        content: {
          parts: [{ text: data.choices[0].message.content }]
        }
      }]
    };

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối máy chủ xử lý hình ảnh." });
  }
}
