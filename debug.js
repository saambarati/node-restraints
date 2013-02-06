
module.exports = function debug () {
  if (process.env.DEBUG) console.log.apply(console, ['DEBUG'].concat([].slice.call(arguments)))
}
