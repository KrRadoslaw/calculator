// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Calculator {
    using SafeMath for uint;

    event ValueChanged(uint newValue);

    uint public value;

    function set(uint calcValue) external {
        _update(calcValue);
    }

    function add(uint calcValue) external {
        _update(value.add(calcValue));
    }

    function sub(uint calcValue) external {
        _update(value.sub(calcValue));
    }

    function mul(uint calcValue) external {
        _update(value.mul(calcValue));
    }

    function div(uint calcValue) external {
        _update(value.div(calcValue));
    }

    function _update(uint newValue) private {
        value = newValue;

        emit ValueChanged(newValue);
    }
}
