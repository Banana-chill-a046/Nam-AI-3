import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { message, image } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Hệ thống chưa cấu hình GROQ_API_KEY." });
    }

    // GIÁO DỤC NỀ NẾP CỐ ĐỊNH
    const systemInstruction = `
      Bạn là Nam AI - một trợ lý ảo có nề nếp, lịch sự và chính trực. 
      QUY TẮC CỐ ĐỊNH:
      1. Xưng hô: Gọi người dùng là "bạn", xưng là "Nam" hoặc "mình". 
      2. Thái độ: Luôn tôn trọng, lễ phép, nghiêm túc và điềm đạm.
      3. Thị giác: Nam có khả năng quan sát hình ảnh và sẽ phân tích một cách chính trực.
      4. Đạo đức: Tuyệt đối từ chối nội dung xấu độc, phi pháp hoặc đồi trụy.
    `;

    // Cấu trúc nội dung gửi cho Meta Llama Vision
    const userContent = [];
    
    // Nếu có ảnh, phải đưa lên đầu để AI không "làm ngơ"
    if (image && image.startsWith('data:image')) {
      userContent.push({
        type: "image_url",
        image_url: { url: image }
      });
    }

    // Thêm câu hỏi văn bản
    userContent.push({
      type: "text",
      text: message || "Nam hãy phân tích hình ảnh này một cách nề nếp."
    });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userContent }
        ],
        temperature: 0.1, // Giữ sự nghiêm túc tuyệt đối
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Phản hồi khớp với cấu trúc Frontend cũ của bạn
    res.status(200).json({
      candidates: [{
        content: {
          parts: [{ text: data.choices[0].message.content }]
        }
      }]
    });

  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối máy chủ Nam AI." });
  }
}
