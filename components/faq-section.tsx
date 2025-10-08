"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqData = [
  {
    question: "¿Qué es FloorPlan3D y para quién está diseñado?",
    answer:
      "FloorPlan3D es una plataforma de IA especializada en convertir planos arquitectónicos 2D en modelos 3D detallados. Está diseñada para arquitectos, diseñadores de interiores, constructores y estudiantes de arquitectura que buscan acelerar su flujo de trabajo de diseño.",
  },
  {
    question: "¿Cómo funciona el análisis inteligente de planos?",
    answer:
      "Nuestra IA analiza tus planos arquitectónicos en tiempo real, detectando errores de diseño, optimizando espacios, sugiriendo mejoras estructurales y asegurando el cumplimiento de normativas. Aprende de tus patrones de diseño y se adapta a tus estándares profesionales.",
  },
  {
    question: "¿Puedo integrar FloorPlan3D con mis herramientas CAD existentes?",
    answer:
      "¡Sí! FloorPlan3D ofrece integración directa con herramientas profesionales como AutoCAD, Revit, SketchUp, ArchiCAD y más. Nuestra conectividad cloud te permite gestionar y procesar modelos complejos sin límites de hardware local.",
  },
  {
    question: "¿Qué incluye el plan gratuito?",
    answer:
      "El plan gratuito incluye análisis básico de planos, integración con herramientas CAD estándar, procesamiento en la nube limitado, hasta 2 renders simultáneos y exportación a formatos básicos. Perfecto para estudiantes y profesionales independientes.",
  },
  {
    question: "¿Cómo funciona el renderizado paralelo avanzado?",
    answer:
      "Nuestro sistema de renderizado paralelo procesa múltiples vistas y renders simultáneamente, generando modelos 3D complejos mucho más rápido que los métodos tradicionales. Puedes crear vistas panorámicas, renders fotorrealistas y modelos técnicos al mismo tiempo.",
  },
  {
    question: "¿Mis planos están seguros con FloorPlan3D?",
    answer:
      "Absolutamente. Utilizamos medidas de seguridad de nivel empresarial incluyendo encriptación end-to-end, transmisión segura de datos y cumplimiento con estándares de la industria. Tus planos nunca salen de tu entorno seguro sin tu permiso explícito, y ofrecemos opciones de despliegue local para clientes empresariales.",
  },
]

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onToggle()
  }
  return (
    <div
      className={`w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out cursor-pointer`}
      onClick={handleClick}
    >
      <div className="w-full px-5 py-[18px] pr-4 flex justify-between items-center gap-5 text-left transition-all duration-300 ease-out">
        <div className="flex-1 text-foreground text-base font-medium leading-6 break-words">{question}</div>
        <div className="flex justify-center items-center">
          <ChevronDown
            className={`w-6 h-6 text-muted-foreground-dark transition-all duration-500 ease-out ${isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"}`}
          />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
        style={{
          transitionProperty: "max-height, opacity, padding",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`px-5 transition-all duration-500 ease-out ${isOpen ? "pb-[18px] pt-2 translate-y-0" : "pb-0 pt-0 -translate-y-2"}`}
        >
          <div className="text-foreground/80 text-sm font-normal leading-6 break-words">{answer}</div>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())
  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }
  return (
    <section className="w-full pt-[66px] pb-20 md:pb-40 px-5 relative flex flex-col justify-center items-center">
      <div className="w-[300px] h-[500px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[100px] z-0" />
      <div className="self-stretch pt-8 pb-8 md:pt-14 md:pb-14 flex flex-col justify-center items-center gap-2 relative z-10">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="w-full max-w-[435px] text-center text-foreground text-4xl font-semibold leading-10 break-words">
            Preguntas Frecuentes
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-[18.20px] break-words">
            Todo lo que necesitas saber sobre FloorPlan3D y cómo puede transformar tu flujo de trabajo arquitectónico
          </p>
        </div>
      </div>
      <div className="w-full max-w-[600px] pt-0.5 pb-10 flex flex-col justify-start items-start gap-4 relative z-10">
        {faqData.map((faq, index) => (
          <FAQItem key={index} {...faq} isOpen={openItems.has(index)} onToggle={() => toggleItem(index)} />
        ))}
      </div>
    </section>
  )
}
