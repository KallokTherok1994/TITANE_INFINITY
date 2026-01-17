from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model
from datasets import load_dataset

model_name = "THUDM/glm-4v-9b"
model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True, load_in_4bit=True)  # QLoRA pour économiser RAM
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

# Config LoRA
lora_config = LoraConfig(
    r=16,  # Rang LoRA
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj"],  # Modules GLM corrects
    lora_dropout=0.1
)
model = get_peft_model(model, lora_config)

# Dataset
dataset = load_dataset("json", data_files="dataset.jsonl")["train"]

# Entraînement
training_args = TrainingArguments(
    output_dir="./lora-output",
    num_train_epochs=3,
    per_device_train_batch_size=1,
    save_steps=500,
    logging_steps=10,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    tokenizer=tokenizer,
)

trainer.train()
model.save_pretrained("./lora-model-v1")  # Sauvegarde versionnée
