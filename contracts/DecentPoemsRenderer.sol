// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DecentPoemsRenderer {
    using Strings for uint256;

    string constant svg =
        "<svg viewBox='0 0 600 600' version='1.1' width='600' height='600' xmlns='http://www.w3.org/2000/svg'><style>text{font-family:'Courier New',Courier,monospace;font-size:35px;color:#000;line-height:1.2em}</style><rect width='100%' height='100%' fill='#e2dde7'/><text x='50' y='90' font-weight='700' font-size='42'>                    </text><text x='50' y='180'>                    </text><text x='50' y='250'>                    </text><text x='50' y='320'>                    </text><text x='50' y='390'>                    </text><text x='50' y='460'>                    </text><text x='50' y='530'>                    </text></svg>";

    function getSVG(string[] memory words) public pure returns (string memory) {
        uint16[7] memory wordPositions = [311, 359, 407, 455, 503, 551, 599];
        bytes memory svgBytes = bytes(svg);
        for (uint256 w = 0; w < words.length; w++) {
            bytes memory wordBytes = bytes(words[w]);
            for (uint256 i = 0; i < wordBytes.length; i++) {
                svgBytes[wordPositions[w] + i] = wordBytes[i];
            }
        }

        return string(svgBytes);
    }

    function getDescription(
        string[] memory verses,
        address[] memory authors,
        address split
    ) public pure returns (string memory) {
        bytes memory description = abi.encodePacked(
            getPoem(verses),
            "\\n\\n-------\\n\\n"
            "Authors:\\n\\n"
        );

        for (uint256 i = 0; i < authors.length; i++) {
            description = abi.encodePacked(
                description,
                "* ",
                Strings.toHexString(uint160(authors[i]), 20),
                "\\n"
            );
        }

        description = abi.encodePacked(
            description,
            "\\n-------\\n\\n0xSplit:\\n",
            "[",
            Strings.toHexString(uint160(split), 20),
            "](",
            "https://app.0xsplits.xyz/accounts/",
            Strings.toHexString(uint160(split), 20),
            "/)",
            "\\n\\nLicense: CC BY-NC-ND 4.0"
        );

        return string(description);
    }

    function getPoem(string[] memory verses)
        public
        pure
        returns (string memory)
    {
        bytes memory poem;
        for (uint256 i = 1; i < verses.length; i++) {
            bytes memory escapedVerse = _escapeString(verses[i]);
            if (i == 1) {
                poem = abi.encodePacked(escapedVerse);
            } else {
                poem = abi.encodePacked(poem, "\\n\\n", escapedVerse);
            }
        }

        return string(poem);
    }

    function getJSON(
        string[] memory verses,
        string[] memory words,
        address[] memory authors,
        address split
    ) public pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        abi.encodePacked(
                            '{"name":"',
                            _escapeString(verses[0]),
                            '",',
                            unicode'"description":"',
                            getDescription(verses, authors, split),
                            '","image":"data:image/svg+xml;base64,',
                            Base64.encode(abi.encodePacked(getSVG(words))),
                            '","attributes":[]}'
                        )
                    )
                )
            );
    }

    function _escapeString(string memory text)
        internal
        pure
        returns (bytes memory)
    {
        bytes memory bText = bytes(text);
        bytes memory escapedText;
        for (uint256 c = 0; c < bText.length; c++) {
            bytes1 char = bText[c];
            if (char == 0x22) {
                escapedText = bytes.concat(escapedText, bytes1(0x5c), char);
            } else if (char == 0x0d) {
                escapedText = bytes.concat(escapedText, "\\r");
            } else if (char == 0x0a) {
                escapedText = bytes.concat(escapedText, "\\n");
            } else {
                escapedText = bytes.concat(escapedText, char);
            }
        }

        return escapedText;
    }
}
