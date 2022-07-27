// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./DecentPoemsRenderer.sol";
import "./DecentWords.sol";

contract DecentPoems is DecentPoemsRenderer, ERC721, Ownable {
    using Strings for uint256;

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

    uint256 constant expiration = 1 days;

    DecentWords public _decentWords;

    struct Poem {
        string[] verses;
        address[] authors;
        uint256[] wordIndexes;
        uint256 createdAt;
        uint256 mintedAt;
        uint256 tokenId;
    }

    Poem[] public _poems;
    uint256[] public _minted;

    uint256 constant PAGE_SIZE = 20;
    uint256 public _maxVerses;
    uint256 public _currentRandomSeed;

    event VerseSubmitted(address author, uint256 id);
    event PoemCreated(address author, uint256 id);

    constructor(uint256 maxVerses) ERC721("Decent Poems", "POEMS") {
        //_decentWords = decentWords;
        _currentRandomSeed = uint256(blockhash(block.number - 1));
        _maxVerses = maxVerses;
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

    function safeMint(address to, uint256 poemIndex) public payable {
        uint256 tokenId = _minted.length + 1;
        _poems[poemIndex].mintedAt = block.timestamp;
        _poems[poemIndex].tokenId = tokenId;
        _minted.push(poemIndex);
        _safeMint(to, tokenId);
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
            emit PoemCreated(_msgSender(), _poems.length);
            _poems.push();
        } else {
            emit VerseSubmitted(_msgSender(), _poems.length - 1);
        }

        _currentRandomSeed = uint256(blockhash(block.number - 1));
    }

    function getCurrentPoem() public view returns (Poem memory) {
        return _poems[_poems.length];
    }

    function getPoem(uint256 id) public view returns (Poem memory) {
        return _poems[id];
    }

    function getPoemFromTokenId(uint256 id) public view returns (Poem memory) {
        return _poems[_minted[id]];
    }

    function getMinted(uint256 page)
        public
        view
        returns (Poem[PAGE_SIZE] memory poems)
    {
        uint256 startingIndex = (_minted.length / page) * PAGE_SIZE;
        for (uint256 i = 0; i < PAGE_SIZE; i++) {
            poems[i] = _poems[_minted[i + startingIndex]];
        }
    }

    function getAuctions() public view returns (Poem[] memory) {
        // Cannot be zero because it's initialized in the constructor
        if (_poems.length == 1) {
            Poem[] memory empty;
            return empty;
        }

        uint256 poemsLeft = _poems.length - 2;
        uint256 auctionCount;
        for (
            ;
            _poems[poemsLeft].createdAt > block.timestamp - expiration;
            poemsLeft--
        ) {
            if (_poems[poemsLeft].mintedAt == 0) {
                auctionCount++;
            }

            if (poemsLeft == 0) {
                break;
            }
        }

        Poem[] memory _poemAuctions = new Poem[](auctionCount);
        poemsLeft = _poems.length - 2;
        for (uint256 i = 0; i < auctionCount; poemsLeft--) {
            if (_poems[poemsLeft].mintedAt == 0) {
                _poemAuctions[i++] = _poems[poemsLeft];
            }

            if (poemsLeft == 0) {
                break;
            }
        }

        return _poemAuctions;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        Poem storage poem = _poems[_minted[tokenId]];
        string[] memory poemWords = new string[](_maxVerses);
        for (uint256 i = 0; i < _maxVerses; i++) {
            poemWords[i] = words[poem.wordIndexes[i]];
        }

        return string(_getJSON(poem.verses, poemWords, poem.authors));
    }
}
