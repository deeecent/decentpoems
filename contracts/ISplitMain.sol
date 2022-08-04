// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

interface ISplitMain {
    function createSplit(
        address[] calldata,
        uint32[] calldata,
        uint32,
        address
    ) external returns (address);
}
