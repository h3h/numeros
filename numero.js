export class Numero {
  #matchMasculineHundreds = /ientos\b/g
  #replaceFeminineHundreds = 'ientas'
  #nouns = [
    { noun: 'aviones', gender: 'm', emoji: '✈️' },
    { noun: 'corazones', gender: 'm', emoji: '❤️' },
    { noun: 'limones', gender: 'm', emoji: '🍋' },
    { noun: 'manzanas', gender: 'f', emoji: '🍎' },
    { noun: 'naranjas', gender: 'f', emoji: '🍊' },
    { noun: 'peras', gender: 'f', emoji: '🍐' },
    { noun: 'sandías', gender: 'f', emoji: '🍉' },
    { noun: 'casas', gender: 'f', emoji: '🏠' },
    { noun: 'elefantes', gender: 'm', emoji: '🐘' },
    { noun: 'manos', gender: 'f', emoji: '🖐️' },
    { noun: 'perros', gender: 'm', emoji: '🐶' },
    { noun: 'pájaros', gender: 'm', emoji: '🐦' },
  ]

  generateOutputSet() {
    const randomIndex = Math.floor(Math.random() * this.#nouns.length)
    const number = this.#generateGoodNumber()
    const noun = this.#nouns[randomIndex].noun
    const gender = this.#nouns[randomIndex].gender
    const emoji = this.#nouns[randomIndex].emoji

    return [number, noun, gender, emoji]
  }

  validateWords(input, number, gender) {
    input = input.toLowerCase().trim().replace(/\s+/g, ' ')
    const correctWords = this.numberToWords(number, gender)

    // handle both genders as correct for hundreds (“cuatrocientos casas” o “cuatrocientas casas”)
    if (gender === 'f' && this.#matchMasculineHundreds.test(input) && input !== correctWords) {
      return input.replace(this.#matchMasculineHundreds, this.#replaceFeminineHundreds) === correctWords
    }

    return input === correctWords
  }

  numberToWords(number, gender) {
    // Special cases
    if (number === 100) return 'cien'
    if (number === 100000) return 'cien mil'
    if (number === 1000000) return 'un millón de'

    let words = ''

    // Millions
    const millions = Math.floor(number / 1000000)
    if (millions > 0) {
      words += millions === 1 ? 'un millón ' : this.#getNumberPart(millions, gender) + ' millones '
    }

    // Thousands
    const thousands = Math.floor((number % 1000000) / 1000)
    if (thousands > 0) {
      words += thousands === 1 ? 'mil ' : this.#getNumberPart(thousands, gender) + ' mil '
    }

    // Remainder
    const remainder = number % 1000
    if (remainder > 0 || number === 0) {
      words += this.#getNumberPart(remainder, gender)
    }

    return words.trim()
  }

  #generateGoodNumber() {
    const floor = 100
    let scale
    const scales = [
      [25, 999], // 25% of the time generate a number less than 1000
      [40, 9999], // 15% of the time generate a number less than 10 000
      [55, 99999], // etc.
      [80, 999999],
      [100, 9999999],
    ]
    const random = Math.round(Math.random() * 100)
    scale = scales.find((vals) => {
      return random <= vals[0]
    })[1]

    return floor + Math.round(Math.random() * scale)
  }

  #getNumberPart(n, gender) {
    const units = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
    const teens = [
      'diez',
      'once',
      'doce',
      'trece',
      'catorce',
      'quince',
      'dieciséis',
      'diecisiete',
      'dieciocho',
      'diecinueve',
    ]
    const twenties = [
      'veinte',
      'veintiuno',
      'veintidós',
      'veintitrés',
      'veinticuatro',
      'veinticinco',
      'veintiséis',
      'veintisiete',
      'veintiocho',
      'veintinueve',
    ]
    const tens = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
    const hundreds = [
      '',
      'ciento',
      'doscientos',
      'trescientos',
      'cuatrocientos',
      'quinientos',
      'seiscientos',
      'setecientos',
      'ochocientos',
      'novecientos',
    ]

    if (n === 0) return 'cero'

    let words = ''

    // Hundreds
    const hundred = Math.floor(n / 100)
    if (hundred > 0) {
      if (gender === 'f') {
        words += hundreds[hundred].replace(this.#matchMasculineHundreds, this.#replaceFeminineHundreds) + ' '
      } else {
        words += hundreds[hundred] + ' '
      }
    }

    // Tens and units
    const remainder = n % 100
    if (remainder > 0) {
      if (remainder < 10) {
        let unit = units[remainder]
        if (remainder === 1 && gender === 'f') {
          unit = 'una'
        }
        words += unit
      } else if (remainder < 20) {
        words += teens[remainder - 10]
      } else if (remainder < 30) {
        if (gender === 'f' && remainder === 21) {
          words += 'veintiuna'
        } else if (gender === 'm' && remainder === 21) {
          words += 'veintiún'
        } else {
          words += twenties[remainder - 20]
        }
      } else {
        const ten = Math.floor(remainder / 10)
        const unit = remainder % 10

        if (unit === 0) {
          words += tens[ten]
        } else {
          words += tens[ten] + ' y ' + (gender === 'f' && unit === 1 ? 'una' : units[unit])
        }
      }
    }

    return words.trim()
  }
}
