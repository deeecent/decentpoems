// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./DecentPoemsRenderer.sol";
import "./DecentWords.sol";

import "hardhat/console.sol";

contract DecentPoems is DecentPoemsRenderer, ERC721, Ownable {
    using Strings for uint256;

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

    uint256 public constant PAGE_SIZE = 20;
    uint256 public _maxVerses;
    uint256 public _currentRandomSeed;

    uint256 public _auctionDuration = 1 days;
    uint256 public _auctionStartPrice = 1 ether;
    uint256 public _auctionEndPrice = 0.001 ether;

    uint256 public _creatorMintingRoyalty = 5; // %
    address public _creatorAddress;

    event VerseSubmitted(address author, uint256 id);
    event PoemCreated(address author, uint256 id);

    constructor(address decentWords, uint256 maxVerses)
        ERC721("Decent Poems", "POEMS")
    {
        _decentWords = DecentWords(decentWords);
        _currentRandomSeed = uint256(blockhash(block.number - 1));
        _maxVerses = maxVerses;
        _poems.push();
        _creatorAddress = msg.sender;
    }

    modifier onlyMintable(uint256 poemIndex) {
        require(poemIndex < _poems.length - 1, "Invalid poem");
        uint256 elapsedTime = block.timestamp - _poems[poemIndex].createdAt;
        require(elapsedTime <= _auctionDuration, "Auction expired");
        require(_poems[poemIndex].mintedAt == 0, "Poem already minted");
        _;
    }

    // READ

    function getCurrentWord()
        public
        view
        returns (uint256 index, string memory word)
    {
        require(_decentWords.total() > 0, "DecentWords not populated");
        index = _currentRandomSeed % _decentWords.total();
        word = _decentWords.words(index);
    }

    function getCurrentPoem() public view returns (Poem memory) {
        return _poems[_poems.length - 1];
    }

    function getPoem(uint256 index) public view returns (Poem memory) {
        return _poems[index];
    }

    function getPoemFromTokenId(uint256 tokenId)
        public
        view
        returns (Poem memory)
    {
        require(_exists(tokenId), "Non existing token");
        return _poems[_minted[tokenId - 1]];
    }

    function getCurrentPrice(uint256 poemIndex)
        public
        view
        onlyMintable(poemIndex)
        returns (uint256)
    {
        uint256 elapsedTime = block.timestamp - _poems[poemIndex].createdAt;
        return _calculatePrice(elapsedTime);
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

    function getMinted(uint256 page)
        public
        view
        returns (Poem[PAGE_SIZE] memory poems)
    {
        uint256 startingIndex = PAGE_SIZE * page;
        uint256 maxItems = _minted.length >= startingIndex + PAGE_SIZE
            ? PAGE_SIZE
            : _minted.length - startingIndex;
        for (uint256 i = 0; i < maxItems; i++) {
            poems[i] = _poems[_minted[i + startingIndex]];
        }
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
            poemWords[i] = _decentWords.words(poem.wordIndexes[i]);
        }

        return string(_getJSON(poem.verses, poemWords, poem.authors));
    }

    // WRITE

    function safeMint(address to, uint256 poemIndex)
        public
        payable
        onlyMintable(poemIndex)
    {
        uint256 elapsedTime = block.timestamp - _poems[poemIndex].createdAt;
        require(
            msg.value >= _calculatePrice(elapsedTime),
            "Insufficient ether"
        );

        uint256 tokenId = _minted.length + 1;
        _poems[poemIndex].mintedAt = block.timestamp;
        _poems[poemIndex].tokenId = tokenId;
        _minted.push(poemIndex);
        _safeMint(to, tokenId);
        _distributeValue(msg.value, _poems[poemIndex]);
    }

    function submitVerse(
        string memory prefix,
        uint256 wordIndex,
        string memory suffix
    ) public {
        (uint256 currentIndex, string memory currentWord) = getCurrentWord();
        require(wordIndex == currentIndex, "Wrong word");

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

    // Internal

    function _distributeValue(uint256 value, Poem storage poem) internal {
        address[] memory authors = poem.authors;
        uint256 creatorSplit = (value / 100) * _creatorMintingRoyalty;
        payable(_creatorAddress).transfer(creatorSplit);

        uint256 authorSplit = (value - creatorSplit) / authors.length;

        for (uint256 i = 0; i < authors.length; i++) {
            payable(authors[i]).transfer(authorSplit);
        }
    }

    function _calculatePrice(uint256 elapsedTime)
        internal
        view
        returns (uint256)
    {
        return
            _auctionStartPrice -
            (((_auctionStartPrice - _auctionEndPrice) / _auctionDuration) *
                elapsedTime);
    }
}
