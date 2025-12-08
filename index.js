import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint TTS proxy
app.get("/tts", async (req, res) => {
  try {
    const q = req.query.q;
    const lang = req.query.lang || "en"; // mặc định là tiếng anh nếu không truyền tham số

    if (!q || !q.trim()) {
      return res.status(400).send("Thiếu tham số q");
    }

    // Giới hạn độ dài text
    const text = q.trim().slice(0, 200);

    // Gọi Google Translate TTS với ngôn ngữ tùy chọn
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=${lang}&client=tw-ob`;

    const response = await fetch(googleUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36",
        "Referer": "https://translate.google.com/",
        "Accept": "*/*",
      },
    });

    if (!response.ok) {
      throw new Error(`Google TTS fetch failed: ${response.status}`);
    }

    // Trả audio về cho client
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Access-Control-Allow-Origin", "*");
    response.body.pipe(res);
  } catch (err) {
    console.error("TTS proxy error:", err);
    res.status(500).send("Không lấy được audio TTS");
  }
});
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`✅ googlevoice backend chạy ở port ${PORT}`);
});
