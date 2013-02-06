
module.exports = function debug () {
  if (process.env.DEBUG) console.log.apply(console, ['Restraints DEBUG :'].concat([].slice.call(arguments)))
}
