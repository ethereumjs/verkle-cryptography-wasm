const { initVerkleWasm, zeroCommitment } = require('../../dist/cjs/index')

const main = async () => {
  await initVerkleWasm()
  console.log(zeroCommitment())
}

main()
