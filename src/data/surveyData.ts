import type { SurveySection } from '../types/survey';

export const surveySections: SurveySection[] = [
  /* =========================================
     SECCIÓN 1: Situación Personal y Familiar
     ========================================= */
  {
    id: 'personal',
    title: 'Situación personal y familiar',
    subtitle: 'Para adecuar sus impuestos a su situación vital, necesitamos conocer su estado civil y las personas que dependen de usted.',
    icon: '👤',
    questions: [
      {
        id: 'estado_civil',
        text: '¿Cuál era su estado civil a 31 de diciembre de 2025?',
        type: 'select',
        required: true,
        placeholder: 'Seleccione su estado civil',
        options: [
          { value: 'soltero', label: 'Soltero/a' },
          { value: 'casado', label: 'Casado/a' },
          { value: 'divorciado', label: 'Divorciado/a' },
          { value: 'viudo', label: 'Viudo/a' },
          { value: 'pareja_hecho', label: 'Pareja de hecho' },
        ],
        hint: 'Si ha habido cambios (matrimonio, divorcio o viudedad) en 2025, indíquelo en observaciones.',
        documentInfo: 'Sentencia de divorcio / convenio regulador (si procede).',
      },
      {
        id: 'estado_civil_cambio',
        text: 'Si hubo cambios en su estado civil durante 2025, indique la fecha y detalle:',
        type: 'textarea',
        placeholder: 'Ej: Matrimonio el 15/06/2025',
      },
      {
        id: 'hijos_menores',
        text: '¿Tiene hijos menores de 25 años o con discapacidad que hayan convivido con usted durante 2025 y que no hayan ganado más de 8.000 € en el año?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Copia del Libro de Familia o DNI de los descendientes.',
        conditionals: [
          {
            showWhen: 'si',
            question: {
              id: 'hijos_detalle',
              text: 'Indique el nombre y fecha de nacimiento de cada hijo/a:',
              type: 'textarea',
              placeholder: 'Nombre — Fecha de nacimiento (DD/MM/AAAA)',
            },
          },
        ],
      },
      {
        id: 'ascendientes',
        text: '¿Conviven con usted ascendientes (padres o suegros) mayores de 65 años o con discapacidad ≥33%, que no hayan tenido rentas superiores a 8.000 € en 2025?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'DNI de los ascendientes.',
        conditionals: [
          {
            showWhen: 'si',
            question: {
              id: 'ascendientes_detalle',
              text: 'Indique el nombre y fecha de nacimiento de los ascendientes:',
              type: 'textarea',
              placeholder: 'Nombre — Fecha de nacimiento (DD/MM/AAAA)',
            },
          },
        ],
      },
      {
        id: 'discapacidad',
        text: '¿Tiene usted o alguno de sus familiares a cargo reconocido un grado de discapacidad igual o superior al 33%?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Certificado de discapacidad emitido por el órgano competente.',
        conditionals: [
          {
            showWhen: 'si',
            question: {
              id: 'discapacidad_detalle',
              text: 'Indique quién y el porcentaje de discapacidad:',
              type: 'textarea',
              placeholder: 'Ej: Titular – 45% / Hijo Juan – 33%',
            },
          },
        ],
      },
      {
        id: 'cambio_domicilio',
        text: '¿Ha cambiado de domicilio habitual durante el año 2025?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        conditionals: [
          {
            showWhen: 'si',
            question: {
              id: 'domicilio_nuevo',
              text: 'Indique la nueva dirección completa:',
              type: 'textarea',
              placeholder: 'Calle, número, piso, código postal, ciudad, provincia',
            },
          },
        ],
      },
    ],
  },

  /* =========================================
     SECCIÓN 2: Rendimientos del Trabajo
     ========================================= */
  {
    id: 'trabajo',
    title: 'Rendimientos del trabajo',
    subtitle: 'Recopilaremos la información sobre sus nóminas, pensiones y otras prestaciones.',
    icon: '💼',
    questions: [
      {
        id: 'num_pagadores',
        text: '¿Ha trabajado para uno o varios empleadores durante 2025?',
        type: 'select',
        required: true,
        placeholder: 'Seleccione el número de pagadores',
        options: [
          { value: '0', label: 'Ninguno (no he trabajado por cuenta ajena)' },
          { value: '1', label: '1 pagador' },
          { value: '2', label: '2 pagadores' },
          { value: '3_mas', label: '3 o más pagadores' },
        ],
        documentInfo: 'Certificado de retenciones emitido por su(s) empresa(s).',
      },
      {
        id: 'prestaciones_sepe',
        text: '¿Ha percibido alguna prestación del SEPE (desempleo, ERTE) o pensiones de jubilación/incapacidad durante 2025?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Certificado de prestaciones del SEPE o de la Seguridad Social.',
      },
      {
        id: 'indemnizacion',
        text: '¿Ha sido despedido o ha finalizado su relación laboral cobrando algún tipo de indemnización?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Carta de despido y documento de acuerdo/conciliación (CMAC).',
        conditionals: [
          {
            showWhen: 'si',
            question: {
              id: 'indemnizacion_importe',
              text: 'Indique la cantidad recibida (en euros):',
              type: 'number',
              placeholder: 'Ej: 15000',
            },
          },
        ],
      },
      {
        id: 'maternidad_paternidad',
        text: '¿Ha cobrado prestaciones por maternidad o paternidad en 2025?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Certificado del INSS.',
      },
    ],
  },

  /* =========================================
     SECCIÓN 3: Capital Inmobiliario y Mobiliario
     ========================================= */
  {
    id: 'capital',
    title: 'Rendimientos del capital',
    subtitle: 'Ingresos provenientes de sus propiedades, cuentas bancarias e inversiones.',
    icon: '🏠',
    questions: [
      {
        id: 'otros_inmuebles',
        text: '¿Es propietario o usufructuario de algún inmueble además de su vivienda habitual (segundas residencias, pisos vacíos, locales, plazas de garaje)?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Recibos del IBI de todas las propiedades.',
        conditionals: [
          {
            showWhen: 'si',
            question: {
              id: 'inmuebles_uso',
              text: 'Indique el uso de cada inmueble:',
              type: 'textarea',
              placeholder: 'Ej: Piso en Málaga – alquilado / Local en Madrid – vacío',
            },
          },
        ],
      },
      {
        id: 'inmuebles_alquilados',
        text: 'Si tiene inmuebles alquilados, ¿cuáles han sido sus ingresos totales y gastos asociados (comunidad, IBI, seguros, reparaciones, intereses de hipoteca)?',
        type: 'textarea',
        placeholder: 'Ingresos totales: X € / Gastos: comunidad X €, IBI X €, seguros X €...',
        hint: 'Si no tiene inmuebles alquilados, puede dejar este campo vacío.',
        documentInfo: 'Contratos de alquiler, justificantes de cobro y facturas de gastos.',
      },
      {
        id: 'intereses_dividendos',
        text: '¿Ha obtenido intereses de cuentas bancarias, depósitos o ha cobrado dividendos de acciones?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Información fiscal anual proporcionada por su banco.',
      },
    ],
  },

  /* =========================================
     SECCIÓN 4: Actividades Económicas
     ========================================= */
  {
    id: 'autonomo',
    title: 'Actividades económicas (Autónomos)',
    subtitle: 'Este apartado aplica si usted trabaja o ha trabajado por cuenta propia.',
    icon: '📊',
    questions: [
      {
        id: 'alta_autonomo',
        text: '¿Ha estado dado de alta como trabajador autónomo en algún momento de 2025?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'ingresos_gastos_actividad',
        text: '¿Qué ingresos y gastos totales ha tenido derivados de su actividad profesional o empresarial?',
        type: 'textarea',
        placeholder: 'Ingresos: X € / Gastos: X €',
        hint: 'Si no es autónomo, puede dejar este campo vacío.',
        documentInfo: 'Libros registro de ingresos/gastos, resumen de facturación y modelos trimestrales (130/131).',
      },
      {
        id: 'cuota_autonomos',
        text: '¿Cuánto ha pagado de cuota de autónomos (RETA o mutualidad alternativa) durante 2025?',
        type: 'number',
        placeholder: 'Ej: 3600',
        hint: 'Importe anual total en euros. Si no aplica, deje vacío.',
        documentInfo: 'Certificado de cuotas de la Seguridad Social o mutualidad.',
      },
      {
        id: 'ayudas_autonomo',
        text: '¿Ha recibido alguna ayuda directa como autónomo en 2025 (ej. ayudas por la DANA u otras subvenciones públicas)?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Justificante de concesión y cobro de la ayuda.',
        conditionals: [
          {
            showWhen: 'si',
            question: {
              id: 'ayudas_autonomo_importe',
              text: 'Indique el importe recibido (en euros):',
              type: 'number',
              placeholder: 'Ej: 5000',
            },
          },
        ],
      },
    ],
  },

  /* =========================================
     SECCIÓN 5: Ganancias y Pérdidas Patrimoniales
     ========================================= */
  {
    id: 'ganancias',
    title: 'Ganancias y pérdidas patrimoniales',
    subtitle: 'Ventas de bienes, inversiones y ayudas del Estado.',
    icon: '📈',
    questions: [
      {
        id: 'venta_inmueble',
        text: '¿Ha vendido o donado algún inmueble (vivienda, local, terreno) en 2025?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Escrituras de compra y de venta, facturas de gastos (notaría, registro, plusvalía municipal).',
      },
      {
        id: 'venta_inversiones',
        text: '¿Ha vendido acciones, fondos de inversión o criptomonedas durante 2025?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Informes fiscales de su banco, bróker o plataforma de criptomonedas (exchange).',
      },
      {
        id: 'subvenciones_estado',
        text: '¿Ha recibido alguna subvención o ayuda del Estado?',
        type: 'checkbox',
        options: [
          { value: 'bono_cultural', label: 'Bono Cultural Joven' },
          { value: 'bono_termico', label: 'Bono Social Térmico' },
          { value: 'plan_moves', label: 'Plan MOVES III (vehículos)' },
          { value: 'ayuda_alquiler', label: 'Ayudas al alquiler' },
          { value: 'ayuda_200', label: 'Ayuda directa de 200 €' },
          { value: 'otra', label: 'Otra subvención' },
          { value: 'ninguna', label: 'No he recibido ninguna' },
        ],
        hint: 'Seleccione todas las que apliquen.',
        documentInfo: 'Justificante bancario del cobro o documento de concesión de cada ayuda.',
      },
      {
        id: 'subvenciones_detalle',
        text: 'Si marcó alguna ayuda, indique el importe total recibido (en euros):',
        type: 'number',
        placeholder: 'Ej: 400',
        hint: 'Dejar vacío si no ha recibido subvenciones.',
      },
    ],
  },

  /* =========================================
     SECCIÓN 6: Deducciones e IBAN
     ========================================= */
  {
    id: 'deducciones',
    title: 'Deducciones aplicables y datos bancarios',
    subtitle: 'Estas preguntas nos ayudarán a aplicar reducciones en su declaración.',
    icon: '💰',
    questions: [
      {
        id: 'alquiler_vivienda',
        text: '¿Vive de alquiler y el contrato es anterior al 1 de enero de 2015, o su Comunidad Autónoma tiene deducciones por alquiler?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Contrato de alquiler, justificantes de pago y DNI/NIF del propietario (arrendador).',
        conditionals: [
          {
            showWhen: 'si',
            question: {
              id: 'alquiler_importe',
              text: 'Cantidad total pagada en alquiler durante 2025 (en euros):',
              type: 'number',
              placeholder: 'Ej: 9600',
            },
          },
        ],
      },
      {
        id: 'hipoteca',
        text: '¿Está pagando hipoteca por su vivienda habitual y la compró antes del 1 de enero de 2013?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Certificado fiscal de su banco con el capital e intereses pagados en 2025.',
      },
      {
        id: 'colegios_sindicatos',
        text: '¿Ha pagado cuotas a colegios profesionales (si la colegiación es obligatoria) o a sindicatos?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Recibo o justificante bancario del pago.',
        conditionals: [
          {
            showWhen: 'si',
            question: {
              id: 'colegios_importe',
              text: 'Importe total pagado (en euros):',
              type: 'number',
              placeholder: 'Ej: 250',
            },
          },
        ],
      },
      {
        id: 'donativos',
        text: '¿Ha realizado donativos a ONGs, fundaciones o partidos políticos durante 2025?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Certificado oficial de donación emitido por la entidad.',
        conditionals: [
          {
            showWhen: 'si',
            question: {
              id: 'donativos_importe',
              text: 'Importe total donado (en euros):',
              type: 'number',
              placeholder: 'Ej: 500',
            },
          },
        ],
      },
      {
        id: 'madre_guarderia',
        text: '¿Es madre trabajadora con hijos menores de 3 años, o ha tenido gastos de guardería infantil autorizada en 2025?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Justificante de pago a la guardería (y el NIF de la misma).',
        conditionals: [
          {
            showWhen: 'si',
            question: {
              id: 'guarderia_importe',
              text: 'Importe total abonado a la guardería (en euros):',
              type: 'number',
              placeholder: 'Ej: 3000',
            },
          },
        ],
      },
      {
        id: 'eficiencia_energetica',
        text: '¿Ha realizado obras de mejora de eficiencia energética en su vivienda o ha comprado un vehículo eléctrico puro/enchufable nuevo?',
        type: 'radio',
        required: true,
        options: [
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No' },
        ],
        documentInfo: 'Facturas de la instalación/compra, justificantes de pago y Certificados de Eficiencia Energética (antes y después de la obra).',
        conditionals: [
          {
            showWhen: 'si',
            question: {
              id: 'eficiencia_importe',
              text: 'Importe total invertido (en euros):',
              type: 'number',
              placeholder: 'Ej: 8000',
            },
          },
        ],
      },
      {
        id: 'iban',
        text: 'Número de cuenta bancaria (IBAN) para domiciliar el pago o recibir la devolución:',
        type: 'iban',
        required: true,
        placeholder: 'ES12 3456 7890 1234 5678 9012',
        hint: 'Código IBAN completo de 24 caracteres.',
        validation: '^ES\\d{2}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}$',
        validationMessage: 'El IBAN debe tener el formato ES seguido de 22 dígitos.',
      },
    ],
  },
];
