import { expect } from "chai";
import {
  fr_add,
  FrWrapper,
  ElementWrapper,
  element_add,
} from "../../outputs/out/rust_verkle_wasm";

it("modular arithmetic smoke test", async () => {
  const a = FrWrapper.fromDecimalString("27");
  const b = FrWrapper.fromDecimalString("20");
  const expected = FrWrapper.fromDecimalString("47").toHexString();

  const got = fr_add(a, b).toHexString();
  expect(got).to.equal(expected);
});

it("point addition smoke test", async () => {
  const a = ElementWrapper.generator();
  const b = ElementWrapper.generator();

  const scalar = FrWrapper.fromDecimalString("2");

  const expected = ElementWrapper.scalarMul(
    ElementWrapper.generator(),
    scalar,
  ).toHexString();
  const got = element_add(a, b).toHexString();
  expect(got).to.equal(expected);
});
