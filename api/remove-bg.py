# api/remove-bg.py
from rembg import remove
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
import io

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/remove-bg")
async def remove_bg(request: Request, image: UploadFile = File(...)):
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read and validate file size
        input_data = await image.read()
        if len(input_data) > 5 * 1024 * 1024:  # 5MB limit
            raise HTTPException(status_code=400, detail="File size must be less than 5MB")

        # Process image
        try:
            result = remove(input_data)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

        # Return the processed image
        return Response(content=result, media_type="image/png")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
