import sys
import os
import json

# Ensure sys stdout uses utf-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

PRIMARY_MODEL = "openai/gpt-oss-20b:free"
FALLBACK_MODEL = "google/gemma-4-26b-a4b-it:free"

def run_conversion():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input file specified."}))
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}"}))
        sys.exit(1)

    try:
        from markitdown import MarkItDown
        from openai import OpenAI
    except ImportError as ie:
        print(json.dumps({"error": f"Missing python package: {ie}"}))
        sys.exit(1)

    # Configure OpenAI client for OpenRouter (FREE)
    client = OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url=OPENROUTER_BASE_URL,
        default_headers={
            "HTTP-Referer": "https://fabric-vs-databricks-decision-tool.local",
            "X-Title": "Fabric vs Databricks MarkItDown Engine",
        }
    )

    # Attempt 1: Official MarkItDown with Plugins + Free Primary Model
    try:
        md = MarkItDown(
            enable_plugins=True,
            llm_client=client,
            llm_model=PRIMARY_MODEL
        )
        result = md.convert(file_path)
        print(json.dumps({
            "status": "success",
            "model": PRIMARY_MODEL,
            "markdown": result.text_content
        }))
        return
    except Exception as e1:
        sys.stderr.write(f"Primary MarkItDown model ({PRIMARY_MODEL}) error: {e1}\n")

    # Attempt 2: MarkItDown with Free Fallback Model
    try:
        md = MarkItDown(
            enable_plugins=True,
            llm_client=client,
            llm_model=FALLBACK_MODEL
        )
        result = md.convert(file_path)
        print(json.dumps({
            "status": "success",
            "model": FALLBACK_MODEL,
            "markdown": result.text_content
        }))
        return
    except Exception as e2:
        sys.stderr.write(f"Fallback MarkItDown model ({FALLBACK_MODEL}) error: {e2}\n")

    # Attempt 3: MarkItDown Basic (No LLM OCR plugin)
    try:
        md_basic = MarkItDown()
        result = md_basic.convert(file_path)
        print(json.dumps({
            "status": "success",
            "model": "basic_markitdown",
            "markdown": result.text_content
        }))
    except Exception as e3:
        print(json.dumps({"error": f"MarkItDown conversion error: {e3}"}))
        sys.exit(1)

if __name__ == "__main__":
    run_conversion()
