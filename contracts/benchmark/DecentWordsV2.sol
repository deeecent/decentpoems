// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DecentWordsV2 is Ownable {
    address private _owner;

    string[25322] _words;
    uint256 _countAdded;

    function addWords(string[] memory words) public onlyOwner {
        uint256 length = words.length;
        for (uint256 i = 0; i < length; i++) {
            _words[_countAdded + i] = words[i];
        }
        _countAdded += length;
    }

    function total() public view returns (uint256) {
        return _countAdded;
    }
}
