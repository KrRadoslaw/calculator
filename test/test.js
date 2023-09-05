const Calculator = artifacts.require("Calculator");
const BigNumber = require("bignumber.js");

contract("test", accounts => {

    let calculator;

    before(async () => {
        calculator = await Calculator.deployed();
        await calculator.set("34");
    });

    it("add", async () => {
        const valueBefore = new BigNumber(await calculator.value());
        await calculator.add(new BigNumber("1").toString());
        const valueAfter = new BigNumber(await calculator.value());
        assert.equal(
            valueBefore.plus("1").toString(),
            valueAfter.toString()
        );
    });

    it("sub", async () => {
        const valueBefore = new BigNumber(await calculator.value());
        await calculator.sub(new BigNumber("1").toString());
        const valueAfter = new BigNumber(await calculator.value());
        assert.equal(
            valueBefore.minus("1").toString(),
            valueAfter.toString()
        );
    });

    it("mul", async () => {
        const valueBefore = new BigNumber(await calculator.value());
        await calculator.mul(new BigNumber("2").toString());
        const valueAfter = new BigNumber(await calculator.value());
        assert.equal(
            valueBefore.multipliedBy("2").toString(),
            valueAfter.toString()
        );
    });

    it("div", async () => {
        const valueBefore = new BigNumber(await calculator.value());
        await calculator.div(new BigNumber("2").toString());
        const valueAfter = new BigNumber(await calculator.value());
        assert.equal(
            valueBefore.dividedBy("2").toString(),
            valueAfter.toString()
        );
    });
});