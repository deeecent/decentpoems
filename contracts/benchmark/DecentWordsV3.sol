// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DecentWordsV3 is Ownable {
    address private _owner;

    uint256[25322] _words;
    uint256 _countAdded;

    function addWords(uint256[] memory words) public onlyOwner {
        uint256 length = words.length;
        for (uint256 i = 0; i < length; i++) {
            _words[_countAdded + i] = words[i];
        }

        _countAdded += length;
    }

    function total() public view returns (uint256) {
        return _countAdded;
    }

    function getWord(uint256 wordIndex) public view returns (string memory) {
        return string(abi.encodePacked(_words[wordIndex]));
    }
}
