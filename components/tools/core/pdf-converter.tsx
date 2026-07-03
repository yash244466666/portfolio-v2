"use client"

import { useState, useCallback } from "react"
import { PDFDocument } from "pdf-lib"
import { Button } from "@/components/ui/button"
import TabSwitcher from "@/components/tools/shared/tab-switcher"
import Dropzone from "@/components/tools/shared/dropzone"
import JSZip from "jszip"

const tabs = [
  { id: "image-to-pdf", label: "Image to PDF" },
  { id: "pdf-to-image", label: "PDF to Image" },
  { id: "merge-pdfs", label: "Merge PDFs" },
  { id: "pdf-to-text", label: "PDF to Text" },
]

export default function PdfConverter() {
  const [activeTab, setActiveTab] = useState("image-to-pdf")
  const [images, setImages] = useState<File[]>([])
  const [pdfs, setPdfs] = useState<File[]>([])
  const [pdfForText, setPdfForText] = useState<File | null>(null)
  const [pdfForImage, setPdfForImage] = useState<File | null>(null)
  const [imagesFromPdf, setImagesFromPdf] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [extractedText, setExtractedText] = useState("")
  const [error, setError] = useState("")

  const handleImageToPdf = useCallback(async () => {
    if (images.length === 0) return
    setLoading(true)
    setError("")
    try {
      const pdfDoc = await PDFDocument.create()

      for (const file of images) {
        const arrayBuffer = await file.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)

        let image
        if (file.type === "image/png") {
          image = await pdfDoc.embedPng(bytes)
        } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
          image = await pdfDoc.embedJpg(bytes)
        } else {
          setError(`Unsupported image format: ${file.type}`)
          continue
        }

        const page = pdfDoc.addPage([image.width, image.height])
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "images.pdf"
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create PDF")
    } finally {
      setLoading(false)
    }
  }, [images])

  const handleMergePdfs = useCallback(async () => {
    if (pdfs.length < 2) {
      setError("Please select at least 2 PDF files to merge")
      return
    }
    setLoading(true)
    setError("")
    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of pdfs) {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        for (const page of pages) {
          mergedPdf.addPage(page)
        }
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "merged.pdf"
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to merge PDFs")
    } finally {
      setLoading(false)
    }
  }, [pdfs])

  const handlePdfToText = useCallback(async () => {
    if (!pdfForText) return
    setLoading(true)
    setError("")
    setExtractedText("")

    try {
      // @ts-ignore
      const pdfjsModule = await import("pdfjs-dist/legacy/build/pdf.min.mjs")
      const pdfjsLib = pdfjsModule.default || pdfjsModule
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
      }

      const arrayBuffer = await pdfForText.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let fullText = ""

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => (item && "str" in item ? item.str : ""))
          .join(" ")
        fullText += pageText + "\n\n"
      }

      setExtractedText(fullText.trim())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract text")
    } finally {
      setLoading(false)
    }
  }, [pdfForText])

  const handlePdfToImage = useCallback(async () => {
    if (!pdfForImage) return
    setLoading(true)
    setError("")
    setImagesFromPdf([])

    try {
      // @ts-ignore
      const pdfjsModule = await import("pdfjs-dist/legacy/build/pdf.min.mjs")
      const pdfjsLib = pdfjsModule.default || pdfjsModule
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
      }

      const arrayBuffer = await pdfForImage.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const newImages = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 }) // High res
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        if (!context) continue
        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({ canvasContext: context, viewport, canvas } as any).promise
        newImages.push(canvas.toDataURL("image/png"))
      }

      setImagesFromPdf(newImages)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to convert PDF to images")
    } finally {
      setLoading(false)
    }
  }, [pdfForImage])

  const handleDownloadAllAsZip = useCallback(async () => {
    if (imagesFromPdf.length === 0) return
    const zip = new JSZip()
    
    imagesFromPdf.forEach((src, i) => {
      const base64Data = src.split(",")[1]
      zip.file(`page-${i + 1}.png`, base64Data, { base64: true })
    })
    
    const content = await zip.generateAsync({ type: "blob" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(content)
    a.download = `${pdfForImage?.name.replace(/\.[^.]+$/, "") || "pdf"}-images.zip`
    a.click()
  }, [imagesFromPdf, pdfForImage])

  return (
    <div className="space-y-6">
      <TabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {activeTab === "image-to-pdf" && (
        <div className="space-y-4">
          <Dropzone
            onFiles={setImages}
            selectedFiles={images}
            accept="image/png,image/jpeg"
            multiple
            label="Drop images here or click to browse (PNG, JPG)"
          />
          {images.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={handleImageToPdf} disabled={loading}>
                {loading ? "Converting..." : "Convert to PDF"}
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "pdf-to-image" && (
        <div className="space-y-4">
          <Dropzone
            onFiles={(files) => { setPdfForImage(files[0] || null); setImagesFromPdf([]); }}
            selectedFiles={pdfForImage ? [pdfForImage] : null}
            accept=".pdf"
            label="Drop a PDF file here or click to browse"
          />
          {pdfForImage && (
            <div className="flex justify-end gap-3">
              {imagesFromPdf.length > 0 && (
                <Button onClick={handleDownloadAllAsZip} variant="secondary">
                  Download All as ZIP
                </Button>
              )}
              <Button onClick={handlePdfToImage} disabled={loading}>
                {loading ? "Converting..." : "Convert to Images"}
              </Button>
            </div>
          )}
          {imagesFromPdf.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              {imagesFromPdf.map((src, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-border">
                  <img src={src} alt={`Page ${i + 1}`} className="w-full h-auto" />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        const a = document.createElement("a")
                        a.href = src
                        a.download = `page-${i + 1}.png`
                        a.click()
                      }}
                    >
                      Download PNG
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded backdrop-blur-md">
                    Page {i + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "merge-pdfs" && (
        <div className="space-y-4">
          <Dropzone
            onFiles={setPdfs}
            selectedFiles={pdfs}
            accept=".pdf"
            multiple
            label="Drop PDF files here or click to browse"
          />
          {pdfs.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={handleMergePdfs} disabled={loading || pdfs.length < 2}>
                {loading ? "Merging..." : "Merge PDFs"}
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "pdf-to-text" && (
        <div className="space-y-4">
          <Dropzone
            onFiles={(files) => { setPdfForText(files[0] || null); setExtractedText(""); }}
            selectedFiles={pdfForText ? [pdfForText] : null}
            accept=".pdf"
            label="Drop a PDF file here or click to browse"
          />
          {pdfForText && (
            <div className="flex justify-end">
              <Button onClick={handlePdfToText} disabled={loading}>
                {loading ? "Extracting..." : "Extract Text"}
              </Button>
            </div>
          )}
          {extractedText && (
            <div className="relative">
              <textarea
                readOnly
                value={extractedText}
                className="w-full min-h-[200px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y text-sm"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}