"use client"

import type React from "react"
import { ExcelImportGuide } from "@/components/excel-import-guide"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { STORAGE_KEYS, type StockItem } from "@/lib/types"
import {
  Table, TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Search,
  SortAsc,
  Tags,
  Download,
  Upload,
  Plus,
  Trash2,
  Package,
  ImageIcon,
  FileSpreadsheet,
  Link2,
} from "lucide-react"
import Link from "next/link"

export default function CourseStockPage() {
  const params = useParams()
  const router = useRouter()
  const courseName = decodeURIComponent(params.courseName as string)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [allCourses, setAllCourses] = useLocalStorage<Record<string, StockItem[]>>(STORAGE_KEYS.COURSES, {})
  const [categories, setCategories] = useLocalStorage<string[]>(STORAGE_KEYS.CATEGORIES, ["ทั่วไป"])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด")
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  // รูป/ดูใหญ่ + จัดการรูป (อัปโหลด/URL/ลบ)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [currentImageEditId, setCurrentImageEditId] = useState<number | null>(null)
  const [imageVersion, setImageVersion] = useState(0)        // บังคับ refresh รูป
  const [tempImageUrl, setTempImageUrl] = useState("")       // สำหรับป้อน URL ชั่วคราว

  const [newCategoryName, setNewCategoryName] = useState("")
  const [isImportGuideOpen, setIsImportGuideOpen] = useState(false)

  const courseStock = allCourses[courseName] || []

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      if (!courseName || !allCourses[courseName]) {
        router.push("/")
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [courseName, allCourses, router, setAllCourses])

  const filteredStock = courseStock.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "ทั้งหมด" || !selectedCategory || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addRow = () => {
    const newItem: StockItem = {
      id: Date.now(),
      name: "สินค้าใหม่",
      image: "/vectoricon.png",           // ไฟล์นี้ควรอยู่ใน public/
      category: "ทั่วไป",
      required: 1,
      inStock: 0,
    }
    setAllCourses((prev) => ({
      ...prev,
      [courseName]: [newItem, ...courseStock],
    }))
  }

  const deleteRow = (id: number) => {
    if (confirm("ต้องการลบรายการนี้ออกจากคอร์ส?")) {
      setAllCourses((prev) => ({
        ...prev,
        [courseName]: courseStock.filter((item) => item.id !== id),
      }))
    }
  }

  const updateItem = (id: number, field: keyof StockItem, value: string | number) => {
    setAllCourses((prev) => ({
      ...prev,
      [courseName]: courseStock.map((item) =>
        item.id === id
          ? { ...item, [field]: field === "name" || field === "category" || field === "image" ? value : Number(value) || 0 }
          : item,
      ),
    }))
  }

  const handleAddStock = (id: number, amount: number) => {
    if (amount > 0) {
      setAllCourses((prev) => ({
        ...prev,
        [courseName]: courseStock.map((item) =>
          item.id === id ? { ...item, inStock: (item.inStock || 0) + amount } : item,
        ),
      }))
    }
  }

  const sortData = () => {
    setAllCourses((prev) => ({
      ...prev,
      [courseName]: [...courseStock].sort((a, b) => {
        const catCompare = a.category.localeCompare(b.category, "th")
        if (catCompare !== 0) return catCompare
        return a.name.localeCompare(b.name, "th")
      }),
    }))
  }

  const clearAll = () => {
    if (confirm(`ยืนยันการล้างข้อมูลทั้งหมดในคอร์ส "${courseName}"?`)) {
      setAllCourses((prev) => ({
        ...prev,
        [courseName]: [],
      }))
    }
  }

  const addCategory = () => {
    const newCat = newCategoryName.trim()
    if (newCat && !categories.includes(newCat)) {
      setCategories((prev) => [...prev, newCat].sort((a, b) => a.localeCompare(b, "th")))
      setNewCategoryName("")
    }
  }

  const deleteCategory = (categoryToDelete: string) => {
    setCategories((prev) => prev.filter((cat) => cat !== categoryToDelete))
  }

  // ----------- จัดการรูป -----------
  // อัปโหลดไฟล์ -> เก็บเป็น Data URL
  const handleImageUpload = (id: number) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (evt) => {
          updateItem(id, "image", evt.target?.result as string) // data:image/xxx;base64,...
          setImageVersion((v) => v + 1)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  // รับ URL ภายนอก -> เซฟเป็น string URL
  const handleSetImageByUrl = (id: number) => {
    const url = tempImageUrl.trim()
    if (!url) {
      alert("กรุณากรอก URL ของรูปภาพ")
      return
    }
    updateItem(id, "image", url)
    setImageVersion((v) => v + 1)
    setTempImageUrl("")
  }

  // ลบ/รีเซ็ตเป็น placeholder
  const handleDeleteImage = (id: number) => {
    updateItem(id, "image", "/placeholder.svg")  // ไฟล์นี้ควรอยู่ใน public/
    setImageVersion((v) => v + 1)
    setTempImageUrl("")
  }

  const exportData = () => {
    if (courseStock.length === 0) {
      alert("ไม่มีข้อมูลให้ส่งออก")
      return
    }
    const dataToExport = courseStock.map((item) => ({
      รายการ: item.name,
      หมวดหมู่: item.category,
      ต้องการ: item.required || 0,
      มีแล้ว: item.inStock || 0,
      ขาด: Math.max(0, (item.required || 0) - (item.inStock || 0)),
    }))

    const csvContent = [
      Object.keys(dataToExport[0]).join(","),
      ...dataToExport.map((row) => Object.values(row).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `stock_${courseName}.csv`
    link.click()
  }

  // นำเข้าข้อมูล (รองรับ CSV/TXT)
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    if (fileExtension === "xlsx" || fileExtension === "xls") {
      const reader = new FileReader()
      reader.onload = () => {
        alert("การนำเข้าไฟล์ Excel ยังไม่รองรับในสภาพแวดล้อมนี้ กรุณาใช้ไฟล์ CSV แทน")
        if (event.target) event.target.value = ""
      }
      reader.readAsArrayBuffer(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split(/\r?\n/).filter((line) => line.trim())
        if (lines.length < 2) {
          alert("ไฟล์ต้องมีหัวตารางและข้อมูลอย่างน้อย 1 แถว")
          return
        }

        const dataLines = lines.slice(1)
        const newItems: StockItem[] = []

        dataLines.forEach((line, index) => {
          if (!line.trim()) return
          const columns = line.split(",").map((col) => col.trim().replace(/^"|"$/g, ""))

          if (columns.length >= 1 && columns[0]) {
            const newItem: StockItem = {
              id: Date.now() + Math.random() + index,
              name: columns[0] || "สินค้าใหม่",
              image: "/vectoricon.png",
              category: columns[1] || "ทั่วไป",
              required: Math.max(0, Number.parseInt(columns[2]) || 1),
              inStock: Math.max(0, Number.parseInt(columns[3]) || 0),
            }
            newItems.push(newItem)
          }
        })

        if (newItems.length === 0) {
          alert("ไม่พบข้อมูลที่ถูกต้องในไฟล์\nกรุณาตรวจสอบรูปแบบไฟล์ CSV")
          return
        }

        const replaceData = confirm(
          `พบข้อมูล ${newItems.length} รายการ\n\nคุณต้องการ:\n- OK: ล้างข้อมูลเก่าและใช้ข้อมูลใหม่\n- Cancel: เพิ่มข้อมูลใหม่ต่อท้ายข้อมูลเก่า`,
        )

        setAllCourses((prev) => {
          const next = {
            ...prev,
            [courseName]: replaceData ? newItems : [...(prev[courseName] || []), ...newItems],
          }
          try {
            localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(next))
          } catch {}
          return next
        })

        alert(`นำเข้าข้อมูลสำเร็จ ${newItems.length} รายการ!`)
      } catch (error) {
        console.error("Import error:", error)
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์\nกรุณาตรวจสอบรูปแบบไฟล์")
      } finally {
        if (event.target) event.target.value = ""
      }
    }
    reader.readAsText(file, "UTF-8")
  }

  // src ของรูปที่จะโชว์ใหญ่ใน Dialog (อัปเดตสดจาก allCourses)
  const currentImageSrc =
    currentImageEditId != null
      ? (allCourses[courseName]?.find(i => i.id === currentImageEditId)?.image || "/placeholder.svg")
      : null

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="main-header mb-0 flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <span>คลังอุปกรณ์: {courseName}</span>
          </h2>
          <Link href="/">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent hover:bg-blue-50 active:bg-blue-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับหน้าจัดการคอร์ส
            </Button>
          </Link>
        </div>

        <div className="control-panel mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">ค้นหารายการ:</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหา..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">กรองตามหมวดหมู่:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="-- ทั้งหมด --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ทั้งหมด">-- ทั้งหมด --</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={sortData}
              className="flex items-center gap-2 bg-transparent hover:bg-blue-50 active:bg-blue-100 transition-colors"
            >
              <SortAsc className="w-4 h-4" />
              เรียง
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2 hover:bg-blue-50 active:bg-blue-100 transition-colors"
            >
              <Tags className="w-4 h-4" />
              หมวดหมู่
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={exportData}
              className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 active:bg-blue-300 transition-colors"
            >
              <Download className="w-4 h-4" />
              ส่งออก
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsImportGuideOpen(true)}
              className="flex items-center gap-2 hover:bg-blue-50 active:bg-blue-100 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              คู่มือนำเข้า
            </Button>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors"
            >
              <Upload className="w-4 h-4" />
              นำเข้า
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              size="sm"
              onClick={addRow}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              เพิ่ม
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={clearAll}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              ล้าง
            </Button>
          </div>
        </div>

        {filteredStock.length === 0 ? (
          <div className="no-data-message">
            <h4 className="text-xl font-semibold mb-2">
              {courseStock.length === 0 ? "ยังไม่มีสินค้าในคอร์สนี้" : "ไม่พบรายการที่ค้นหา"}
            </h4>
            <p className="text-muted-foreground">
              {courseStock.length === 0 ? 'คลิก "เพิ่มสินค้า" หรือ "นำเข้า" เพื่อเริ่มต้น' : "ลองเปลี่ยนคำค้นหาหรือหมวดหมู่"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="[&_*]:text-white">
              <TableRow>
                <TableHead className="text-center bg-slate-600 rounded-tl-2xl">ภาพ</TableHead>
                <TableHead className="text-center bg-slate-600">รายการ</TableHead>
                <TableHead className="text-center bg-slate-600">หมวดหมู่</TableHead>
                <TableHead className="text-center bg-indigo-800">ต้องการ</TableHead>
                <TableHead className="text-center bg-indigo-800">มีแล้ว</TableHead>
                <TableHead className="text-center bg-indigo-800">เพิ่ม</TableHead>
                <TableHead className="text-center bg-indigo-800">ขาด</TableHead>
                <TableHead className="text-center bg-blue-500 rounded-tr-2xl">สถานะ/ลบ</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredStock.map((item) => {
                const needed = Math.max(0, (item.required || 0) - (item.inStock || 0))
                const isComplete = (item.inStock || 0) >= (item.required || 0) && (item.required || 0) > 0

                return (
                  <TableRow key={item.id} className={isComplete ? "status-complete" : "status-incomplete"}>
                    <TableCell className="text-center">
                      {/* Thumbnail */}
                      <img
                        key={imageVersion + "-" + item.id}
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md mx-auto cursor-zoom-in"
                        onError={(e) => { (e.currentTarget.src = "/placeholder.svg") }}
                        onClick={() => {
                          setCurrentImageEditId(item.id)
                          setTempImageUrl("")    // เคลียร์ช่อง URL ทุกครั้งที่เปิด
                          setIsImageModalOpen(true)
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        className="w-full"
                      />
                    </TableCell>

                    <TableCell>
                      <Select value={item.category} onValueChange={(value) => updateItem(item.id, "category", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        value={item.required || 0}
                        onChange={(e) => updateItem(item.id, "required", e.target.value)}
                        min="0"
                        className="text-center"
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        value={item.inStock || 0}
                        onChange={(e) => updateItem(item.id, "inStock", e.target.value)}
                        min="0"
                        className="text-center"
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        className="text-center"
                        onBlur={(e) => {
                          const amount = Number.parseInt(e.target.value) || 0
                          if (amount > 0) {
                            handleAddStock(item.id, amount)
                            e.target.value = ""
                          }
                        }}
                      />
                    </TableCell>

                    <TableCell className={`text-center font-bold ${needed > 0 ? "text-red-600" : "text-blue-600"}`}>
                      {needed}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className={`font-bold mb-2 ${isComplete ? "text-blue-600" : "text-red-600"}`}>
                        {isComplete ? "ครบ" : "ยังขาด"}
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => deleteRow(item.id)} className="w-full">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {/* จัดการหมวดหมู่ */}
        <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tags className="w-5 h-5" />
                จัดการหมวดหมู่
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="เพิ่มหมวดหมู่ใหม่..."
                  className="flex-1"
                />
                <Button onClick={addCategory}>เพิ่ม</Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat} className="flex justify-between items-center p-2 border rounded">
                    <span>{cat}</span>
                    <Button size="sm" variant="outline" onClick={() => deleteCategory(cat)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* รวม Preview + ปุ่มอัปโหลด + ปุ่มตั้งค่าด้วย URL + ปุ่มลบ */}
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>รูปภาพสินค้า</DialogTitle>
            </DialogHeader>

            {/* Preview ใหญ่ */}
            {currentImageSrc && (
              <img
                key={imageVersion}
                src={currentImageSrc}
                alt="preview"
                className="w-full max-h-[60vh] object-contain rounded-lg border bg-white"
                onError={(e) => { (e.currentTarget.src = "/placeholder.svg") }}
              />
            )}

            {/* แถวใส่ URL + ปุ่มตั้งค่า */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  value={tempImageUrl}
                  onChange={(e) => setTempImageUrl(e.target.value)}
                  placeholder="วางลิงก์รูปภาพ (https://...)"
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  if (currentImageEditId) handleSetImageByUrl(currentImageEditId)
                }}
                className="w-full md:w-auto"
              >
                ใช้ URL นี้
              </Button>
            </div>

            {/* ปุ่มอัปโหลด/ลบ */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  if (currentImageEditId) handleImageUpload(currentImageEditId)
                }}
                className="flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                อัปโหลดรูป
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  if (currentImageEditId) handleDeleteImage(currentImageEditId)
                }}
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                ลบรูปภาพ
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <ExcelImportGuide isOpen={isImportGuideOpen} onClose={() => setIsImportGuideOpen(false)} />
      </div>
    </div>
  )
}
