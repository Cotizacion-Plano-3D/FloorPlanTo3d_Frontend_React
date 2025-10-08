"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useMembresias } from "@/hooks/useApi"
import { AuthModal } from "@/components/auth/AuthModal"
import { apiClient } from "@/lib/api"

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)
  const { isAuthenticated, hasActiveSubscription, token } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const { membresias, isLoading, error } = useMembresias()

  const handlePlanSelect = async (membresiaId: number) => {
    // Limpiar errores previos
    setPaymentError(null)
    
    // Verificar autenticación
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    
    // Verificar si ya tiene suscripción activa
    if (hasActiveSubscription) {
      window.location.href = '/dashboard'
      return
    }
    
    // Verificar que tenemos token
    if (!token) {
      setPaymentError('Error de autenticación. Por favor, inicia sesión nuevamente.')
      return
    }
    
    try {
      setIsProcessingPayment(true)
      
      // Llamar al endpoint de Stripe
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          membresia_id: membresiaId
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al crear la sesión de pago')
      }
      
      const data = await response.json()
      
      // Redirigir a Stripe
      window.location.href = data.url
      
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setPaymentError(error instanceof Error ? error.message : 'Error al procesar el pago')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Función para mapear membresías del backend al formato del componente
  const mapMembresiaToPlan = (membresia: any, index: number) => {
    const isPopular = index === 1 // El segundo plan es popular
    
    // Determinar si es plan mensual o anual basado en la duración
    const isMonthly = membresia.duracion === 30
    const isAnnual = membresia.duracion === 365
    
    // Calcular precios según el tipo
    let monthlyPrice, annualPrice
    if (isMonthly) {
      monthlyPrice = `$${membresia.precio}`
      // Para planes mensuales, el precio anual es con descuento
      annualPrice = `$${Math.round(membresia.precio * 10 * 0.8)}` // 10 meses con 20% descuento
    } else if (isAnnual) {
      // Para planes anuales, mostrar el precio mensual equivalente
      monthlyPrice = `$${Math.round(membresia.precio / 12)}`
      annualPrice = `$${membresia.precio}`
    }
    
    // Dividir la descripción en features
    const features = membresia.descripcion 
      ? membresia.descripcion.split('\n').filter((f: string) => f.trim())
      : ['Características incluidas']
    
    return {
      id: membresia.id,
      membresiaId: membresia.id, // ID para usar en la función handlePlanSelect
      name: membresia.nombre,
      monthlyPrice,
      annualPrice,
      description: `Plan ${membresia.nombre.toLowerCase()} con ${membresia.duracion} días de duración.`,
      features,
      buttonText: index === 0 ? "Comenzar" : index === 1 ? "Únete ahora" : "Hablar con Ventas",
      buttonClass: index === 0 
        ? "bg-zinc-300 shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] outline outline-0.5 outline-[#1e29391f] outline-offset-[-0.5px] text-gray-800 text-shadow-[0px_1px_1px_rgba(16,24,40,0.08)] hover:bg-zinc-400"
        : index === 1
        ? "bg-primary-foreground shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] text-primary text-shadow-[0px_1px_1px_rgba(16,24,40,0.08)] hover:bg-primary-foreground/90"
        : "bg-secondary shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] text-secondary-foreground text-shadow-[0px_1px_1px_rgba(16,24,40,0.08)] hover:bg-secondary/90",
      popular: isPopular,
      isMonthly,
      isAnnual,
    }
  }

  // Filtrar y generar planes según el toggle
  const getFilteredPlans = () => {
    if (!membresias) return []
    
    // Filtrar por duración según el toggle
    const filteredMembresias = membresias.filter(membresia => 
      isAnnual ? membresia.duracion === 365 : membresia.duracion === 30
    )
    
    return filteredMembresias.map(mapMembresiaToPlan)
  }

  // Generar planes filtrados desde los datos del backend
  const pricingPlans = getFilteredPlans()

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <section className="w-full px-5 overflow-hidden flex flex-col justify-start items-center my-0 py-8 md:py-14">
        <div className="flex flex-col justify-center items-center gap-4 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando planes de precios...</p>
        </div>
      </section>
    )
  }

  // Mostrar estado de error
  if (error) {
    return (
      <section className="w-full px-5 overflow-hidden flex flex-col justify-start items-center my-0 py-8 md:py-14">
        <div className="flex flex-col justify-center items-center gap-4 py-20">
          <p className="text-destructive">Error al cargar los planes: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </section>
    )
  }

  // Mostrar mensaje si no hay planes
  if (!pricingPlans || pricingPlans.length === 0) {
    return (
      <section className="w-full px-5 overflow-hidden flex flex-col justify-start items-center my-0 py-8 md:py-14">
        <div className="flex flex-col justify-center items-center gap-4 py-20">
          <p className="text-muted-foreground">No hay planes disponibles en este momento.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full px-5 overflow-hidden flex flex-col justify-start items-center my-0 py-8 md:py-14">
      <div className="self-stretch relative flex flex-col justify-center items-center gap-2 py-0">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="text-center text-foreground text-4xl md:text-5xl font-semibold leading-tight md:leading-[40px]">
            Precios diseñados para arquitectos y diseñadores
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-tight">
            Elige un plan que se adapte a tu práctica profesional, desde estudiantes hasta <br /> estudios de arquitectura
            y grandes firmas de diseño.
          </p>
        </div>
        <div className="pt-4">
          <div className="p-0.5 bg-muted rounded-lg outline outline-1 outline-[#0307120a] outline-offset-[-1px] flex justify-start items-center gap-1 md:mt-0">
            <button
              onClick={() => setIsAnnual(true)}
              className={`pl-2 pr-1 py-1 flex justify-start items-start gap-2 rounded-md ${isAnnual ? "bg-accent shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.08)]" : ""}`}
            >
              <span
                className={`text-center text-sm font-medium leading-tight ${isAnnual ? "text-accent-foreground" : "text-zinc-400"}`}
              >
                Anualmente
              </span>
            </button>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-2 py-1 flex justify-start items-start rounded-md ${!isAnnual ? "bg-accent shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.08)]" : ""}`}
            >
              <span
                className={`text-center text-sm font-medium leading-tight ${!isAnnual ? "text-accent-foreground" : "text-zinc-400"}`}
              >
                Mensualmente
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="self-stretch px-5 flex flex-col md:flex-row justify-start items-start gap-4 md:gap-6 mt-6 max-w-[1100px] mx-auto">
        {pricingPlans.map((plan) => (
          <div
            key={plan.name}
            className={`flex-1 p-4 overflow-hidden rounded-xl flex flex-col justify-start items-start gap-6 ${plan.popular ? "bg-primary shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.10)]" : "bg-gradient-to-b from-gray-50/5 to-gray-50/0"}`}
            style={plan.popular ? {} : { outline: "1px solid hsl(var(--border))", outlineOffset: "-1px" }}
          >
            <div className="self-stretch flex flex-col justify-start items-start gap-6">
              <div className="self-stretch flex flex-col justify-start items-start gap-8">
                <div
                  className={`w-full h-5 text-sm font-medium leading-tight ${plan.popular ? "text-primary-foreground" : "text-zinc-200"}`}
                >
                  {plan.name}
                  {plan.popular && (
                    <div className="ml-2 px-2 overflow-hidden rounded-full justify-center items-center gap-2.5 inline-flex mt-0 py-0.5 bg-gradient-to-b from-primary-light/50 to-primary-light bg-white">
                      <div className="text-center text-primary-foreground text-xs font-normal leading-tight break-words">
                        Popular
                      </div>
                    </div>
                  )}
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                  <div className="flex justify-start items-center gap-1.5">
                    <div
                      className={`relative h-10 flex items-center text-3xl font-medium leading-10 ${plan.popular ? "text-primary-foreground" : "text-zinc-50"}`}
                    >
                      <span className="invisible">{isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: isAnnual ? 1 : 0,
                          transform: `scale(${isAnnual ? 1 : 0.8})`,
                          filter: `blur(${isAnnual ? 0 : 4}px)`,
                        }}
                        aria-hidden={!isAnnual}
                      >
                        {plan.annualPrice}
                      </span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: !isAnnual ? 1 : 0,
                          transform: `scale(${!isAnnual ? 1 : 0.8})`,
                          filter: `blur(${!isAnnual ? 0 : 4}px)`,
                        }}
                        aria-hidden={isAnnual}
                      >
                        {plan.monthlyPrice}
                      </span>
                    </div>
                    <div
                      className={`text-center text-sm font-medium leading-tight ${plan.popular ? "text-primary-foreground/70" : "text-zinc-400"}`}
                    >
                      /month
                    </div>
                  </div>
                  <div
                    className={`self-stretch text-sm font-medium leading-tight ${plan.popular ? "text-primary-foreground/70" : "text-zinc-400"}`}
                  >
                    {plan.description}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handlePlanSelect(plan.membresiaId)}
                disabled={isProcessingPayment}
                className={`self-stretch px-5 py-2 rounded-[40px] flex justify-center items-center ${plan.buttonClass} ${isProcessingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="px-1.5 flex justify-center items-center gap-2">
                  {isProcessingPayment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  <span
                    className={`text-center text-sm font-medium leading-tight ${plan.name === "Gratis" ? "text-gray-800" : plan.name === "Pro" ? "text-primary" : "text-zinc-950"}`}
                  >
                    {isProcessingPayment ? "Procesando..." : plan.buttonText}
                  </span>
                </div>
              </Button>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <div
                className={`self-stretch text-sm font-medium leading-tight ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}
              >
                {plan.name === "Free" ? "Get Started today:" : "Everything in Free +"}
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                {plan.features.map((feature: string) => (
                  <div key={feature} className="self-stretch flex justify-start items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <Check
                        className={`w-full h-full ${plan.popular ? "text-primary-foreground" : "text-muted-foreground"}`}
                        strokeWidth={2}
                      />
                    </div>
                    <div
                      className={`leading-tight font-normal text-sm text-left ${plan.popular ? "text-primary-foreground" : "text-muted-foreground"}`}
                    >
                      {feature}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Mostrar errores de pago */}
      {paymentError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{paymentError}</p>
          <button 
            onClick={() => setPaymentError(null)}
            className="mt-2 text-red-500 text-xs underline hover:text-red-700"
          >
            Cerrar
          </button>
        </div>
      )}
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </section>
  )
}

