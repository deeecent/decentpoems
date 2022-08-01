// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DecentWordsV1 is Ownable {
    address private _owner;

    string[] public words;

    function addWords(string[] memory _words) public onlyOwner {
        uint256 length = _words.length;
        for (uint256 i = 0; i < length; i++) {
            words.push(_words[i]);
        }
    }

    function total() public view returns (uint256) {
        return words.length;
    }
}
