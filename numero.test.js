import { Numero } from './numero.js'

describe('Numero', () => {
  let numero

  beforeEach(() => {
    numero = new Numero()
  })

  describe('generateOutputSet', () => {
    test('returns valid number, noun, gender and emoji', () => {
      const [number, noun, gender, emoji] = numero.generateOutputSet()

      expect(number).toBeGreaterThanOrEqual(100)
      expect(number).toBeLessThanOrEqual(9999999)
      expect(['perros', 'casas', 'elefantes', 'manos']).toContain(noun)
      expect(['m', 'f']).toContain(gender)
      expect(['🐶', '🏠', '🐘', '🖐️']).toContain(emoji)
    })
  })

  describe('validateWords', () => {
    test('validates simple numbers correctly', () => {
      expect(numero.validateWords('ciento veintitrés', 123, 'm')).toBe(true)
      expect(numero.validateWords('ciento veinte', 123, 'm')).toBe(false)
    })

    test('handles gender correctly', () => {
      expect(numero.validateWords('un', 1, 'm')).toBe(true)
      expect(numero.validateWords('UN', 1, 'm')).toBe(true)
      expect(numero.validateWords('una', 1, 'f')).toBe(true)
      expect(numero.validateWords('cuatrocientos', 400, 'm')).toBe(true)
      expect(numero.validateWords('cuatrocientos', 400, 'f')).toBe(true)
      expect(numero.validateWords('cuatrocientas', 400, 'f')).toBe(true)
      expect(numero.validateWords('novecientos un', 901, 'm')).toBe(true)
      expect(numero.validateWords('novecientas una', 901, 'f')).toBe(true)
    })
  })

  describe('numberToWords', () => {
    test('knows words', () => {
      expect(numero.numberToWords(1, 'm')).toBe('un')
      expect(numero.numberToWords(1, 'f')).toBe('una')
      expect(numero.numberToWords(100, 'm')).toBe('cien')
      expect(numero.numberToWords(123, 'm')).toBe('ciento veintitrés')
      expect(numero.numberToWords(1983, 'f')).toBe('mil novecientas ochenta y tres')
      expect(numero.numberToWords(2012, 'f')).toBe('dos mil doce')
      expect(numero.numberToWords(3606, 'm')).toBe('tres mil seiscientos seis')
      expect(numero.numberToWords(3666, 'm')).toBe('tres mil seiscientos sesenta y seis')
      expect(numero.numberToWords(20300, 'm')).toBe('veinte mil trescientos')
      expect(numero.numberToWords(20354, 'm')).toBe('veinte mil trescientos cincuenta y cuatro')
      expect(numero.numberToWords(100000, 'm')).toBe('cien mil')
      expect(numero.numberToWords(101000, 'm')).toBe('ciento un mil')
      expect(numero.numberToWords(101000, 'f')).toBe('ciento una mil')
      expect(numero.numberToWords(120000, 'm')).toBe('ciento veinte mil')
      expect(numero.numberToWords(135000, 'm')).toBe('ciento treinta y cinco mil')
      expect(numero.numberToWords(135000, 'f')).toBe('ciento treinta y cinco mil')
      expect(numero.numberToWords(444000, 'm')).toBe('cuatrocientos cuarenta y cuatro mil')
      expect(numero.numberToWords(502000, 'f')).toBe('quinientos dos mil')
      expect(numero.numberToWords(721000, 'm')).toBe('setecientos veintiún mil')
      expect(numero.numberToWords(721000, 'f')).toBe('setecientas veintiuna mil')
      expect(numero.numberToWords(967000, 'm')).toBe('novecientos sesenta y siete mil')
      expect(numero.numberToWords(967000, 'f')).toBe('novecientas sesenta y siete mil')
      expect(numero.numberToWords(1000000, 'm')).toBe('un millón de')
      expect(numero.numberToWords(1000000, 'f')).toBe('un millón de')
      expect(numero.numberToWords(5000000, 'f')).toBe('cinco millones')
      expect(numero.numberToWords(5000005, 'm')).toBe('cinco millones cinco')
      expect(numero.numberToWords(1234567, 'm')).toBe(
        'un millón doscientos treinta y cuatro mil quinientos sesenta y siete'
      )
    })
  })
})
