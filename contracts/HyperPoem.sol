// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract HyperPoem {
    uint256 number;
    address private _owner;
    uint256 constant _wordCount = 25322;

    uint256[_wordCount] _wordsInt;
    string[_wordCount] _wordsStr;

    event Store(address indexed from, uint256 num);

    constructor() {
        _owner = msg.sender;
    }

    function addWords(string[] memory words, uint256 fromIndex) public {
        uint256 length = words.length;
        for (uint256 i = 0; i < length; i++) {
            _wordsStr[fromIndex + i] = words[i];
        }
    }

    function addOpt(uint256[] memory words, uint256 fromIndex) public {
        uint256 length = words.length;
        for (uint256 i = 0; i < length; i++) {
            _wordsInt[fromIndex + i] = words[i];
        }
    }

    function getWord(uint256 index) public view returns (string memory) {
        return string(abi.encodePacked(_wordsInt[index]));
    }
}
