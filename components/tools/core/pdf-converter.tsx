"use client"

import { useState, useCallback } from "react"
import { PDFDocument } from "pdf-lib"
import { Button } from "@/components/ui/button"
import TabSwitcher from "@/components/tools/shared/tab-switcher"
import Dropzone from "@/components/tools/shared/dropzone"

const tabs = [
  { id: "image-to-pdf", label: "Image to PDF" },
  { id: "merge-pdfs", label: "Merge PDFs" },
  { id: "pdf-to-text", label: "PDF to Text" },
]

export default function PdfConverter() {
  const [activeTab, setActiveTab] = useState("image-to-pdf")
  const [images, setImages] = useState<File[]>([])
  const [pdfs, setPdfs] = useState<File[]>([])
  const [pdfForText, setPdfForText] = useState<File | null>(null)
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
      const pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

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
            accept="image/png,image/jpeg"
            multiple
            label="Drop images here or click to browse (PNG, JPG)"
          />
          {images.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{images.length} image(s) selected</p>
              <Button onClick={handleImageToPdf} disabled={loading}>
                {loading ? "Converting..." : "Convert to PDF"}
              </Button>
            </div>
          )}
          <ul className="text-sm text-muted-foreground space-y-1">
            {images.map((f, i) => (
              <li key={i} className="truncate">{f.name} ({(f.size / 1024).toFixed(1)} KB)</li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "merge-pdfs" && (
        <div className="space-y-4">
          <Dropzone
            onFiles={setPdfs}
            accept=".pdf"
            multiple
            label="Drop PDF files here or click to browse"
          />
          {pdfs.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{pdfs.length} PDF(s) selected</p>
              <Button onClick={handleMergePdfs} disabled={loading || pdfs.length < 2}>
                {loading ? "Merging..." : "Merge PDFs"}
              </Button>
            </div>
          )}
          <ul className="text-sm text-muted-foreground space-y-1">
            {pdfs.map((f, i) => (
              <li key={i} className="truncate">{f.name} ({(f.size / 1024).toFixed(1)} KB)</li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "pdf-to-text" && (
        <div className="space-y-4">
          <Dropzone
            onFiles={(files) => setPdfForText(files[0] || null)}
            accept=".pdf"
            label="Drop a PDF file here or click to browse"
          />
          {pdfForText && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{pdfForText.name}</p>
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