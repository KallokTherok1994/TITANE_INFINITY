from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

base_model = AutoModelForCausalLM.from_pretrained("THUDM/glm-4v-9b", trust_remote_code=True)
model = PeftModel.from_pretrained(base_model, "./lora-model-v1")
tokenizer = AutoTokenizer.from_pretrained("THUDM/glm-4v-9b", trust_remote_code=True)

inputs = tokenizer("Salut", return_tensors="pt")
outputs = model.generate(**inputs, max_length=50)
print(tokenizer.decode(outputs[0]))
