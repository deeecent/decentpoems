// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DecentWords is Ownable {
    address private _owner;
    uint256 constant _wordCount = 25322;
    uint256 _lastIndex = 0;

    string[_wordCount] public words;

    function addWords(string[] memory _words) public onlyOwner {
        uint256 length = _words.length;
        for (uint256 i = 0; i < length; i++) {
            words[_lastIndex + i] = _words[i];
        }
        _lastIndex = _lastIndex + length;
    }

    function total() public view returns (uint256) {
        return _lastIndex;
    }
}
