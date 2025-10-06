"use client"

import type React from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { AuthModal } from "@/components/auth/AuthModal"

export function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const navItems = [
    { name: "Características", href: "#features-section" },
    { name: "Precios", href: "#pricing-section" },
    { name: "Testimonios", href: "#testimonials-section" },
  ]

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetId = href.substring(1) // Remove '#' from href
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <>
      <header className="w-full py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-foreground text-xl font-semibold">FloorPlan3D</span>
            </div>
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleScroll(e, item.href)}
                  className="text-[#888888] hover:text-foreground px-4 py-2 rounded-full font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" className="px-6 py-2 rounded-full font-medium">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="px-6 py-2 rounded-full font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-full font-medium shadow-sm"
              >
                Iniciar Sesión
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-7 w-7" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="bg-background border-t border-border text-foreground">
                <SheetHeader>
                  <SheetTitle className="text-left text-xl font-semibold text-foreground">Navegación</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleScroll(e, item.href)}
                      className="text-[#888888] hover:text-foreground justify-start text-lg py-2"
                    >
                      {item.name}
                    </Link>
                  ))}
                  {isAuthenticated ? (
                    <>
                      <Link href="/dashboard" className="w-full mt-4">
                        <Button variant="outline" className="w-full">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        onClick={handleLogout}
                        className="w-full"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => setShowAuthModal(true)}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-full font-medium shadow-sm w-full mt-4"
                    >
                      Iniciar Sesión
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}
