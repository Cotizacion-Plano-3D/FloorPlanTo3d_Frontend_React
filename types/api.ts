// Types basados en los modelos del backend FastAPI
export interface Usuario {
  id: number
  nombre: string
  correo: string
  contrasena: string
  fecha_creacion: string
  suscripciones?: Suscripcion[]
}

export interface Membresia {
  id: number
  nombre: string
  precio: number
  duracion: number // en días
  descripcion?: string
  stripe_price_id?: string
  suscripciones?: Suscripcion[]
}

export interface Suscripcion {
  id: number
  usuario_id: number
  membresia_id: number
  fecha_inicio: string
  fecha_fin: string
  estado: 'activa' | 'expirada' | 'cancelada'
  usuario?: Usuario
  membresia?: Membresia
}

export interface Pago {
  id: number
  suscripcion_id: number
  monto: number
  fecha_pago: string
  metodo_pago: string
  estado: 'pendiente' | 'completado' | 'fallido'
  stripe_payment_intent_id?: string
}

// Request/Response types
export interface LoginRequest {
  correo: string
  contrasena: string
}

export interface RegisterRequest {
  nombre: string
  correo: string
  contrasena: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface DashboardResponse {
  message: string
}

// Error types
export interface ApiError {
  detail: string
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// Stripe types
export interface StripeCheckoutRequest {
  membresia_id: number
  success_url: string
  cancel_url: string
}

export interface StripeCheckoutResponse {
  checkout_url: string
}
