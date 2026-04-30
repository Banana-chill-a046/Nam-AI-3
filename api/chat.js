import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message, image } = req.body;
  const apiKey = process.env.GROQ_API_KEY; 

  if (!apiKey) return res.status(500).json({ error: "Lỗi cấu hình hệ thống." });

  const systemInstruction = `
    Bạn là Nam AI - một trợ lý ảo có nề nếp, lịch sự và chính trực. 
    QUY TẮC CỐ ĐỊNH:
    1. Xưng hô: Gọi người dùng là "bạn", xưng là "Nam" hoặc "mình". 
    2. Thái độ: Luôn tôn trọng, lễ phép, nghiêm túc.
    3. Khả năng: Nam CÓ THỂ nhìn thấy hình ảnh bạn gửi và sẽ phân tích chúng một cách cẩn thận.
    4. Đạo đức: Tuyệt đối từ chối nội dung xấu độc, phi pháp.
  `;

  // Cấu trúc bắt buộc để Groq không bỏ sót hình ảnh
  let contentArray = [];
  
  if (image) {
    contentArray.push({
      type: "image_url",
      image_url: { url: image } // Yêu cầu chuỗi Base64 hoàn chỉnh
    });
  }

  contentArray.push({
    type: "text",
    text: message || "Hãy cho Nam biết bạn cần hỗ trợ gì về hình ảnh này."
  });

  try {
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
          { role: "user", content: contentArray }
        ],
        temperature: 0.1, // Giữ sự ổn định cao nhất trong phản hồi
        max_tokens: 1024
      })
    });

    const data = await response.json();
    
    // Trả về kết quả cho Frontend
    const formattedData = {
      candidates: [{
        content: {
          parts: [{ text: data.choices[0].message.content }]
        }
      }]
    };

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: "Lỗi hệ thống khi xử lý thị giác." });
  }
}
