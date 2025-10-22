import { 
  Usuario, 
  Membresia, 
  Suscripcion, 
  Pago,
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  DashboardResponse,
  StripeCheckoutRequest,
  StripeCheckoutResponse,
  Plano,
  PlanoCreate,
  PlanoUpdate,
  PlanoListResponse,
  Modelo3DDataResponse,
  ApiError 
} from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseURL: string
  public token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    // NO cargar token automáticamente - se manejará desde AuthContext
  }

  setToken(token: string | null) {
    this.token = token
    
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  // Método para inicializar el token desde localStorage (solo desde AuthContext)
  initializeFromStorage() {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('auth_token')
      if (savedToken) {
        this.token = savedToken
        return savedToken
      }
    }
    return null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // No establecer Content-Type si el body es FormData (el navegador lo hace automáticamente)
    const isFormData = options.body instanceof FormData
    
    const headers: HeadersInit = {
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(options.headers as Record<string, string>),
    }
    
    // Solo añadir Content-Type si NO es FormData
    if (!isFormData) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json'
    }
    
    const config: RequestInit = {
      headers,
      ...options,
    }


    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData: ApiError = await response.json()
        console.error('❌ API Error:', {
          status: response.status,
          error: errorData.detail
        })
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('❌ API request failed:', error)
      throw error
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: RegisterRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<void> {
    // No hay endpoint de logout en el backend, solo limpiar token local
    this.setToken(null)
  }

  async getDashboard(): Promise<DashboardResponse> {
    return this.request<DashboardResponse>('/dashboard/')
  }

  // User endpoints
  async getUsers(): Promise<Usuario[]> {
    return this.request<Usuario[]>('/users/')
  }

  async getCurrentUser(): Promise<Usuario> {
    return this.request<Usuario>('/users/me')
  }

  async deleteUser(id: number): Promise<{ detail: string }> {
    return this.request<{ detail: string }>(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  // Nota: Los endpoints de get/update de usuarios específicos no existen en el backend
  // async getUser(id: number): Promise<Usuario> {
  //   return this.request<Usuario>(`/users/${id}`)
  // }

  // async updateUser(id: number, userData: Partial<Usuario>): Promise<Usuario> {
  //   return this.request<Usuario>(`/users/${id}`, {
  //     method: 'PUT',
  //     body: JSON.stringify(userData),
  //   })
  // }

  // Membresia endpoints
  async getMembresias(): Promise<Membresia[]> {
    return this.request<Membresia[]>('/membresias/')
  }

  async getMembresia(id: number): Promise<Membresia> {
    return this.request<Membresia>(`/membresias/${id}`)
  }

  async createMembresia(membresia: Omit<Membresia, 'id'>): Promise<Membresia> {
    return this.request<Membresia>('/membresias/', {
      method: 'POST',
      body: JSON.stringify(membresia),
    })
  }

  async updateMembresia(id: number, membresia: Partial<Membresia>): Promise<Membresia> {
    return this.request<Membresia>(`/membresias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(membresia),
    })
  }

  async deleteMembresia(id: number): Promise<void> {
    await this.request(`/membresias/${id}`, {
      method: 'DELETE',
    })
  }

  // Suscripcion endpoints
  async getSuscripciones(): Promise<Suscripcion[]> {
    return this.request<Suscripcion[]>('/suscripciones/')
  }

  async getSuscripcion(id: number): Promise<Suscripcion> {
    return this.request<Suscripcion>(`/suscripciones/${id}`)
  }

  async createSuscripcion(suscripcion: Omit<Suscripcion, 'id'>): Promise<Suscripcion> {
    return this.request<Suscripcion>('/suscripciones/', {
      method: 'POST',
      body: JSON.stringify(suscripcion),
    })
  }

  async updateSuscripcion(id: number, suscripcion: Partial<Suscripcion>): Promise<Suscripcion> {
    return this.request<Suscripcion>(`/suscripciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(suscripcion),
    })
  }

  async deleteSuscripcion(id: number): Promise<void> {
    await this.request(`/suscripciones/${id}`, {
      method: 'DELETE',
    })
  }

  async checkActiveSubscription(userId: number): Promise<boolean> {
    const response = await this.request<{
      usuario_id: number;
      tiene_suscripcion_activa: boolean;
      mensaje: string;
    }>(`/suscripciones/activa/${userId}`)
    return response.tiene_suscripcion_activa
  }

  // Pago endpoints
  async getPagos(): Promise<Pago[]> {
    return this.request<Pago[]>('/pagos/')
  }

  async getPago(id: number): Promise<Pago> {
    return this.request<Pago>(`/pagos/${id}`)
  }

  async createPago(pago: Omit<Pago, 'id'>): Promise<Pago> {
    return this.request<Pago>('/pagos/', {
      method: 'POST',
      body: JSON.stringify(pago),
    })
  }

  // Stripe endpoints
  async createStripeCheckout(checkoutData: StripeCheckoutRequest): Promise<StripeCheckoutResponse> {
    return this.request<StripeCheckoutResponse>('/stripe/create-checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    })
  }

  async createMembresiaStripe(membresiaData: Omit<Membresia, 'id'>): Promise<Membresia> {
    return this.request<Membresia>('/stripe/create-membresia', {
      method: 'POST',
      body: JSON.stringify(membresiaData),
    })
  }

  // Plano endpoints
  async createPlano(formData: FormData): Promise<Plano> {
    console.log('🔑 Token actual:', this.token ? 'Presente' : 'Ausente')
    console.log('📤 Enviando FormData al backend...')
    return this.request<Plano>('/planos/', {
      method: 'POST',
      body: formData,
    })
  }

  async getPlanos(skip: number = 0, limit: number = 100): Promise<PlanoListResponse> {
    return this.request<PlanoListResponse>(`/planos/?skip=${skip}&limit=${limit}`)
  }

  async getPlano(id: number): Promise<Plano> {
    return this.request<Plano>(`/planos/${id}`)
  }

  async updatePlano(id: number, planoData: PlanoUpdate): Promise<Plano> {
    return this.request<Plano>(`/planos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planoData),
    })
  }

  async deletePlano(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/planos/${id}`, {
      method: 'DELETE',
    })
  }

  async convertirPlanoA3D(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/planos/${id}/convertir`, {
      method: 'POST',
    })
  }

  async getModelo3DData(id: number): Promise<Modelo3DDataResponse> {
    return this.request<Modelo3DDataResponse>(`/planos/${id}/modelo3d`)
  }

  async render3DFromCache(id: number): Promise<any> {
    return this.request<any>(`/planos/${id}/render-3d`)
  }
}

export const apiClient = new ApiClient()
