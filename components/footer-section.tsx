"use client"

import { Twitter, Github, Linkedin } from "lucide-react"

export function FooterSection() {
  return (
    <footer className="w-full max-w-[1320px] mx-auto px-5 flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0 py-10 md:py-[70px]">
      {/* Left Section: Logo, Description, Social Links */}
      <div className="flex flex-col justify-start items-start gap-8 p-4 md:p-8">
        <div className="flex gap-3 items-stretch justify-center">
          <div className="text-center text-foreground text-xl font-semibold leading-4">FloorPlan3D</div>
        </div>
        <p className="text-foreground/90 text-sm font-medium leading-[18px] text-left">Planos Arquitectónicos Simplificados</p>
        <div className="flex justify-start items-start gap-3">
          <a href="#" aria-label="Twitter" className="w-4 h-4 flex items-center justify-center">
            <Twitter className="w-full h-full text-muted-foreground" />
          </a>
          <a href="#" aria-label="GitHub" className="w-4 h-4 flex items-center justify-center">
            <Github className="w-full h-full text-muted-foreground" />
          </a>
          <a href="#" aria-label="LinkedIn" className="w-4 h-4 flex items-center justify-center">
            <Linkedin className="w-full h-full text-muted-foreground" />
          </a>
        </div>
      </div>
      {/* Right Section: Product, Company, Resources */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 p-4 md:p-8 w-full md:w-auto">
        <div className="flex flex-col justify-start items-start gap-3">
          <h3 className="text-muted-foreground text-sm font-medium leading-5">Producto</h3>
          <div className="flex flex-col justify-end items-start gap-2">
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Características
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Precios
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Integraciones CAD
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Vista Previa 3D
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Renderizado Paralelo
            </a>
          </div>
        </div>
        <div className="flex flex-col justify-start items-start gap-3">
          <h3 className="text-muted-foreground text-sm font-medium leading-5">Empresa</h3>
          <div className="flex flex-col justify-center items-start gap-2">
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Sobre nosotros
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Nuestro equipo
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Carreras
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Marca
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Contacto
            </a>
          </div>
        </div>
        <div className="flex flex-col justify-start items-start gap-3">
          <h3 className="text-muted-foreground text-sm font-medium leading-5">Recursos</h3>
          <div className="flex flex-col justify-center items-start gap-2">
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Términos de uso
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Referencia API
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Documentación
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Comunidad
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Soporte
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
