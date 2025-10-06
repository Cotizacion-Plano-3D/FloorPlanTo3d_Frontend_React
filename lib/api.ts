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
  ApiError 
} from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    // Cargar token del localStorage si existe
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: RegisterRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<void> {
    await this.request('/logout', {
      method: 'POST',
    })
    this.setToken(null)
  }

  async getDashboard(): Promise<DashboardResponse> {
    return this.request<DashboardResponse>('/users/dashboard')
  }

  // User endpoints
  async getUsers(): Promise<Usuario[]> {
    return this.request<Usuario[]>('/users')
  }

  async getUser(id: number): Promise<Usuario> {
    return this.request<Usuario>(`/users/${id}`)
  }

  async updateUser(id: number, userData: Partial<Usuario>): Promise<Usuario> {
    return this.request<Usuario>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: number): Promise<void> {
    await this.request(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  // Membresia endpoints
  async getMembresias(): Promise<Membresia[]> {
    return this.request<Membresia[]>('/membresias')
  }

  async getMembresia(id: number): Promise<Membresia> {
    return this.request<Membresia>(`/membresias/${id}`)
  }

  async createMembresia(membresia: Omit<Membresia, 'id'>): Promise<Membresia> {
    return this.request<Membresia>('/membresias', {
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
    return this.request<Suscripcion[]>('/suscripciones')
  }

  async getSuscripcion(id: number): Promise<Suscripcion> {
    return this.request<Suscripcion>(`/suscripciones/${id}`)
  }

  async createSuscripcion(suscripcion: Omit<Suscripcion, 'id'>): Promise<Suscripcion> {
    return this.request<Suscripcion>('/suscripciones', {
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

  // Pago endpoints
  async getPagos(): Promise<Pago[]> {
    return this.request<Pago[]>('/pagos')
  }

  async getPago(id: number): Promise<Pago> {
    return this.request<Pago>(`/pagos/${id}`)
  }

  async createPago(pago: Omit<Pago, 'id'>): Promise<Pago> {
    return this.request<Pago>('/pagos', {
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
}

export const apiClient = new ApiClient()
