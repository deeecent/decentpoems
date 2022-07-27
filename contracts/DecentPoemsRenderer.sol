// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DecentPoemsRenderer {
    using Strings for uint256;
    uint256[7] wordPositions = [309, 357, 405, 453, 501, 549, 597];

    string constant svg =
        "<svg viewBox='0 0 600 600' version='1.1' width='600' height='600' xmlns='http://www.w3.org/2000/svg'><style>text{font-family:'Courier New',Courier,monospace;font-size:35px;color:#000;line-height:1.2em}</style><rect width='100%' height='100%' fill='beige'/><text x='50' y='90' font-weight='700' font-size='42'>                    </text><text x='50' y='180'>                    </text><text x='50' y='250'>                    </text><text x='50' y='320'>                    </text><text x='50' y='390'>                    </text><text x='50' y='460'>                    </text><text x='50' y='530'>                    </text></svg>";

    function _getSVG(string[] memory words)
        internal
        view
        returns (bytes memory)
    {
        bytes memory svgBytes = bytes(svg);
        for (uint256 w = 0; w < words.length; w++) {
            bytes memory wordBytes = bytes(words[w]);
            for (uint256 i = 0; i < wordBytes.length; i++) {
                svgBytes[wordPositions[w] + i] = wordBytes[i];
            }
        }

        return svgBytes;
    }

    function _getDescription(string[] memory verses, address[] memory authors)
        internal
        pure
        returns (bytes memory description)
    {
        for (uint256 i = 1; i < verses.length; i++) {
            description = abi.encodePacked(description, verses[i], "\\n\\n");
        }

        description = abi.encodePacked(description, "Authors:\\n\\n");

        for (uint256 i = 0; i < authors.length; i++) {
            description = abi.encodePacked(
                description,
                "- ",
                Strings.toHexString(uint160(authors[i]), 20),
                "\\n"
            );
        }
    }

    function _getJSON(
        string[] memory verses,
        string[] memory words,
        address[] memory authors
    ) internal view returns (bytes memory) {
        return
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(
                    abi.encodePacked(
                        '{"name":"',
                        verses[0],
                        '",',
                        unicode'"description":"',
                        _getDescription(verses, authors),
                        unicode'\\n\\nLicense: CC BY-NC-ND 4.0",',
                        '"image":"data:image/svg+xml;base64,',
                        Base64.encode(_getSVG(words)),
                        '"}'
                    )
                )
            );
    }
}
