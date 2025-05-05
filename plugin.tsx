import * as React from "react"
import { motion } from "framer-motion"

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function BgRemoverPlugin() {
    const [imageSrc, setImageSrc] = React.useState<string | null>(null)
    const [resultSrc, setResultSrc] = React.useState<string | null>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    // Cleanup function for object URLs
    React.useEffect(() => {
        return () => {
            if (imageSrc) URL.revokeObjectURL(imageSrc)
            if (resultSrc) URL.revokeObjectURL(resultSrc)
        }
    }, [imageSrc, resultSrc])

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return 'Please upload a valid image file (JPEG, PNG, or WebP)'
        }
        if (file.size > MAX_FILE_SIZE) {
            return 'File size must be less than 5MB'
        }
        return null
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file
        const validationError = validateFile(file)
        if (validationError) {
            setError(validationError)
            return
        }

        try {
            setError(null)
            setIsLoading(true)
            
            // Cleanup old URLs
            if (imageSrc) URL.revokeObjectURL(imageSrc)
            if (resultSrc) URL.revokeObjectURL(resultSrc)
            
            setImageSrc(URL.createObjectURL(file))

            const formData = new FormData()
            formData.append("image", file)

            const response = await fetch("/api/remove-bg", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const blob = await response.blob()
            setResultSrc(URL.createObjectURL(blob))
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            setResultSrc(null)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div 
            style={{ 
                background: "#fff", 
                width: "100%", 
                height: "100%",
                padding: "20px"
            }}
        >
            <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                onChange={handleFileChange} 
                style={{ margin: 10 }} 
            />
            {error && (
                <div style={{ color: "red", margin: 10 }}>
                    {error}
                </div>
            )}
            <div style={{ display: "flex", gap: "10px", marginTop: 20 }}>
                {imageSrc && <img src={imageSrc} alt="input" width="150" />}
                {isLoading && <div>Processing...</div>}
                {resultSrc && <img src={resultSrc} alt="output" width="150" />}
            </div>
        </motion.div>
    )
}
