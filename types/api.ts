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

// Success response wrapper from FastAPI
export interface SuccessResponse<T = any> {
  message: string
  data: T
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

// Plano types
export interface Plano {
  id: number
  usuario_id: number
  nombre: string
  url?: string
  formato: string
  tipo_plano?: string
  descripcion?: string
  medidas_extraidas?: Record<string, any>
  estado: 'subido' | 'procesando' | 'completado' | 'error'
  fecha_subida: string
  fecha_actualizacion: string
  modelo3d?: Modelo3D
}

export interface Modelo3D {
  id: number
  plano_id: number
  datos_json: Record<string, any>
  estado_renderizado: string
  fecha_generacion: string
  fecha_actualizacion: string
}

export interface PlanoCreate {
  nombre: string
  formato?: string
  tipo_plano?: string
  descripcion?: string
  medidas_extraidas?: Record<string, any>
}

export interface PlanoUpdate {
  nombre?: string
  tipo_plano?: string
  descripcion?: string
  medidas_extraidas?: Record<string, any>
}

export interface PlanoListResponse {
  planos: Plano[]
  total: number
  pagina: number
  por_pagina: number
  total_paginas: number
}

export interface Modelo3DDataResponse {
  datos_json: Record<string, any>
}

// Categoria types
export interface Categoria {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  imagen_url?: string
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface CategoriaCreate {
  codigo: string
  nombre: string
  descripcion?: string
  imagen_url?: string
}

export interface CategoriaResponse {
  categorias: Categoria[]
  total: number
}

// Material types
export interface Material {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  precio_base: number
  unidad_medida: string
  imagen_url?: string
  categoria_id: number
  categoria?: Categoria
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface MaterialCreate {
  codigo: string
  nombre: string
  descripcion?: string
  precio_base: number
  unidad_medida: string
  imagen_url?: string
  categoria_id: number
}

export interface MaterialUpdate {
  nombre?: string
  descripcion?: string
  precio_base?: number
  unidad_medida?: string
  imagen_url?: string
  categoria_id?: number
}

export interface MaterialResponse {
  materiales: Material[]
  total: number
  skip: number
  limit: number
}

// MaterialModelo3D types
export interface MaterialModelo3D {
  id: number
  modelo3d_id: number
  material_id: number
  cantidad: number
  unidad_medida: string
  precio_unitario: number
  subtotal: number
  material?: Material
}

export interface MaterialModelo3DCreate {
  modelo3d_id: number
  material_id: number
  cantidad: number
  unidad_medida: string
  precio_unitario: number
}

export interface MaterialModelo3DUpdate {
  cantidad?: number
  precio_unitario?: number
}

export interface MaterialModelo3DResponse {
  modelo3d_id: number
  total_materiales: number
  costo_total: number
  materiales: MaterialModelo3D[]
}

// Cotización types
export interface MaterialCotizacion {
  material_id: number
  nombre: string
  categoria: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface CotizacionCreate {
  plano_id: number
  cliente_nombre: string
  cliente_email: string
  cliente_telefono?: string
  descripcion?: string
  materiales: MaterialCotizacion[]
  subtotal: number
  iva: number
  total: number
}

export interface Cotizacion {
  id: number
  plano_id: number
  usuario_id: number
  cliente_nombre: string
  cliente_email: string
  cliente_telefono?: string
  descripcion?: string
  materiales: MaterialCotizacion[]
  subtotal: number
  iva: number
  total: number
  fecha_creacion: string
  fecha_actualizacion: string
}