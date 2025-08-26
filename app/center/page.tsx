"use client"

import { useState, useRef, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { STORAGE_KEYS, type StockItem, type CenterStock } from "@/lib/types"
import { Building2, SortAsc, Plus, Download, Trash2, Settings, BoxSelect, ImageIcon, Link2 } from "lucide-react"

export default function CenterPage() {
  const [allCourses] = useLocalStorage<Record<string, StockItem[]>>(STORAGE_KEYS.COURSES, {})
  const [centers, setCenters] = useLocalStorage<string[]>(
    STORAGE_KEYS.CENTERS,
    ["ศรีราชา", "ระยอง", "ลาดกระบัง", "บางพลัด"]
  )
  const [centerStocks, setCenterStocks] = useLocalStorage<CenterStock>(STORAGE_KEYS.CENTER_STOCK, {})
  const [categoriesLS] = useLocalStorage<string[]>(STORAGE_KEYS.CATEGORIES, ["ทั่วไป"])

  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedCenter, setSelectedCenter] = useState("")
  const [isCentersModalOpen, setIsCentersModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // ===== รวม Preview + เปลี่ยน/ลบ + ตั้งค่าด้วย URL ไว้ dialog เดียว =====
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [currentImageEditId, setCurrentImageEditId] = useState<number | null>(null)
  const [imageVersion, setImageVersion] = useState(0)      // บังคับ refresh <img>
  const [tempImageUrl, setTempImageUrl] = useState("")     // ช่องกรอก URL ชั่วคราว

  const [newCenterName, setNewCenterName] = useState("")

  const courseNames = Object.keys(allCourses).sort((a, b) => a.localeCompare(b, "th"))
  const currentStock = selectedCenter ? centerStocks[selectedCenter] || [] : []

  // รวมหมวดหมู่จากลิสต์กลาง + ที่พบจริง
  const categoriesOptions = useMemo(() => {
    const set = new Set<string>(categoriesLS)
    Object.values(allCourses).forEach((arr) => {
      arr.forEach((i) => i.category && set.add(i.category))
    })
    Object.values(centerStocks).forEach((arr) => {
      ;(arr || []).forEach((i) => i.category && set.add(i.category))
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, "th"))
  }, [categoriesLS, allCourses, centerStocks])

  const addCenter = () => {
    const name = newCenterName.trim()
    if (name && !centers.includes(name)) {
      const newCenters = [...centers, name].sort((a, b) => a.localeCompare(b, "th"))
      setCenters(newCenters)
      setNewCenterName("")
    }
  }

  const deleteCenter = (name: string) => {
    if (confirm(`ต้องการลบศูนย์ "${name}" และข้อมูลสต็อกทั้งหมด?`)) {
      setCenters((prev) => prev.filter((c) => c !== name))
      setCenterStocks((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
      if (selectedCenter === name) setSelectedCenter("")
    }
  }

  const addCenterRow = () => {
    if (!selectedCenter) {
      alert("กรุณาเลือกศูนย์ก่อนเพิ่มรายการ")
      return
    }
    const newItem: StockItem = {
      id: Date.now(),
      name: "สินค้าใหม่ (เพิ่มในศูนย์)",
      image: "/vectoricon.png",
      category: "ทั่วไป",
      required: 1,
      inStock: 0,
    }
    setCenterStocks((prev) => ({
      ...prev,
      [selectedCenter]: [newItem, ...(prev[selectedCenter] || [])],
    }))
  }

  const updateCenterItem = (id: number, field: keyof StockItem, value: string | number) => {
    if (!selectedCenter) return
    setCenterStocks((prev) => ({
      ...prev,
      [selectedCenter]: (prev[selectedCenter] || []).map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "name" || field === "category" || field === "image"
                  ? (value as string)
                  : (Number(value) || 0),
            }
          : item
      ),
    }))
  }

  const deleteCenterItem = (id: number) => {
    if (!selectedCenter) return
    setCenterStocks((prev) => ({
      ...prev,
      [selectedCenter]: (prev[selectedCenter] || []).filter((item) => item.id !== id),
    }))
  }

  const sortCenterData = () => {
    if (!selectedCenter || !centerStocks[selectedCenter]) return
    setCenterStocks((prev) => ({
      ...prev,
      [selectedCenter]: [...(prev[selectedCenter] || [])].sort((a, b) => a.name.localeCompare(b.name, "th")),
    }))
  }

  const clearAll = () => {
    if (!selectedCenter) return
    if (confirm(`ยืนยันการล้างข้อมูลสต็อกทั้งหมดของศูนย์ "${selectedCenter}"?`)) {
      setCenterStocks((prev) => ({ ...prev, [selectedCenter]: [] }))
    }
  }

  const exportCenterStock = () => {
    if (!selectedCenter || !centerStocks[selectedCenter] || centerStocks[selectedCenter].length === 0) {
      alert("ไม่มีข้อมูลให้ส่งออก")
      return
    }
    const dataToExport = centerStocks[selectedCenter].map((item) => ({
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
    link.download = `stock_center_${selectedCenter}.csv`
    link.click()
  }

  const confirmImport = (selectedIds: number[]) => {
    if (!selectedCourse || !selectedCenter) return
    const courseStock = allCourses[selectedCourse] || []
    if (!centerStocks[selectedCenter]) {
      setCenterStocks((prev) => ({ ...prev, [selectedCenter]: [] }))
    }
    const itemsToImport = selectedIds
      .map((id) => courseStock.find((item) => item.id === id))
      .filter(Boolean)
      .map((item) => ({ ...item!, required: 1, inStock: 0 }))
    setCenterStocks((prev) => ({
      ...prev,
      [selectedCenter]: [...(prev[selectedCenter] || []), ...itemsToImport],
    }))
    setIsImportModalOpen(false)
  }

  // === อัปโหลด/ตั้งค่ารูป ===
  const handleImageUpload = (id: number) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (evt) => {
          updateCenterItem(id, "image", evt.target?.result as string) // Data URL
          setImageVersion((v) => v + 1) // บังคับ refresh
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleSetImageByUrl = (id: number) => {
    const url = tempImageUrl.trim()
    if (!url) {
      alert("กรุณากรอก URL ของรูปภาพ")
      return
    }
    updateCenterItem(id, "image", url)
    setImageVersion((v) => v + 1)
    setTempImageUrl("")
  }

  const handleDeleteImage = (id: number) => {
    updateCenterItem(id, "image", "/placeholder.svg")
    setImageVersion((v) => v + 1)
    setTempImageUrl("")
  }

  // รูปปัจจุบันที่จะแสดงใน dialog รวม
  const currentImageSrc =
    currentImageEditId != null
      ? (currentStock.find(i => i.id === currentImageEditId)?.image || "/placeholder.svg")
      : null

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h2 className="main-header mb-6 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          <span>จัดการสต็อกศูนย์</span>
        </h2>

        <div className="control-panel mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs mr-2">1</span>
                เลือกคอร์ส (แหล่งข้อมูล):
              </label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="-- กรุณาเลือกคอร์ส --" />
                </SelectTrigger>
                <SelectContent>
                  {courseNames.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs mr-2">2</span>
                เลือกศูนย์ (ปลายทาง):
              </label>
              <div className="flex gap-2">
                <Select value={selectedCenter} onValueChange={setSelectedCenter} disabled={!selectedCourse}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent>
                    {centers.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsCentersModalOpen(true)}
                  title="จัดการศูนย์"
                  className="hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {selectedCenter && (
            <div className="flex flex-wrap gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={sortCenterData}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100 bg-transparent">
                <SortAsc className="w-4 h-4" /> เรียง
              </Button>
              <Button size="sm" onClick={addCenterRow}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white">
                <Plus className="w-4 h-4" /> เพิ่ม
              </Button>
              <Button size="sm" onClick={() => setIsImportModalOpen(true)} disabled={!selectedCourse}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white disabled:bg-gray-400">
                <BoxSelect className="w-4 h-4" /> ดึงจากคอร์ส
              </Button>
              <Button size="sm" variant="secondary" onClick={exportCenterStock}
                className="flex items-center gap-2 bg-orange-100 text-orange-800 hover:bg-orange-200 active:bg-orange-300">
                <Download className="w-4 h-4" /> ส่งออก
              </Button>
              <Button size="sm" variant="destructive" onClick={clearAll}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white">
                <Trash2 className="w-4 h-4" /> ล้าง
              </Button>
            </div>
          )}
        </div>

        {!selectedCenter ? (
          <div className="no-data-message">
            <h4 className="text-xl font-semibold mb-2">กรุณาเลือกคอร์สและศูนย์เพื่อแสดงข้อมูล</h4>
          </div>
        ) : currentStock.length === 0 ? (
          <div className="no-data-message">
            <h4 className="text-xl font-semibold mb-2">ศูนย์นี้ยังไม่มีรายการสินค้า</h4>
            <p className="text-muted-foreground">กดปุ่ม "ดึงจากคอร์ส" หรือ "เพิ่ม" เพื่อสร้างรายการ</p>
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
              {currentStock.map((item) => {
                const needed = Math.max(0, (item.required || 0) - (item.inStock || 0))
                const isComplete = (item.inStock || 0) >= (item.required || 0) && (item.required || 0) > 0

                return (
                  <TableRow key={item.id} className={isComplete ? "status-complete" : "status-incomplete"}>
                    <TableCell className="text-center">
                      {/* คลิกที่รูปเพื่อเปิด dialog รวม (ดูใหญ่ + เปลี่ยน/ลบ/URL) */}
                      <img
                        key={imageVersion + "-" + item.id}
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md mx-auto cursor-zoom-in"
                        onError={(e) => { (e.currentTarget.src = "/placeholder.svg") }}
                        onClick={() => {
                          setCurrentImageEditId(item.id)
                          setTempImageUrl("")
                          setIsImageDialogOpen(true)
                        }}
                        onDoubleClick={() => window.open(item.image || "/placeholder.svg", "_blank")}
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        value={item.name}
                        onChange={(e) => updateCenterItem(item.id, "name", e.target.value)}
                        className="w-full"
                      />
                    </TableCell>

                    <TableCell>
                      <Select value={item.category} onValueChange={(v) => updateCenterItem(item.id, "category", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {categoriesOptions.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        value={item.required || 0}
                        onChange={(e) => updateCenterItem(item.id, "required", e.target.value)}
                        min="0"
                        className="text-center"
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        value={item.inStock || 0}
                        onChange={(e) => updateCenterItem(item.id, "inStock", e.target.value)}
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
                            setCenterStocks((prev) => ({
                              ...prev,
                              [selectedCenter]: (prev[selectedCenter] || []).map((it) =>
                                it.id === item.id ? { ...it, inStock: (it.inStock || 0) + amount } : it
                              ),
                            }))
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
                      <Button size="sm" variant="destructive" onClick={() => deleteCenterItem(item.id)} className="w-full">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {/* Centers Management Modal */}
        <Dialog open={isCentersModalOpen} onOpenChange={setIsCentersModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" /> จัดการศูนย์กระจาย
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newCenterName}
                  onChange={(e) => setNewCenterName(e.target.value)}
                  placeholder="เพิ่มศูนย์ใหม่..."
                  className="flex-1"
                />
                <Button onClick={addCenter} className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white">
                  เพิ่ม
                </Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {centers.map((center) => (
                  <div key={center} className="flex justify-between items-center p-2 border rounded">
                    <span>{center}</span>
                    <Button
                      size="sm" variant="outline" onClick={() => deleteCenter(center)}
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 active:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import from Course Modal */}
        <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ดึงสินค้าจากคอร์ส</DialogTitle>
            </DialogHeader>
            <ImportModalContent
              selectedCourse={selectedCourse}
              selectedCenter={selectedCenter}
              allCourses={allCourses}
              centerStocks={centerStocks}
              onConfirm={confirmImport}
              onClose={() => setIsImportModalOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* ===== Dialog เดียว: Preview + อัปโหลด + ตั้งค่า URL + ลบ ===== */}
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>ดู/จัดการรูปภาพ</DialogTitle>
            </DialogHeader>

            {currentImageSrc && (
              <img
                key={imageVersion}
                src={currentImageSrc}
                alt="preview"
                className="w-full max-h-[70vh] object-contain rounded-lg border bg-white"
                title="ดับเบิลคลิกเพื่อเปิดในแท็บใหม่"
                onDoubleClick={() => window.open(currentImageSrc, "_blank")}
                onError={(e) => { (e.currentTarget.src = "/placeholder.svg") }}
              />
            )}

            {/* ใส่ URL */}
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
                  if (currentImageEditId != null) handleSetImageByUrl(currentImageEditId)
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
                  if (currentImageEditId != null) handleImageUpload(currentImageEditId)
                }}
                className="flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                อัปโหลดรูป
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  if (currentImageEditId != null) handleDeleteImage(currentImageEditId)
                }}
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                ลบรูปภาพ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// -------------------------
// Separate component for import modal content
// -------------------------
function ImportModalContent({
  selectedCourse,
  selectedCenter,
  allCourses,
  centerStocks,
  onConfirm,
  onClose,
}: {
  selectedCourse: string
  selectedCenter: string
  allCourses: Record<string, StockItem[]>
  centerStocks: CenterStock
  onConfirm: (selectedIds: number[]) => void
  onClose: () => void
}) {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const selectAllRef = useRef<HTMLInputElement>(null)

  const courseStock = allCourses[selectedCourse] || []
  const centerStockIds = new Set((centerStocks[selectedCenter] || []).map((i) => i.id))

  const selectableIds = useMemo(
    () => courseStock.filter((item) => !centerStockIds.has(item.id)).map((item) => item.id),
    [courseStock, centerStockIds]
  )

  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedItems.has(id))
  const someSelected = selectedItems.size > 0 && !allSelected

  // indeterminate checkbox
  useState(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allSelected
    }
  })

  const handleItemToggle = (id: number) => {
    if (centerStockIds.has(id)) return
    setSelectedItems((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleToggleAll = (checked: boolean) => {
    setSelectedItems(checked ? new Set(selectableIds) : new Set())
  }

  const handleConfirm = () => {
    onConfirm(Array.from(selectedItems))
    setSelectedItems(new Set())
  }

  if (!selectedCourse) {
    return <div className="text-center text-red-600 py-4">กรุณาเลือกคอร์สก่อน</div>
  }
  if (courseStock.length === 0) {
    return <div className="text-center text-muted-foreground py-4">คอร์สนี้ไม่มีสินค้าในคลัง</div>
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center space-x-2 p-2 border rounded bg-white">
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={allSelected}
            onChange={(e) => handleToggleAll(e.target.checked)}
            className="rounded"
            id="select-all"
            disabled={selectableIds.length === 0}
          />
        <label htmlFor="select-all" className="cursor-pointer select-none">
            เลือกทั้งหมด ({selectableIds.length} รายการที่เลือกได้)
          </label>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2">
          {courseStock.map((item) => {
            const isImported = centerStockIds.has(item.id)
            const isSelected = selectedItems.has(item.id)
            const inputId = `pick-${item.id}`
            return (
              <div key={item.id} className="flex items-center space-x-2 p-2 border rounded bg-white">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={isSelected}
                  disabled={isImported}
                  onChange={() => handleItemToggle(item.id)}
                  className="rounded"
                />
                <label htmlFor={inputId} className="flex-1 cursor-pointer">
                  {item.name}
                  {isImported && (
                    <span className="ml-2 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">
                      มีแล้ว
                    </span>
                  )}
                </label>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} className="hover:bg-gray-50 active:bg-gray-100 bg-transparent">
          ยกเลิก
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={selectedItems.size === 0}
          className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white disabled:bg-gray-400"
        >
          นำเข้า ({selectedItems.size} รายการ)
        </Button>
      </div>
    </>
  )
}
