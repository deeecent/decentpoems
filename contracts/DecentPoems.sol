// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

import "./ISplitMain.sol";
import "./DecentPoemsRenderer.sol";
import "./DecentWords.sol";

import "hardhat/console.sol";

contract DecentPoems is ERC721Royalty, Ownable, VRFConsumerBaseV2 {
    using Strings for uint256;

    DecentWords public _decentWords;
    DecentPoemsRenderer public _renderer;
    ISplitMain public _splitter;

    struct Poem {
        string[] verses;
        address[] authors;
        uint256[] wordIndexes;
        uint256 createdAt;
        uint256 mintedAt;
        uint256 tokenId;
        address split;
    }

    struct Contribution {
        uint32 percentage;
        uint32 count;
    }
    mapping(uint256 => mapping(address => Contribution)) _contributions;

    Poem[] public _poems;
    uint256[] public _minted;

    uint256 public constant PAGE_SIZE = 20;
    uint256 public _maxVerses;
    uint256 public _currentRandomSeed;
    bool public _useVRF = false;

    uint256 public _auctionDuration = 7 days;
    uint256 public _auctionStartPrice = 777 ether;
    uint256 public _auctionEndPrice = 1 ether;

    uint32 public constant PERCENTAGE_SCALE = 1e6; // 100%
    uint32 public _creatorRoyalty = 5 * 1e4; // 5%
    uint256 public _saleRoyalty = 5 * 1e4;
    uint32 public _distributorFee = 1e3; // 0.1%
    address public _creatorAddress;

    // VRF Parameters
    uint64 public immutable _vrfSubscriptionId;
    VRFCoordinatorV2Interface immutable _vrfCoordinator;
    bytes32 immutable _vrfKeyHash;
    uint32 _vrfCallbackGasLimit = 100000;
    uint16 _vrfRequestConfirmations = 3;
    uint32 _vrfNumWords = 1;

    event VerseSubmitted(address author, uint256 id);
    event PoemCreated(address author, uint256 id);
    event WordGenerated(uint256 randomSeed);

    constructor(
        address decentWordsAddress,
        address rendererAddress,
        address splitterAddress,
        uint256 maxVerses,
        address vrfCoordinatorAddress,
        uint64 vrfSubscriptionId,
        bytes32 vrfKeyHash
    ) ERC721("Decent Poems", "POEMS") VRFConsumerBaseV2(vrfCoordinatorAddress) {
        _decentWords = DecentWords(decentWordsAddress);
        _renderer = DecentPoemsRenderer(rendererAddress);
        _splitter = ISplitMain(splitterAddress);
        _maxVerses = maxVerses;
        _poems.push();
        _creatorAddress = msg.sender;

        _vrfSubscriptionId = vrfSubscriptionId;
        _vrfKeyHash = vrfKeyHash;
        _vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorAddress);
        _resetRandomSeed();
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
        require(_currentRandomSeed > 0, "Word not generated yet");
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

    function getAuctions()
        public
        view
        returns (uint256[] memory, Poem[] memory)
    {
        // Cannot be zero because it's initialized in the constructor
        if (_poems.length == 1) {
            uint256[] memory emptyIds;
            Poem[] memory emptyPoems;
            return (emptyIds, emptyPoems);
        }

        uint256 poemsLeft = _poems.length - 2;
        uint256 auctionCount;
        for (
            ;
            _poems[poemsLeft].createdAt > block.timestamp - _auctionDuration;
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
        uint256[] memory _poemIds = new uint256[](auctionCount);
        poemsLeft = _poems.length - 2;
        for (uint256 i = 0; i < auctionCount; poemsLeft--) {
            if (_poems[poemsLeft].mintedAt == 0) {
                _poemAuctions[i] = _poems[poemsLeft];
                _poemIds[i] = poemsLeft;
                i++;
            }

            if (poemsLeft == 0) {
                break;
            }
        }

        return (_poemIds, _poemAuctions);
    }

    function getMinted(uint256 page)
        public
        view
        returns (Poem[PAGE_SIZE] memory poems)
    {
        if (_minted.length > 0 && PAGE_SIZE * page <= _minted.length) {
            uint256 startingIndex = _minted.length - PAGE_SIZE * page;
            uint256 maxItems = PAGE_SIZE >= startingIndex
                ? startingIndex
                : PAGE_SIZE;
            for (uint256 i = startingIndex; i > startingIndex - maxItems; i--) {
                poems[startingIndex - i] = _poems[_minted[i - 1]];
            }
        }
    }

    function poemURI(uint256 poemIndex) public view returns (string memory) {
        return _renderPoem(_poems[poemIndex]);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return _renderPoem(getPoemFromTokenId(tokenId));
    }

    // WRITE
    function setCreator(address creatorAddress) public onlyOwner {
        _creatorAddress = creatorAddress;
    }

    function setFees(
        uint32 creatorRoyalty,
        uint256 saleRoyalty,
        uint32 distributorFee
    ) public onlyOwner {
        _creatorRoyalty = creatorRoyalty;
        _saleRoyalty = saleRoyalty;
        _distributorFee = distributorFee;
    }

    function setAuctionParams(
        uint256 auctionDuration,
        uint256 auctionStartPrice,
        uint256 auctionEndPrice
    ) public onlyOwner {
        _auctionDuration = auctionDuration;
        _auctionStartPrice = auctionStartPrice;
        _auctionEndPrice = auctionEndPrice;
    }

    function setRenderer(address renderer) external onlyOwner {
        _renderer = DecentPoemsRenderer(renderer);
    }

    function setWords(address decentWords) external onlyOwner {
        _decentWords = DecentWords(decentWords);
    }

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
        _poems[poemIndex].split = _createSplit(_creatorAddress, poemIndex);
        _setTokenRoyalty(
            tokenId,
            _poems[poemIndex].split,
            uint96(_saleRoyalty)
        );
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

        if (poem.verses.length == 0) {
            _contributions[_poems.length - 1][_creatorAddress]
                .percentage = _creatorRoyalty;
            _contributions[_poems.length - 1][_creatorAddress].count = 1;
        }

        poem.verses.push(verse);
        poem.authors.push(_msgSender());
        poem.wordIndexes.push(currentIndex);
        _contributions[_poems.length - 1][_msgSender()].percentage +=
            (PERCENTAGE_SCALE - _creatorRoyalty) /
            uint32(_maxVerses);
        _contributions[_poems.length - 1][_msgSender()].count++;

        emit VerseSubmitted(_msgSender(), _poems.length - 1);

        if (poem.verses.length == _maxVerses) {
            poem.createdAt = block.timestamp;
            emit PoemCreated(_msgSender(), _poems.length);
            _poems.push();
        }

        _resetRandomSeed();
    }

    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        _currentRandomSeed = randomWords[0];
        emit WordGenerated(_currentRandomSeed);
    }

    function useVRF(bool flag) external onlyOwner {
        _useVRF = flag;
    }

    // Emergency, in case VRF fails
    function resetRandomSeed() external onlyOwner {
        _resetRandomSeed();
    }

    // Internal
    function _resetRandomSeed() internal {
        if (_useVRF) {
            (uint256 balance, , , ) = _vrfCoordinator.getSubscription(
                _vrfSubscriptionId
            );
            if (balance >= 1 ether) {
                _currentRandomSeed = 0;
                _requestSeed();

                return;
            }
        }

        _currentRandomSeed = uint256(blockhash(block.number - 1));
        emit WordGenerated(_currentRandomSeed);
    }

    function _requestSeed() internal {
        _vrfCoordinator.requestRandomWords(
            _vrfKeyHash,
            _vrfSubscriptionId,
            _vrfRequestConfirmations,
            _vrfCallbackGasLimit,
            _vrfNumWords
        );
    }

    function _renderPoem(Poem memory poem)
        internal
        view
        returns (string memory)
    {
        string[] memory poemWords = new string[](_maxVerses);
        for (uint256 i = 0; i < _maxVerses; i++) {
            poemWords[i] = _decentWords.words(poem.wordIndexes[i]);
        }

        return
            _renderer.getJSON(poem.verses, poemWords, poem.authors, poem.split);
    }

    function _feeDenominator() internal pure virtual override returns (uint96) {
        return uint96(PERCENTAGE_SCALE);
    }

    function _sort(address[] memory data) internal pure {
        uint length = data.length;
        for (uint i = 1; i < length; i++) {
            address key = data[i];
            int j = int(i) - 1;
            while (data[uint(j)] > key) {
                data[uint(j) + 1] = data[uint(j)];
                j--;
                if (j < 0) {
                    break;
                }
            }
            data[uint(j + 1)] = key;
        }
    }

    function _createSplit(address creator, uint256 poemIndex)
        internal
        returns (address)
    {
        address[] storage authors = _poems[poemIndex].authors;
        uint256 totalRecipients = authors.length + 1;

        address[] memory recipients = new address[](totalRecipients);
        for (uint256 i = 0; i < totalRecipients - 1; i++) {
            recipients[i] = authors[i];
        }
        recipients[totalRecipients - 1] = creator;

        _sort(recipients);

        uint256 uniqueRecipientsCount = totalRecipients;
        address lastChecked = address(0);
        for (uint256 i = 0; i < totalRecipients; i++) {
            if (recipients[i] > lastChecked) {
                uniqueRecipientsCount -= (_contributions[poemIndex][
                    recipients[i]
                ].count - 1);
                lastChecked = recipients[i];
            }
        }

        address[] memory uniqueRecipients = new address[](
            uniqueRecipientsCount
        );
        lastChecked = address(0);
        uint256 added = 0;
        for (uint256 i = 0; i < totalRecipients; i++) {
            if (recipients[i] > lastChecked) {
                uniqueRecipients[added] = recipients[i];
                lastChecked = recipients[i];
                added++;
            }
        }

        uint32[] memory percentAllocations = new uint32[](
            uniqueRecipientsCount
        );
        uint32 accumulated;
        for (uint256 i = 0; i < uniqueRecipientsCount; i++) {
            percentAllocations[i] = _contributions[poemIndex][
                uniqueRecipients[i]
            ].percentage;
            accumulated += percentAllocations[i];
        }

        // Round up to 100%
        percentAllocations[0] += PERCENTAGE_SCALE - accumulated;

        return
            _splitter.createSplit(
                uniqueRecipients,
                percentAllocations,
                _distributorFee,
                address(0)
            );
    }

    function _distributeValue(uint256 value, Poem storage poem) internal {
        address[] memory authors = poem.authors;
        uint256 creatorSplit = (value / PERCENTAGE_SCALE) * _creatorRoyalty;
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
