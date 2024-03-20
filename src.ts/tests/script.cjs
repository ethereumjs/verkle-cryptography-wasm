const { initVerkleWasm, Context, zeroCommitment } = require("../../dist/cjs/index");

const main = async () => {
    const verkle = await initVerkleWasm()
    const ffi = new Context()
    console.log(zeroCommitment())
}

main()