/* Built with the help of Claude Sonnet 3.5 */
class Numeros {
  #correctWords
  #currentNoun
  #currentNumber
  #nounGenders = {
    perros: 'm',
    casas: 'f',
    elefantes: 'm',
    manos: 'f',
  }
  #numero
  #output
  #textInput

  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.#numero = document.getElementById('numero')
      this.#output = document.getElementById('output')
      this.#textInput = document.getElementById('textInput')

      this.#textInput.addEventListener('keydown', (e) => this.handleInput(e))

      this.createNewPrompt()
    })
  }

  createNewPrompt() {
    const number = this.generateNumero()
    const [nouns, emoji] = this.generateNounsWithEmoji()

    this.#numero.innerText = `${number} ${nouns} ${emoji}`
  }

  generateNounsWithEmoji() {
    const nouns = ['perros', 'casas', 'elefantes', 'manos']
    const emojis = ['🐶', '🏠', '🐘', '🖐️']

    const randomIndex = Math.floor(Math.random() * nouns.length)
    this.#currentNoun = nouns[randomIndex]
    return [nouns[randomIndex], emojis[randomIndex]]
  }

  generateNumero() {
    const floor = 100 // only generate numbers above 100
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

    this.#currentNumber = floor + Math.round(Math.random() * scale)
    const formattedNumber = this.#currentNumber
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') // spaces as thousands separators
    return formattedNumber
  }

  handleInput(event) {
    if (event.key === 'Enter') {
      if (this.validateNumber(this.#textInput.value)) {
        this.#textInput.disabled = true // Prevent further input during animation

        // Start celebration animation
        let count = 0
        const emojis = ['🎉', '✨', '🎊', '🌟', '💫']
        const animation = setInterval(() => {
          const randomEmojis = Array(3)
            .fill()
            .map(() => emojis[Math.floor(Math.random() * emojis.length)])
            .join(' ')
          this.#output.innerText = `${randomEmojis} ¡Éxito! ${randomEmojis}`
          count++

          // End animation after 2 seconds (assuming 100ms intervals)
          if (count > 20) {
            clearInterval(animation)
            this.#output.innerText = ''
            this.#textInput.disabled = false
            this.#textInput.value = ''
            this.createNewPrompt()
          }
        }, 100)
      } else {
        this.#output.innerHTML = `¡Por poco!<br>${this.#correctWords}`
      }
    }
  }

  validateNumber(input) {
    const number = this.#currentNumber
    const gender = this.#nounGenders[this.#currentNoun]

    // Convert to lowercase and remove extra spaces
    input = input.toLowerCase().trim().replace(/\s+/g, ' ')

    // Special cases first
    if (number === 100) {
      return input === 'cien'
    }
    if (number === 1000000) {
      return input === 'un millón'
    }

    let words = ''

    // Millions
    const millions = Math.floor(number / 1000000)
    if (millions > 0) {
      if (millions === 1) {
        words += 'un millón '
      } else {
        words += this.getNumberWords(millions, 'm') + ' millones '
      }
    }

    // Thousands
    const thousands = Math.floor((number % 1000000) / 1000)
    if (thousands > 0) {
      if (thousands === 1) {
        words += 'mil '
      } else {
        words += this.getNumberWords(thousands, 'm') + ' mil '
      }
    }

    // Remainder
    const remainder = number % 1000
    if (remainder > 0 || number === 0) {
      words += this.getNumberWords(remainder, gender)
    }

    this.#correctWords = words.trim()
    return input === this.#correctWords
  }

  getNumberWords(n, gender) {
    const units = [
      '',
      'uno',
      'dos',
      'tres',
      'cuatro',
      'cinco',
      'seis',
      'siete',
      'ocho',
      'nueve',
    ]
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
    const tens = [
      '',
      'diez',
      'veinte',
      'treinta',
      'cuarenta',
      'cincuenta',
      'sesenta',
      'setenta',
      'ochenta',
      'noventa',
    ]
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
      words += hundreds[hundred] + ' '
    }

    // Tens and units
    const remainder = n % 100
    if (remainder > 0) {
      if (remainder < 10) {
        let unit = units[remainder]
        // Handle gender for 'uno'/'una'
        if (remainder === 1 && gender === 'f') {
          unit = 'una'
        }
        words += unit
      } else if (remainder < 20) {
        words += teens[remainder - 10]
      } else {
        const ten = Math.floor(remainder / 10)
        const unit = remainder % 10

        if (unit === 0) {
          words += tens[ten]
        } else {
          words += tens[ten] + ' y ' + units[unit]
        }
      }
    }

    return words.trim()
  }
}

const numeros = new Numeros()
