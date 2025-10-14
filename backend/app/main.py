from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from .database import create_tables, get_db
from .routers import documents, annotations, tags
from .crud import create_tag
from .schemas import TagCreate

# 创建数据库表
create_tables()

app = FastAPI(
    title="iAnctChinese API",
    description="智能中文古籍标注平台后端API",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含路由
app.include_router(documents.router)
app.include_router(annotations.router)
app.include_router(tags.router)

# 静态文件服务（用于前端）
frontend_path = os.path.join(os.path.dirname(__file__), "../../frontend")
if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=os.path.join(frontend_path, "static")), name="static")
    
    @app.get("/")
    async def read_index():
        return FileResponse(os.path.join(frontend_path, "index.html"))

@app.on_event("startup")
async def startup_event():
    """应用启动时初始化默认标签"""
    db = next(get_db())
    try:
        # 创建默认标签
        default_tags = [
            TagCreate(name="人名", color="#ff6b6b", description="人物名称"),
            TagCreate(name="地名", color="#4ecdc4", description="地理名称"),
            TagCreate(name="书名", color="#45b7d1", description="书籍名称"),
            TagCreate(name="核心概念", color="#96ceb4", description="核心思想概念"),
            TagCreate(name="典故", color="#feca57", description="历史典故"),
            TagCreate(name="时间", color="#ff9ff3", description="时间表述")
        ]
        
        existing_tags = db.query(tags).all()
        if len(existing_tags) == 0:
            for tag_data in default_tags:
                create_tag(db, tag_data)
            db.commit()
            print("默认标签创建成功")
    except Exception as e:
        print(f"创建默认标签时出错: {e}")
    finally:
        db.close()

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "iAnctChinese API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)