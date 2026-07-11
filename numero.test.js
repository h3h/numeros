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
      expect(number).toBeLessThanOrEqual(9999999999)
      expect(noun).not.toBe('')
      expect(['m', 'f']).toContain(gender)
      expect(emoji).not.toBe('')
    })
  })

  describe('numberToWords', () => {
    // Rule: exactly 100 in any position is "cien"; 101–199 is "ciento …".
    describe('cien vs ciento', () => {
      test.each([
        [100, 'm', 'cien'],
        [105, 'm', 'ciento cinco'],
        [110, 'm', 'ciento diez'],
        [199, 'm', 'ciento noventa y nueve'],
        [100000, 'm', 'cien mil'],
        [101000, 'm', 'ciento un mil'],
        [101000, 'f', 'ciento una mil'],
        [100100, 'm', 'cien mil cien'],
        [1100000, 'm', 'un millón cien mil'],
      ])('%i (%s) -> %s', (n, g, want) => {
        expect(numero.numberToWords(n, g)).toBe(want)
      })
    })

    // Rule: apocope and unit gender agree with the counted noun.
    describe('apocope and unit gender', () => {
      test.each([
        [1, 'm', 'un'],
        [1, 'f', 'una'],
        [121, 'm', 'ciento veintiún'],
        [121, 'f', 'ciento veintiuna'],
        [721000, 'm', 'setecientos veintiún mil'],
        [721000, 'f', 'setecientas veintiuna mil'],
        [502000, 'f', 'quinientas dos mil'],
        [551515, 'f', 'quinientas cincuenta y una mil quinientas quince'],
      ])('%i (%s) -> %s', (n, g, want) => {
        expect(numero.numberToWords(n, g)).toBe(want)
      })
    })

    // Rule: the count before "millones" is always masculine, regardless of noun.
    describe('millions multiplier is always masculine', () => {
      test.each([
        [2000000, 'm', 'dos millones de'],
        [2000000, 'f', 'dos millones de'],
        [21000000, 'm', 'veintiún millones de'],
        [21000000, 'f', 'veintiún millones de'],
        [500000000, 'm', 'quinientos millones de'],
        [500000000, 'f', 'quinientos millones de'],
      ])('%i (%s) -> %s', (n, g, want) => {
        expect(numero.numberToWords(n, g)).toBe(want)
      })
    })

    // Rule: append "de" iff the number is an exact million/thousand-million multiple.
    describe('the "de" rule', () => {
      test.each([
        [1000000, 'm', 'un millón de'],
        [1000000, 'f', 'un millón de'],
        [5000000, 'f', 'cinco millones de'],
        [1000000000, 'm', 'mil millones de'],
        [2000000000, 'f', 'dos mil millones de'],
        // non-exact multiples take no "de"
        [5000005, 'm', 'cinco millones cinco'],
        [1234567, 'm', 'un millón doscientos treinta y cuatro mil quinientos sesenta y siete'],
      ])('%i (%s) -> %s', (n, g, want) => {
        expect(numero.numberToWords(n, g)).toBe(want)
      })
    })

    // Rule: "y" appears only between tens and units.
    describe('"y" placement', () => {
      test.each([
        [30, 'm', 'treinta'],
        [35, 'm', 'treinta y cinco'],
        [3666, 'm', 'tres mil seiscientos sesenta y seis'],
        [3606, 'm', 'tres mil seiscientos seis'],
      ])('%i (%s) -> %s', (n, g, want) => {
        expect(numero.numberToWords(n, g)).toBe(want)
      })
    })

    describe('boundaries and previously-correct values', () => {
      test.each([
        [0, 'm', 'cero'],
        [1000, 'm', 'mil'],
        [123, 'm', 'ciento veintitrés'],
        [1983, 'f', 'mil novecientas ochenta y tres'],
        [2012, 'f', 'dos mil doce'],
        [20300, 'm', 'veinte mil trescientos'],
        [20354, 'm', 'veinte mil trescientos cincuenta y cuatro'],
        [102000, 'f', 'ciento dos mil'],
        [120000, 'm', 'ciento veinte mil'],
        [135000, 'm', 'ciento treinta y cinco mil'],
        [135000, 'f', 'ciento treinta y cinco mil'],
        [444000, 'm', 'cuatrocientos cuarenta y cuatro mil'],
        [967000, 'm', 'novecientos sesenta y siete mil'],
        [967000, 'f', 'novecientas sesenta y siete mil'],
        [5000005, 'm', 'cinco millones cinco'],
        [
          5002853367,
          'm',
          'cinco mil dos millones ochocientos cincuenta y tres mil trescientos sesenta y siete',
        ],
        [
          6007617498,
          'm',
          'seis mil siete millones seiscientos diecisiete mil cuatrocientos noventa y ocho',
        ],
        [
          9999999999,
          'f',
          'nueve mil novecientos noventa y nueve millones novecientas noventa y nueve mil novecientas noventa y nueve',
        ],
      ])('%i (%s) -> %s', (n, g, want) => {
        expect(numero.numberToWords(n, g)).toBe(want)
      })
    })
  })

  describe('validateWords', () => {
    test('validates simple numbers correctly', () => {
      expect(numero.validateWords('ciento veintitrés', 123, 'm')).toBe(true)
      expect(numero.validateWords('ciento veinte', 123, 'm')).toBe(false)
    })

    test('normalizes case and whitespace', () => {
      expect(numero.validateWords('UN', 1, 'm')).toBe(true)
      expect(numero.validateWords('  ciento   veintitrés ', 123, 'm')).toBe(true)
    })

    test('accepts masculine or feminine hundreds for feminine nouns', () => {
      expect(numero.validateWords('cuatrocientos', 400, 'f')).toBe(true)
      expect(numero.validateWords('cuatrocientas', 400, 'f')).toBe(true)
      expect(numero.validateWords('novecientos una', 901, 'f')).toBe(true)
      expect(numero.validateWords('novecientas una', 901, 'f')).toBe(true)
      expect(numero.validateWords('quinientos dos mil', 502000, 'f')).toBe(true)
    })

    // Guard: the shared hundreds regex must not carry state across calls.
    test('is stable when called repeatedly with the same input', () => {
      for (let i = 0; i < 5; i++) {
        expect(numero.validateWords('cuatrocientos', 400, 'f')).toBe(true)
      }
    })
  })
})
