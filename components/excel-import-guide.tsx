"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Download } from "lucide-react"

interface ExcelImportGuideProps {
  isOpen: boolean
  onClose: () => void
}

export function ExcelImportGuide({ isOpen, onClose }: ExcelImportGuideProps) {
  const downloadTemplate = () => {
    const csvContent = [
      "รายการ,หมวดหมู่,ต้องการ,มีแล้ว",
      "สินค้าตัวอย่าง 1,ทั่วไป,10,5",
      "สินค้าตัวอย่าง 2,อุปกรณ์,20,15",
      "สินค้าตัวอย่าง 3,วัสดุ,5,0",
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "template_import.csv"
    link.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            คู่มือการนำเข้าข้อมูล
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">รูปแบบไฟล์ที่รองรับ:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>CSV (.csv) - แนะนำ</li>
              <li>Text (.txt)</li>
              <li>Excel (.xlsx, .xls) - จำกัด</li>
            </ul>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">รูปแบบข้อมูล (CSV):</p>
            <div className="bg-muted p-2 rounded text-xs font-mono">
              รายการ,หมวดหมู่,ต้องการ,มีแล้ว
              <br />
              สินค้า A,ทั่วไป,10,5
              <br />
              สินค้า B,อุปกรณ์,20,15
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={downloadTemplate}
              className="flex items-center gap-2 flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white"
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลดแม่แบบ
            </Button>
            <Button variant="outline" onClick={onClose} className="hover:bg-gray-50 active:bg-gray-100 bg-transparent">
              ปิด
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
