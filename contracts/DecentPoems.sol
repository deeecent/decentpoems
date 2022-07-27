// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DecentWords.sol";

contract DecentPoems is ERC721, Ownable {
    address private _owner;
    uint256 constant _wordCount = 3;

    string[_wordCount] public words;

    function addWords(string[] memory _words, uint256 fromIndex)
        public
        onlyOwner
    {
        uint256 length = _words.length;
        for (uint256 i = 0; i < length; i++) {
            words[fromIndex + i] = _words[i];
        }
    }

    function total() public view returns (uint256) {
        return words.length;
    }

    uint256 number;

    DecentWords public _decentWords;

    struct Poem {
        string[] verses;
        address[] authors;
        uint256[] wordIndexes;
        uint256 createdAt;
        uint256 mintedAt;
    }

    Poem[] public _poems;
    /*
    Poem[] public _poemsMinted;
    Poem[] public _poemsAuction;
    */

    uint256 public _maxVerses;
    uint256 public _currentRandomSeed;

    constructor(uint256 maxVerses) ERC721("Decent Poems", "POEMS") {
        //_decentWords = decentWords;
        _currentRandomSeed = uint256(blockhash(block.number - 1));
        _maxVerses = maxVerses;
        /*
        Poem memory currentPoem;
        poems.push(currentPoem);
        */
        _poems.push();
    }

    function getCurrentWord()
        public
        view
        returns (uint256 index, string memory word)
    {
        index = _currentRandomSeed % total();
        word = words[index];
    }

    function submitVerse(
        string memory prefix,
        uint256 wordIndex,
        string memory suffix
    ) public {
        (uint256 currentIndex, string memory currentWord) = getCurrentWord();
        require(wordIndex == currentIndex, "fail");

        Poem storage poem = _poems[_poems.length - 1];
        string memory verse = string(
            abi.encodePacked(prefix, currentWord, suffix)
        );

        poem.verses.push(verse);
        poem.authors.push(_msgSender());
        poem.wordIndexes.push(currentIndex);

        if (poem.verses.length == _maxVerses) {
            poem.createdAt = block.timestamp;
            // Update first valid index
            _poems.push();
        }

        _currentRandomSeed = uint256(blockhash(block.number - 1));
    }

    function getAuctions() public view returns (Poem[] memory) {
        return _poems;
    }
}
