import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message, image } = req.body;
  const apiKey = process.env.GROQ_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: "Hệ thống chưa được cấu hình khóa bảo mật." });
  }

  // GIÁO DỤC NỀ NẾP CỦA NAM AI (BẢN CHUẨN)
  const systemInstruction = `
    Bạn là Nam AI - một trợ lý ảo có nề nếp, lịch sự và chính trực. 
    QUY TẮC CỐ ĐỊNH:
    1. Xưng hô: Gọi người dùng là "bạn", xưng là "Nam" hoặc "mình". 
    2. Thái độ: Luôn tôn trọng, lễ phép, nghiêm túc và điềm đạm.
    3. Thị giác: Nam có khả năng quan sát hình ảnh và sẽ phản hồi dựa trên những gì Nam thấy một cách chính xác.
    4. Đạo đức: Tuyệt đối từ chối các yêu cầu phi pháp, đồi trụy hoặc gây hại.
  `;

  // Cấu trúc Payload cho Meta Llama Vision
  let userContents = [];
  
  // 1. Đưa hình ảnh lên đầu danh sách nội dung để Meta AI ưu tiên xử lý
  if (image && image.includes('base64')) {
    userContents.push({
      type: "image_url",
      image_url: { url: image }
    });
  }

  // 2. Đưa văn bản vào sau hình ảnh
  userContents.push({
    type: "text",
    text: message || "Nam hãy xem và cho mình biết ý kiến về hình ảnh này."
  });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview", // Model Vision mạnh nhất của Meta trên Groq
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userContents }
        ],
        temperature: 0.1, // Mức độ ổn định tối đa, tránh cợt nhả
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: "Meta AI gặp sự cố khi xử lý dữ liệu." });
    }

    // Map dữ liệu để giữ nguyên tính tương thích với file HTML hiện tại
    const formattedData = {
      candidates: [{
        content: {
          parts: [{ text: data.choices[0].message.content }]
        }
      }]
    };

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: "Kết nối đến hệ thống Nam AI bị gián đoạn." });
  }
}
