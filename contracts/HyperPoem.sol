// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract HyperPoem {
    uint256 number;
    address private _owner;

    uint256[] _words;

    event Store(address indexed from, uint256 num);

    constructor() {
        _owner = msg.sender;
    }

    /*function addWords(string[] memory words) public {
        uint256 length = words.length;
        for (uint i = 0; i < length; i++) {
            _words.push(words[i]);
        }
    }*/

    function addOpt(uint256[] memory words) public {
        _words = words;
        //uint256 length = words.length;
        //for (uint i = 0; i < length; i++) {
        //    _words.push(words[i]);
        //}
    }

    function getWord(uint256 index) public view returns (string memory) {
        return string(abi.encodePacked(_words[index]));
    }
}
