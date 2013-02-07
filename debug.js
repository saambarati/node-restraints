
module.exports = function debug(maybeFunc) {
  if (process.env.DEBUG) {
    if (typeof maybeFunc === 'function') maybeFunc()
    else console.log.apply(console, ['Restraints DEBUG :'].concat([].slice.call(arguments)))
  }
}
