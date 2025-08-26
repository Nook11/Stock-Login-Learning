"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { STORAGE_KEYS } from "@/lib/types"
import { Plus, Edit, Trash2, Package } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [allCourses, setAllCourses] = useLocalStorage<Record<string, any[]>>(STORAGE_KEYS.COURSES, {})
  const [newCourseName, setNewCourseName] = useState("")
  const [editingCourse, setEditingCourse] = useState<string | null>(null)
  const [editCourseName, setEditCourseName] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const courseNames = Object.keys(allCourses).sort((a, b) => a.localeCompare(b, "th"))

  console.log("[v0] All courses data:", allCourses)
  console.log("[v0] Course names:", courseNames)

  const addCourse = () => {
    const name = newCourseName.trim()
    if (name && !allCourses[name]) {
      console.log("[v0] Adding new course:", name)
      setAllCourses((prev) => ({
        ...prev,
        [name]: [],
      }))
      setNewCourseName("")
    } else if (allCourses[name]) {
      alert("มีคอร์สชื่อนี้อยู่แล้ว!")
    }
  }

  const deleteCourse = (name: string) => {
    if (confirm(`ยืนยันการลบคอร์ส "${name}" และข้อมูลสินค้าทั้งหมดในคอร์สนี้?`)) {
      setAllCourses((prev) => {
        const newCourses = { ...prev }
        delete newCourses[name]
        return newCourses
      })
    }
  }

  const openEditModal = (courseName: string) => {
    setEditingCourse(courseName)
    setEditCourseName(courseName)
    setIsEditModalOpen(true)
  }

  const saveCourseName = () => {
    const newName = editCourseName.trim()
    if (!newName || newName === editingCourse) {
      setIsEditModalOpen(false)
      return
    }
    if (allCourses[newName]) {
      alert("มีคอร์สชื่อนี้อยู่แล้ว!")
      return
    }
    if (editingCourse) {
      setAllCourses((prev) => {
        const newCourses = { ...prev }
        newCourses[newName] = newCourses[editingCourse]
        delete newCourses[editingCourse]
        return newCourses
      })
    }
    setIsEditModalOpen(false)
    setEditingCourse(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addCourse()
    }
  }

  const handleCourseClick = (courseName: string) => {
    console.log("[v0] Course clicked:", courseName)
    console.log("[v0] Course data exists:", !!allCourses[courseName])
    console.log("[v0] Encoded URL:", `/course/${encodeURIComponent(courseName)}`)
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h2 className="main-header mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Package className="w-6 h-6" />
          </div>
          <span>คอร์สทั้งหมด</span>
        </h2>

        <div className="control-panel mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex">
                <div className="flex items-center px-4 bg-muted border border-r-0 border-input rounded-l-xl">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <Input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="ตั้งชื่อคอร์สใหม่..."
                  className="rounded-l-none border-l-0 focus:border-l focus:border-primary text-lg "
                />
              </div>
            </div>
            <Button
              onClick={addCourse}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center gap-3 px-6 py-3 text-lg font-semibold shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              สร้างคอร์ส
            </Button>
          </div>
        </div>

        {courseNames.length === 0 ? (
          <div className="no-data-message">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-primary" />
            </div>
            <h4 className="text-2xl font-bold mb-4 text-primary">ยังไม่มีการสร้างคอร์ส</h4>
            <p className="text-lg text-muted-foreground">ใช้ช่องด้านบนเพื่อสร้างคอร์สแรกของคุณ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courseNames.map((name) => {
              const itemCount = allCourses[name]?.length || 0
              return (
                <div key={name} className="course-card group">
                  <Link
                    href={`/course/${encodeURIComponent(name)}`}
                    className="block p-6"
                    onClick={() => handleCourseClick(name)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-blue-600 transition-colors">
                          {name}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Package className="w-4 h-4" />
                          <span>มี {itemCount} รายการในคลัง</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        <span className="font-medium">คลิกเพื่อจัดการคลังสินค้า</span>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            openEditModal(name)
                          }}
                          className="p-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 active:bg-blue-100 transition-all"
                          title="แก้ไขชื่อ"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            deleteCourse(name)
                          }}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-all"
                          title="ลบคอร์ส"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>แก้ไขชื่อคอร์ส</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="text"
                value={editCourseName}
                onChange={(e) => setEditCourseName(e.target.value)}
                placeholder="ชื่อคอร์สใหม่"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="hover:bg-gray-50 active:bg-gray-100"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={saveCourseName}
                  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white"
                >
                  บันทึก
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
