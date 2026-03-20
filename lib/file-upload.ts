// File upload utility for handling payment proof uploads
export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
}

export class FileUploadService {
  private static instance: FileUploadService
  private uploadedFiles: Map<string, UploadedFile> = new Map()

  static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService()
    }
    return FileUploadService.instance
  }

  async uploadFile(file: File, bookingId: string): Promise<UploadedFile> {
    // Validate file
    this.validateFile(file)

    try {
      // Upload file to server
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bookingId', bookingId)
      formData.append('type', 'payment-proof') // Specify the type for proper directory

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload file')
      }

      const data = await response.json()
      
      console.log('Upload API response:', data)

      // Generate unique file ID
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const uploadedFile: UploadedFile = {
        id: fileId,
        name: data.fileName || file.name,
        size: data.fileSize || file.size,
        type: data.fileType || file.type,
        url: data.url || data.fileUrl, // Support both 'url' and 'fileUrl' from API
        uploadedAt: new Date().toISOString(),
      }

      // Store file reference in memory
      this.uploadedFiles.set(fileId, uploadedFile)

      // Store metadata in localStorage for persistence
      const existingMeta = JSON.parse(localStorage.getItem("uploaded-files-meta") || "{}")
      existingMeta[fileId] = {
        id: fileId,
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type,
        url: uploadedFile.url,
        uploadedAt: uploadedFile.uploadedAt,
      }
      localStorage.setItem("uploaded-files-meta", JSON.stringify(existingMeta))

      return uploadedFile
    } catch (error) {
      console.error('File upload service error:', error)
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private validateFile(file: File): void {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "image/heic",
      "image/heif",
    ]

    if (file.size > maxSize) {
      throw new Error("File size must be less than 10MB")
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error("File type not supported. Please upload an image or PDF file.")
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  getFile(fileId: string): UploadedFile | null {
    // Try memory first
    if (this.uploadedFiles.has(fileId)) {
      return this.uploadedFiles.get(fileId)!
    }

    // File data not in memory - return null
    // In a real app, you would fetch from cloud storage or database
    return null
  }

  deleteFile(fileId: string): boolean {
    // Remove from memory
    this.uploadedFiles.delete(fileId)

    // Remove metadata from localStorage
    const existingMeta = JSON.parse(localStorage.getItem("uploaded-files-meta") || "{}")
    delete existingMeta[fileId]
    localStorage.setItem("uploaded-files-meta", JSON.stringify(existingMeta))

    return true
  }
}
