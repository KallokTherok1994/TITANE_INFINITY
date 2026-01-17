import openai

client = openai.OpenAI(base_url="http://localhost:8000/v1", api_key="dummy")

response = client.chat.completions.create(
    model="THUDM/glm-4v-9b",
    messages=[{"role": "user", "content": "Salut, comment ça va ?"}]
)

print(response.choices[0].message.content)
