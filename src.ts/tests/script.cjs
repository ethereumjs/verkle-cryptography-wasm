const { loadVerkleCrypto, zeroCommitment } = require('../../dist/cjs/index')

const main = async () => {
  await loadVerkleCrypto()
  console.log(zeroCommitment)
}

main()
