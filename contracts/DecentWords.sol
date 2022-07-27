// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DecentWords is Ownable {
    address private _owner;
    uint256 constant _wordCount = 25322;

    string[_wordCount] public words;

    function addWords(string[] memory _words, uint256 fromIndex)
        public
        onlyOwner
    {
        uint256 length = words.length;
        for (uint256 i = 0; i < length; i++) {
            words[fromIndex + i] = _words[i];
        }
    }

    function total() public view returns (uint256) {
        return words.length;
    }
}