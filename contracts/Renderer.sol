// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./DecentPoemsRenderer.sol";

contract Renderer is DecentPoemsRenderer {
    function getSVG(string[] memory words) public view returns (bytes memory) {
        return super._getSVG(words);
    }

    function getJSON(
        uint256 tokenId,
        string[] memory verses,
        string[] memory words
    ) public view returns (bytes memory) {
        return super._getJSON(tokenId, verses, words);
    }
}
