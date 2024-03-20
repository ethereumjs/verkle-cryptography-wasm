const { initVerkleWasm } = require("../../dist/cjs/index");

const main = async () => {
    const verkle = await initVerkleWasm()
    const ffi = new verkle.Context()
    console.log(verkle.zeroCommitment())
}

main()