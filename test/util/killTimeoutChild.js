/* eslint-disable no-console */
process.on('SIGINT', function () {
  console.log('child got SIGINT')
})
setTimeout(function () {
  console.log('child is still alive')
}, 3000)
process.send({ready: true})
