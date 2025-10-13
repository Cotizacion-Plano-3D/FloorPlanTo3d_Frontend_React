"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, Download } from "lucide-react"
import Link from "next/link"
import { FloorPlanPreview } from "@/components/floor-plan-preview"
import Image from "next/image"

interface FloorPlan {
  id: string
  url: string
  name: string
}

interface FloorPlanGalleryProps {
  plans: FloorPlan[]
}

export function FloorPlanGallery({ plans }: FloorPlanGalleryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className="group overflow-hidden bg-card border-border hover:shadow-xl transition-all duration-300"
          onMouseEnter={() => setHoveredId(plan.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            {hoveredId === plan.id ? (
              <FloorPlanPreview imageUrl={plan.url} />
            ) : (
              <Image src={plan.url || "/placeholder.svg"} alt={plan.name} fill className="object-cover" />
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Quick Actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Link href={`/viewer/${plan.id}`}>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver en 3D
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-card-foreground truncate">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">Plano arquitectónico</p>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/viewer/${plan.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
              </Link>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive bg-transparent">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

