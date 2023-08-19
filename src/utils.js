const { random } = require('lodash')

const getRandomDateTime = () => {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const randomTimestamp = random(startOfDay.getTime(), endOfDay.getTime())
  const randomDateTime = new Date(randomTimestamp)

  return randomDateTime.toISOString()
}

const cronLog = (log) => console.log(`${new Date()}: ${log}`)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = { getRandomDateTime, cronLog, sleep }
