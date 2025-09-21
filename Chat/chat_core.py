from typing import List, Dict
import json
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import os

BASE_DIR = os.path.dirname(__file__)  # Chat folder

with open(os.path.join(BASE_DIR, "config", "system_prompt.txt"), "r", encoding="utf-8") as f:
    SYSTEM_PROMPT = f.read()

with open(os.path.join(BASE_DIR, "config", "intake_schema.json"), "r", encoding="utf-8") as f:
    INTAKE_SCHEMA = json.load(f)



# ---- Model Loader ----
def load_model(model_name="microsoft/phi-3-mini-4k-instruct"):
    tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        device_map="auto",
        torch_dtype=torch.float16
    )
    model.eval()
    return tokenizer, model

# ---- Prompt Builder ----
def build_prompt(history: List[Dict], user_profile: Dict, user_msg: str) -> str:
    profile_str = json.dumps(user_profile or {}, ensure_ascii=False)
    convo = [
        f"<SYSTEM>{SYSTEM_PROMPT}</SYSTEM>",
        f"<PROFILE>{profile_str}</PROFILE>"
    ]
    for turn in history[-6:]:
        convo.append(f"User: {turn['user']}\nFRIDAY: {turn['bot']}")
    convo.append(f"User: {user_msg}\nFRIDAY:")
    return "\n".join(convo)

# ---- Reply Generator ----
def generate_reply(model, tokenizer, prompt: str, max_new_tokens=400):
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    output = model.generate(
        **inputs,
        max_new_tokens=max_new_tokens,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )
    text = tokenizer.decode(output[0], skip_special_tokens=True)
    return text.split("FRIDAY:")[-1].strip()

# ---- Example Usage ----
if __name__ == "__main__":
    tokenizer, model = load_model()
    history = []
    user_profile = {"age": 21, "monthly_income": 60000, "risk_tolerance": "moderate"}
    user_msg = "I want to save ₹50,000 in 6 months. How should I start?"

    prompt = build_prompt(history, user_profile, user_msg)
    reply = generate_reply(model, tokenizer, prompt)
    print("FRIDAY:", reply)
