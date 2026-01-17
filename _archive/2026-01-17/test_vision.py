import openai
import base64

# Encode image en base64
with open("photo.jpg", "rb") as f:
    img_data = base64.b64encode(f.read()).decode()

client = openai.OpenAI(base_url="http://localhost:8000/v1", api_key="dummy")

response = client.chat.completions.create(
    model="THUDM/glm-4v-9b",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Décris cette image."},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_data}"}}
        ]
    }]
)

print(response.choices[0].message.content)
