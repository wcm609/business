import requests
import subprocess
import json
import os

DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY")
GH_TOKEN = os.getenv("GH_TOKEN")
REPO = os.environ["GITHUB_REPOSITORY"]

def get_codeql_alerts():
    headers = {"Authorization": f"token {GH_TOKEN}", "Accept": "application/vnd.github.v3+json"}
    r = requests.get(f"https://api.github.com/repos/{REPO}/code-scanning/alerts?state=open", headers=headers)
    return r.json()

def call_deepseek(prompt):
    resp = requests.post(
        "https://api.deepseek.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type":"application/json"},
        json={
            "model": "deepseek-coder",
            "messages": [{"role":"user","content":prompt}],
            "temperature":0.1
        }
    )
    return resp.json()["choices"][0]["message"]["content"]

def main():
    alerts = get_codeql_alerts()
    if not alerts:
        print("✅ 没有待处理CodeQL告警")
        return
    alert_text = json.dumps(alerts[:5], ensure_ascii=False, indent=2)
    prompt = f"""
你是Java代码安全修复助手。
CodeQL告警：
{alert_text}
要求：
1. 只修复安全漏洞，不要改动原有业务逻辑
2. 输出修改后的完整文件+文件路径
3. 不要多余闲聊内容
"""
    result = call_deepseek(prompt)
    with open("fix_result.md","w",encoding="utf-8") as f:
        f.write(result)

    branch = "auto-fix-codeql"
    subprocess.run(["git","checkout","-b",branch])
    subprocess.run(["git","add","."])
    subprocess.run(["git","commit","-m","auto fix codeql by deepseek"])
    subprocess.run(["git","push","origin",branch])
    subprocess.run([
        "gh","pr","create",
        "--base","main",
        "--head",branch,
        "--title","🤖 DeepSeek自动修复CodeQL漏洞",
        "--body",result,
        "--draft"
    ])

if __name__ == "__main__":
    main()
