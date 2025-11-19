/**
 * Utilidades para exportar cotizaciones a PDF y Excel
 */

import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

interface MedidasExtraidas {
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

interface MaterialCotizacion {
  nombre: string
  categoria: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface DatosCotizacion {
  planoNombre: string
  clienteNombre: string
  clienteEmail: string
  descripcion?: string
  medidas: MedidasExtraidas | null
  materiales: MaterialCotizacion[]
  subtotal: number
  iva: number
  total: number
}

/**
 * Exporta la cotización a PDF
 */
export async function exportarCotizacionPDF(datos: DatosCotizacion): Promise<void> {
  const doc = new jsPDF()
  
  let yPosition = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginLeft = 20
  const marginRight = 20
  const contentWidth = pageWidth - marginLeft - marginRight
  
  // Título
  doc.setFontSize(20)
  doc.setTextColor(0, 102, 204)
  doc.text('COTIZACIÓN DE PROYECTO', marginLeft, yPosition)
  yPosition += 15
  
  // Información del Plano
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(`Plano: ${datos.planoNombre}`, marginLeft, yPosition)
  yPosition += 7
  
  // Información del Cliente
  doc.setFontSize(10)
  doc.text(`Cliente: ${datos.clienteNombre}`, marginLeft, yPosition)
  yPosition += 6
  doc.text(`Email: ${datos.clienteEmail}`, marginLeft, yPosition)
  yPosition += 6
  
  if (datos.descripcion) {
    doc.text(`Descripción: ${datos.descripcion}`, marginLeft, yPosition)
    yPosition += 6
  }
  
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, marginLeft, yPosition)
  yPosition += 10
  
  // Línea separadora
  doc.setDrawColor(200, 200, 200)
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition)
  yPosition += 10
  
  // Medidas Extraídas
  if (datos.medidas && Object.keys(datos.medidas).length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(0, 102, 204)
    doc.text('MEDIDAS DEL PLANO', marginLeft, yPosition)
    yPosition += 8
    
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    
    const medidas = [
      { label: 'Área Total', value: datos.medidas.area_total, unit: 'm²' },
      { label: 'Área Paredes', value: datos.medidas.area_paredes, unit: 'm²' },
      { label: 'Área Ventanas', value: datos.medidas.area_ventanas, unit: 'm²' },
      { label: 'Área Puertas', value: datos.medidas.area_puertas, unit: 'm²' },
      { label: 'Perímetro Total', value: datos.medidas.perimetro_total, unit: 'm' },
    ]
    
    medidas.forEach(m => {
      if (m.value !== undefined) {
        doc.text(`${m.label}: ${m.value.toFixed(2)} ${m.unit}`, marginLeft, yPosition)
        yPosition += 5
      }
    })
    
    yPosition += 3
    
    if (datos.medidas.num_puertas || datos.medidas.num_ventanas || datos.medidas.num_paredes) {
      doc.text(
        `Elementos: ${datos.medidas.num_puertas || 0} puertas, ${datos.medidas.num_ventanas || 0} ventanas, ${datos.medidas.num_paredes || 0} paredes`,
        marginLeft,
        yPosition
      )
      yPosition += 5
    }
    
    if (datos.medidas.bounds) {
      doc.text(
        `Dimensiones: ${datos.medidas.bounds.ancho?.toFixed(2) || 'N/A'} m × ${datos.medidas.bounds.alto?.toFixed(2) || 'N/A'} m`,
        marginLeft,
        yPosition
      )
      yPosition += 10
    } else {
      yPosition += 5
    }
    
    doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition)
    yPosition += 10
  }
  
  // Materiales
  doc.setFontSize(14)
  doc.setTextColor(0, 102, 204)
  doc.text('MATERIALES Y COSTOS', marginLeft, yPosition)
  yPosition += 8
  
  // Encabezados de tabla
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Material', marginLeft, yPosition)
  doc.text('Cant.', marginLeft + 80, yPosition)
  doc.text('Precio Unit.', marginLeft + 105, yPosition)
  doc.text('Subtotal', marginLeft + 145, yPosition)
  yPosition += 5
  
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition)
  yPosition += 5
  
  // Materiales
  doc.setTextColor(0, 0, 0)
  datos.materiales.forEach((material, index) => {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }
    
    const nombreMaterial = material.nombre.length > 35 
      ? material.nombre.substring(0, 35) + '...' 
      : material.nombre
    
    doc.text(nombreMaterial, marginLeft, yPosition)
    doc.text(material.cantidad.toString(), marginLeft + 80, yPosition)
    doc.text(`$${material.precio_unitario.toLocaleString()}`, marginLeft + 105, yPosition)
    doc.text(`$${material.subtotal.toLocaleString()}`, marginLeft + 145, yPosition)
    yPosition += 5
    
    // Categoría en gris pequeño
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(material.categoria, marginLeft, yPosition)
    yPosition += 6
    
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
  })
  
  yPosition += 5
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition)
  yPosition += 8
  
  // Totales
  doc.setFontSize(11)
  doc.text('Subtotal:', marginLeft + 120, yPosition)
  doc.text(`$${datos.subtotal.toLocaleString()}`, marginLeft + 145, yPosition)
  yPosition += 7
  
  doc.text('IVA (19%):', marginLeft + 120, yPosition)
  doc.text(`$${datos.iva.toLocaleString()}`, marginLeft + 145, yPosition)
  yPosition += 7
  
  doc.setFontSize(13)
  doc.setFont(undefined, 'bold')
  doc.text('TOTAL:', marginLeft + 120, yPosition)
  doc.text(`$${datos.total.toLocaleString()}`, marginLeft + 145, yPosition)
  
  // Footer
  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(150, 150, 150)
  const footerY = doc.internal.pageSize.getHeight() - 10
  doc.text('Generado por FloorPlanTo3D', marginLeft, footerY)
  doc.text(new Date().toLocaleString('es-ES'), pageWidth - marginRight - 40, footerY)
  
  // Guardar PDF
  doc.save(`Cotizacion_${datos.planoNombre.replace(/\s+/g, '_')}_${Date.now()}.pdf`)
}

/**
 * Exporta la cotización a Excel
 */
export function exportarCotizacionExcel(datos: DatosCotizacion): void {
  const workbook = XLSX.utils.book_new()
  
  // Hoja 1: Información General
  const infoData: any[][] = [
    ['COTIZACIÓN DE PROYECTO'],
    [],
    ['Plano:', datos.planoNombre],
    ['Cliente:', datos.clienteNombre],
    ['Email:', datos.clienteEmail],
    ['Descripción:', datos.descripcion || 'N/A'],
    ['Fecha:', new Date().toLocaleDateString('es-ES')],
  ]
  
  const infoSheet = XLSX.utils.aoa_to_sheet(infoData)
  XLSX.utils.book_append_sheet(workbook, infoSheet, 'Información')
  
  // Hoja 2: Medidas Extraídas
  if (datos.medidas && Object.keys(datos.medidas).length > 0) {
    const medidasData: any[][] = [
      ['MEDIDAS DEL PLANO'],
      [],
      ['Concepto', 'Valor', 'Unidad'],
      ['Área Total', datos.medidas.area_total?.toFixed(2) || 'N/A', 'm²'],
      ['Área Paredes', datos.medidas.area_paredes?.toFixed(2) || 'N/A', 'm²'],
      ['Área Ventanas', datos.medidas.area_ventanas?.toFixed(2) || 'N/A', 'm²'],
      ['Área Puertas', datos.medidas.area_puertas?.toFixed(2) || 'N/A', 'm²'],
      ['Perímetro Total', datos.medidas.perimetro_total?.toFixed(2) || 'N/A', 'm'],
      [],
      ['CONTADORES'],
      [],
      ['Elemento', 'Cantidad'],
      ['Paredes', datos.medidas.num_paredes || 0],
      ['Ventanas', datos.medidas.num_ventanas || 0],
      ['Puertas', datos.medidas.num_puertas || 0],
    ]
    
    if (datos.medidas.bounds) {
      medidasData.push([])
      medidasData.push(['DIMENSIONES'])
      medidasData.push([])
      medidasData.push(['Ancho', datos.medidas.bounds.ancho?.toFixed(2) || 'N/A', 'm'])
      medidasData.push(['Alto', datos.medidas.bounds.alto?.toFixed(2) || 'N/A', 'm'])
    }
    
    const medidasSheet = XLSX.utils.aoa_to_sheet(medidasData)
    XLSX.utils.book_append_sheet(workbook, medidasSheet, 'Medidas')
  }
  
  // Hoja 3: Materiales y Cotización
  const materialesData: any[][] = [
    ['MATERIALES Y COSTOS'],
    [],
    ['Material', 'Categoría', 'Cantidad', 'Precio Unitario', 'Subtotal'],
  ]
  
  datos.materiales.forEach(material => {
    materialesData.push([
      material.nombre,
      material.categoria,
      material.cantidad,
      material.precio_unitario,
      material.subtotal,
    ])
  })
  
  materialesData.push([])
  materialesData.push([])
  materialesData.push(['', '', '', 'Subtotal:', datos.subtotal])
  materialesData.push(['', '', '', 'IVA (19%):', datos.iva])
  materialesData.push(['', '', '', 'TOTAL:', datos.total])
  
  const materialesSheet = XLSX.utils.aoa_to_sheet(materialesData)
  
  // Aplicar formato a columnas de moneda
  const range = XLSX.utils.decode_range(materialesSheet['!ref'] || 'A1')
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const cellD = XLSX.utils.encode_cell({ r: R, c: 3 }) // Precio Unitario
    const cellE = XLSX.utils.encode_cell({ r: R, c: 4 }) // Subtotal
    
    if (materialesSheet[cellD] && typeof materialesSheet[cellD].v === 'number') {
      materialesSheet[cellD].z = '$#,##0.00'
    }
    if (materialesSheet[cellE] && typeof materialesSheet[cellE].v === 'number') {
      materialesSheet[cellE].z = '$#,##0.00'
    }
  }
  
  XLSX.utils.book_append_sheet(workbook, materialesSheet, 'Cotización')
  
  // Guardar archivo
  XLSX.writeFile(workbook, `Cotizacion_${datos.planoNombre.replace(/\s+/g, '_')}_${Date.now()}.xlsx`)
}

