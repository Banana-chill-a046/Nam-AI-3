export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message, image } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "Thiếu GROQ_API_KEY" });

  const systemInstruction = "Bạn là Nam AI - một trợ lý ảo nề nếp, lịch sự. Xưng 'Nam' hoặc 'mình', gọi người dùng là 'bạn'. Luôn nghiêm túc và chính trực.";

  // Cấu trúc chuẩn cho Meta Llama 3.2 Vision
  const contents = [];
  if (image) {
    contents.push({ type: "image_url", image_url: { url: image } });
  }
  contents.push({ type: "text", text: message || "Phân tích ảnh này." });

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
          { role: "user", content: contents }
        ],
        temperature: 0.1
      })
    });

    const data = await response.json();
    
    if (data.error) return res.status(500).json({ error: data.error.message });

    // Trả về định dạng mà file HTML của bạn đang chờ đợi
    res.status(200).json({
      candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }]
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối máy chủ." });
  }
}
