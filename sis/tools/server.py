from typing import Dict
from fastapi import Body, FastAPI
from pydantic import BaseModel
import os

app = FastAPI()

# 确保输出目录存在
OUTPUT_DIR = r"D:\share\BT\Books\心海\sis\save"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def get_safe_filename(filename: str) -> str:
    """
    安全地获取文件名，移除可能的路径分隔符和非法字符。
    """
    # 移除路径分隔符和非法字符
    safe_name = "".join(c for c in filename if not c in r'\/:*?"<>|')
    safe_name = safe_name.strip() + ".txt"
    return safe_name


class Novel(BaseModel):
    filename: str
    content: str


@app.post("/upload")
async def upload_file(novel: Novel):
    try:
        # 构建保存路径
        file_path = os.path.join(OUTPUT_DIR, get_safe_filename(novel.filename))

        # 异步写入文件
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(novel.content)

        return {"filename": novel.filename, "success": True}
    except Exception as e:
        return {"error": str(e), "success": False}


class CheckFile(BaseModel):
    filename: str


@app.post("/check_file")
async def check_file(data: CheckFile):
    """检查文件是否存在"""
    file_path = os.path.join(OUTPUT_DIR, get_safe_filename(data.filename))

    if os.path.exists(file_path):
        return {"exists": True}
    else:
        return {"exists": False}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
