// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./DecentPoemsRenderer.sol";

contract Renderer is DecentPoemsRenderer, ERC721 {
    uint256 currentTokenId = 0;

    string[] _verses = [
        "Solidity 0.8.14",
        "Solidity 0.8.14 is not fully supported yet. You can still use Hardhat, but some features, like stack traces, might not work correctly.",
        "Solidity 0.8.14 is not fully supported yet. You can still use Hardhat, but some features, like stack traces, might not work correctly.",
        "Solidity 0.8.14 is not fully supported yet. You can still use Hardhat, but some features, like stack traces, might not work correctly.",
        "Solidity 0.8.14 is not fully supported yet. You can still use Hardhat, but some features, like stack traces, might not work correctly.",
        "Solidity 0.8.14 is not fully supported yet. You can still use Hardhat, but some features, like stack traces, might not work correctly.",
        "Solidity 0.8.14 is not fully supported yet. You can still use Hardhat, but some features, like stack traces, might not work correctly."
    ];

    string[] _words = [
        "solidity",
        "supported",
        "still",
        "hardhat",
        "correctly",
        "use"
    ];

    address[] _authors;

    constructor() ERC721("Test", "TS") {
        _authors.push(msg.sender);
        _authors.push(msg.sender);
        _authors.push(msg.sender);
        _authors.push(msg.sender);
        _authors.push(msg.sender);
        _authors.push(msg.sender);

        _safeMint(msg.sender, ++currentTokenId);
    }

    function getSVG(string[] memory words) public view returns (string memory) {
        return string(super._getSVG(words));
    }

    function mint() public {
        _safeMint(msg.sender, ++currentTokenId);
    }

    function getJSON(
        string[] memory verses,
        string[] memory words,
        address[] memory authors
    ) public view returns (string memory) {
        return string(super._getJSON(verses, words, authors));
    }

    function getDescription(string[] memory verses, address[] memory authors)
        public
        pure
        returns (string memory)
    {
        return string(super._getDescription(verses, authors));
    }

    function tokenURI(uint256)
        public
        view
        virtual
        override
        returns (string memory)
    {
        return getJSON(_verses, _words, _authors);
    }
}
