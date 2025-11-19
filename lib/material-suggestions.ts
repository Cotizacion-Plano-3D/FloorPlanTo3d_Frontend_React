/**
 * Sistema de Sugerencias Inteligentes de Materiales
 * Calcula cantidades automáticamente basándose en las medidas extraídas del plano
 */

export interface MedidasExtraidas {
  area_total?: number
  area_paredes?: number
  area_ventanas?: number
  area_puertas?: number
  perimetro_total?: number
  num_paredes?: number
  num_ventanas?: number
  num_puertas?: number
  bounds?: {
    ancho?: number
    alto?: number
  }
}

export interface MaterialSuggestion {
  materialId: string
  cantidad: number
  razon: string
  prioridad: 'alta' | 'media' | 'baja'
}

/**
 * Calcula sugerencias de materiales basándose en las medidas del plano
 */
export function calcularSugerenciasMateriales(
  medidas: MedidasExtraidas,
  materiales: Array<{
    id: string
    nombre: string
    categoria: string
    unidad_medida: string
  }>
): MaterialSuggestion[] {
  const sugerencias: MaterialSuggestion[] = []

  if (!medidas) return sugerencias

  // PISOS - Basado en area_total
  if (medidas.area_total) {
    const materialesPisos = materiales.filter(m => 
      m.categoria.toLowerCase().includes('piso') && m.unidad_medida === 'm2'
    )
    
    materialesPisos.forEach(material => {
      // 10% adicional por cortes y desperdicios
      const cantidad = Math.ceil(medidas.area_total! * 1.10)
      sugerencias.push({
        materialId: material.id,
        cantidad,
        razon: `Piso: ${medidas.area_total!.toFixed(2)} m² + 10% desperdicio = ${cantidad} m²`,
        prioridad: 'alta'
      })
    })

    // Adhesivo para pisos (rinde ~5 m2 por saco)
    const adhesivoPiso = materiales.find(m => 
      m.nombre.toLowerCase().includes('adhesivo') && 
      (m.nombre.toLowerCase().includes('cerámico') || m.nombre.toLowerCase().includes('porcelanato'))
    )
    if (adhesivoPiso && adhesivoPiso.unidad_medida === 'm2') {
      const cantidad = Math.ceil(medidas.area_total * 1.10)
      sugerencias.push({
        materialId: adhesivoPiso.id,
        cantidad,
        razon: `Adhesivo para ${medidas.area_total.toFixed(2)} m² de piso`,
        prioridad: 'alta'
      })
    }

    // Fragüe para pisos
    const frague = materiales.find(m => 
      m.nombre.toLowerCase().includes('fragüe') || m.nombre.toLowerCase().includes('frague')
    )
    if (frague && frague.unidad_medida === 'm2') {
      const cantidad = Math.ceil(medidas.area_total * 0.2)
      sugerencias.push({
        materialId: frague.id,
        cantidad,
        razon: `Fragüe para juntas de ${medidas.area_total.toFixed(2)} m² piso`,
        prioridad: 'media'
      })
    }

    // Rodapié/Guardapolvo (basado en perímetro)
    if (medidas.perimetro_total) {
      const rodapie = materiales.find(m => 
        (m.nombre.toLowerCase().includes('rodapié') || m.nombre.toLowerCase().includes('guardapolvo')) &&
        m.unidad_medida === 'm'
      )
      if (rodapie) {
        // 80% del perímetro (descontando puertas aproximadamente)
        const cantidad = Math.ceil(medidas.perimetro_total * 0.8)
        sugerencias.push({
          materialId: rodapie.id,
          cantidad,
          razon: `Rodapié: ${medidas.perimetro_total.toFixed(2)} m perímetro - 20% puertas`,
          prioridad: 'media'
        })
      }
    }
  }

  // PAREDES - Basado en area_paredes
  if (medidas.area_paredes) {
    // Revestimientos cerámicos para paredes
    const revestimientosParedes = materiales.filter(m => 
      m.categoria.toLowerCase().includes('pared') && 
      m.unidad_medida === 'm2'
    )
    
    revestimientosParedes.forEach(material => {
      // 8% adicional por cortes
      const cantidad = Math.ceil(medidas.area_paredes! * 1.08)
      sugerencias.push({
        materialId: material.id,
        cantidad,
        razon: `Paredes: ${medidas.area_paredes!.toFixed(2)} m² + 8% desperdicio = ${cantidad} m²`,
        prioridad: 'media'
      })
    })

    // Adhesivo para paredes
    const adhesivoPared = materiales.find(m => 
      m.nombre.toLowerCase().includes('adhesivo') && 
      m.categoria.toLowerCase().includes('adhesivo')
    )
    if (adhesivoPared && adhesivoPared.unidad_medida === 'm2') {
      const cantidad = Math.ceil(medidas.area_paredes * 1.08)
      sugerencias.push({
        materialId: adhesivoPared.id,
        cantidad,
        razon: `Adhesivo para ${medidas.area_paredes.toFixed(2)} m² de paredes`,
        prioridad: 'media'
      })
    }
  }

  // PINTURA - Basado en area_paredes menos ventanas y puertas
  if (medidas.area_paredes && medidas.area_ventanas !== undefined && medidas.area_puertas !== undefined) {
    const areaPintable = medidas.area_paredes - medidas.area_ventanas - medidas.area_puertas
    
    if (areaPintable > 0) {
      const pinturas = materiales.filter(m => 
        m.categoria.toLowerCase().includes('pintura') && 
        m.unidad_medida === 'm2'
      )
      
      pinturas.forEach(material => {
        // 5% adicional
        const cantidad = Math.ceil(areaPintable * 1.05)
        sugerencias.push({
          materialId: material.id,
          cantidad,
          razon: `Pintura: ${areaPintable.toFixed(2)} m² (paredes - ventanas - puertas) + 5%`,
          prioridad: 'alta'
        })
      })

      // Imprimante (suele ser el 100% del área a pintar)
      const imprimante = materiales.find(m => 
        m.nombre.toLowerCase().includes('imprimante') || 
        m.nombre.toLowerCase().includes('sellador')
      )
      if (imprimante && imprimante.unidad_medida === 'm2') {
        const cantidad = Math.ceil(areaPintable * 1.05)
        sugerencias.push({
          materialId: imprimante.id,
          cantidad,
          razon: `Imprimante base para ${areaPintable.toFixed(2)} m² pintables`,
          prioridad: 'media'
        })
      }

      // Pasta muro
      const pasta = materiales.find(m => 
        m.nombre.toLowerCase().includes('pasta') && 
        m.nombre.toLowerCase().includes('muro')
      )
      if (pasta && pasta.unidad_medida === 'm2') {
        const cantidad = Math.ceil(areaPintable * 0.8) // No todas las paredes necesitan pasta
        sugerencias.push({
          materialId: pasta.id,
          cantidad,
          razon: `Pasta para emparejar ~80% del área pintable`,
          prioridad: 'baja'
        })
      }
    }
  }

  // PUERTAS - Basado en num_puertas
  if (medidas.num_puertas && medidas.num_puertas > 0) {
    const puertas = materiales.filter(m => 
      m.categoria.toLowerCase().includes('puerta') && 
      m.unidad_medida === 'unidad' &&
      !m.nombre.toLowerCase().includes('marco') &&
      !m.nombre.toLowerCase().includes('cerradura') &&
      !m.nombre.toLowerCase().includes('bisagra')
    )
    
    puertas.forEach(material => {
      sugerencias.push({
        materialId: material.id,
        cantidad: medidas.num_puertas!,
        razon: `${medidas.num_puertas} puertas detectadas`,
        prioridad: 'alta'
      })
    })

    // Marcos de puerta
    const marcos = materiales.filter(m => 
      m.nombre.toLowerCase().includes('marco') && 
      m.categoria.toLowerCase().includes('puerta') &&
      m.unidad_medida === 'unidad'
    )
    marcos.forEach(material => {
      sugerencias.push({
        materialId: material.id,
        cantidad: medidas.num_puertas!,
        razon: `Marco para ${medidas.num_puertas} puertas`,
        prioridad: 'alta'
      })
    })

    // Cerraduras
    const cerraduras = materiales.filter(m => 
      m.nombre.toLowerCase().includes('cerradura') && 
      m.unidad_medida === 'unidad'
    )
    cerraduras.forEach(material => {
      sugerencias.push({
        materialId: material.id,
        cantidad: medidas.num_puertas!,
        razon: `Cerradura para ${medidas.num_puertas} puertas`,
        prioridad: 'alta'
      })
    })

    // Bisagras (juegos)
    const bisagras = materiales.find(m => 
      m.nombre.toLowerCase().includes('bisagra') && 
      m.unidad_medida === 'unidad'
    )
    if (bisagras) {
      sugerencias.push({
        materialId: bisagras.id,
        cantidad: medidas.num_puertas,
        razon: `Juego de bisagras para ${medidas.num_puertas} puertas`,
        prioridad: 'media'
      })
    }
  }

  // VENTANAS - Basado en area_ventanas y num_ventanas
  if (medidas.area_ventanas && medidas.area_ventanas > 0) {
    const ventanas = materiales.filter(m => 
      m.categoria.toLowerCase().includes('ventana') && 
      m.unidad_medida === 'm2'
    )
    
    ventanas.forEach(material => {
      const cantidad = Math.ceil(medidas.area_ventanas! * 1.05)
      sugerencias.push({
        materialId: material.id,
        cantidad,
        razon: `Ventanas: ${medidas.area_ventanas!.toFixed(2)} m² + 5%`,
        prioridad: 'alta'
      })
    })
  }

  if (medidas.num_ventanas && medidas.num_ventanas > 0) {
    // Cortinas/persianas (por unidad de ventana)
    const cortinas = materiales.filter(m => 
      (m.nombre.toLowerCase().includes('cortina') || 
       m.nombre.toLowerCase().includes('persiana')) &&
      m.categoria.toLowerCase().includes('ventana')
    )
    
    cortinas.forEach(material => {
      if (material.unidad_medida === 'unidad' || material.unidad_medida === 'm2') {
        const cantidad = medidas.num_ventanas!
        sugerencias.push({
          materialId: material.id,
          cantidad,
          razon: `${medidas.num_ventanas} ventanas detectadas`,
          prioridad: 'baja'
        })
      }
    })
  }

  // ELÉCTRICOS - Basado en area_total, num_puertas, perimetro
  if (medidas.area_total) {
    // Enchufes (aprox 1 cada 20 m²)
    const enchufes = materiales.find(m => 
      m.nombre.toLowerCase().includes('enchufe') && 
      m.unidad_medida === 'unidad'
    )
    if (enchufes) {
      const cantidad = Math.max(Math.ceil(medidas.area_total / 20), 4)
      sugerencias.push({
        materialId: enchufes.id,
        cantidad,
        razon: `~1 enchufe cada 20 m² (${medidas.area_total.toFixed(2)} m² total)`,
        prioridad: 'media'
      })
    }

    // Lámparas LED (aprox 1 cada 15 m²)
    const lamparas = materiales.filter(m => 
      (m.nombre.toLowerCase().includes('lámpara') || m.nombre.toLowerCase().includes('lampara')) && 
      m.nombre.toLowerCase().includes('led') &&
      m.unidad_medida === 'unidad'
    )
    lamparas.forEach(material => {
      const cantidad = Math.max(Math.ceil(medidas.area_total! / 15), 3)
      sugerencias.push({
        materialId: material.id,
        cantidad,
        razon: `~1 lámpara cada 15 m² (${medidas.area_total.toFixed(2)} m² total)`,
        prioridad: 'media'
      })
    })

    // Interruptores (aproximado por número de puertas + ambientes)
    if (medidas.num_puertas) {
      const interruptores = materiales.filter(m => 
        m.nombre.toLowerCase().includes('interruptor') && 
        m.unidad_medida === 'unidad' &&
        !m.nombre.toLowerCase().includes('termomagnético')
      )
      interruptores.forEach(material => {
        const cantidad = Math.ceil(medidas.num_puertas! * 0.8) + 2
        sugerencias.push({
          materialId: material.id,
          cantidad,
          razon: `Interruptores estimados para ${medidas.num_puertas} ambientes`,
          prioridad: 'baja'
        })
      })
    }
  }

  // TECHO - Si se requiere cielo falso (basado en area_total)
  if (medidas.area_total) {
    const cielosFalsos = materiales.filter(m => 
      m.categoria.toLowerCase().includes('techo') && 
      m.nombre.toLowerCase().includes('cielo') &&
      m.unidad_medida === 'm2'
    )
    
    cielosFalsos.forEach(material => {
      const cantidad = Math.ceil(medidas.area_total!)
      sugerencias.push({
        materialId: material.id,
        cantidad,
        razon: `Cielo falso opcional: ${medidas.area_total!.toFixed(2)} m²`,
        prioridad: 'baja'
      })
    })

    // Molduras de techo (basado en perímetro)
    if (medidas.perimetro_total) {
      const molduras = materiales.find(m => 
        m.nombre.toLowerCase().includes('moldura') && 
        m.categoria.toLowerCase().includes('techo') &&
        m.unidad_medida === 'm'
      )
      if (molduras) {
        const cantidad = Math.ceil(medidas.perimetro_total)
        sugerencias.push({
          materialId: molduras.id,
          cantidad,
          razon: `Moldura decorativa: ${medidas.perimetro_total.toFixed(2)} m perímetro`,
          prioridad: 'baja'
        })
      }
    }
  }

  // CARPINTERÍA - Estimaciones básicas
  if (medidas.bounds?.ancho) {
    // Muebles de cocina (estimación: 30% del ancho del plano)
    const mueblesCocina = materiales.filter(m => 
      m.nombre.toLowerCase().includes('mueble') && 
      m.nombre.toLowerCase().includes('cocina') &&
      m.unidad_medida === 'm'
    )
    
    mueblesCocina.forEach(material => {
      const cantidad = Math.ceil(medidas.bounds!.ancho! * 0.3)
      sugerencias.push({
        materialId: material.id,
        cantidad,
        razon: `Estimación muebles cocina: ~30% del ancho (${cantidad} m lineales)`,
        prioridad: 'baja'
      })
    })

    // Encimera cocina
    const encimera = materiales.find(m => 
      m.nombre.toLowerCase().includes('encimera') && 
      m.unidad_medida === 'm'
    )
    if (encimera) {
      const cantidad = Math.ceil(medidas.bounds.ancho * 0.3)
      sugerencias.push({
        materialId: encimera.id,
        cantidad,
        razon: `Encimera cocina estimada: ${cantidad} m lineales`,
        prioridad: 'baja'
      })
    }
  }

  return sugerencias
}

/**
 * Agrupa las sugerencias por categoría de material
 */
export function agruparSugerenciasPorCategoria(
  sugerencias: MaterialSuggestion[],
  materiales: Array<{
    id: string
    nombre: string
    categoria: string
  }>
): Record<string, MaterialSuggestion[]> {
  const grupos: Record<string, MaterialSuggestion[]> = {}

  sugerencias.forEach(sugerencia => {
    const material = materiales.find(m => m.id === sugerencia.materialId)
    if (material) {
      const categoria = material.categoria
      if (!grupos[categoria]) {
        grupos[categoria] = []
      }
      grupos[categoria].push(sugerencia)
    }
  })

  return grupos
}

/**
 * Filtra sugerencias por prioridad
 */
export function filtrarSugerenciasPorPrioridad(
  sugerencias: MaterialSuggestion[],
  prioridades: Array<'alta' | 'media' | 'baja'>
): MaterialSuggestion[] {
  return sugerencias.filter(s => prioridades.includes(s.prioridad))
}

