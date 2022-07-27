// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DecentPoemsRenderer {
    using Strings for uint256;
    uint256[7] wordPositions = [236, 284, 332, 380, 428, 476, 524];

    string constant svg =
        "<svg width='600' height='600'><style>text{font-family:'Courier New',Courier,monospace;font-size:35px;color:#000;line-height:1.2em}</style><rect width='100%' height='100%' fill='beige'/><text x='50' y='90' font-weight='700' font-size='42'>                    </text><text x='50' y='180'>                    </text><text x='50' y='250'>                    </text><text x='50' y='320'>                    </text><text x='50' y='390'>                    </text><text x='50' y='460'>                    </text><text x='50' y='530'>                    </text></svg>";

    function _getSVG(string[] memory words)
        internal
        view
        returns (bytes memory)
    {
        bytes memory svgBytes = bytes(svg);
        for (uint256 w = 0; w < words.length; w++) {
            bytes memory wordBytes = bytes(words[w]);
            for (uint256 i = 0; i < wordBytes.length; i++) {
                svgBytes[wordPositions[i]] = wordBytes[i];
            }
        }

        return svgBytes;
    }

    function _getDescription(string[] memory verses, string[] memory authors)
        internal
        view
        returns (bytes memory)
    {
        string memory description;
    }

    function _getJSON(
        uint256 tokenId,
        string[] memory verses,
        string[] memory words,
        address[] memory authors
    ) internal view returns (bytes memory) {
        return
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(
                    abi.encodePacked(
                        '{"name":"Decent poem #',
                        tokenId.toString(),
                        '",',
                        unicode'"description":"Decent Poems ',
                        unicode'License: CC BY-NC-ND 4.0",',
                        '"image":"data:image/svg+xml;base64,',
                        Base64.encode(_getSVG(words)),
                        '"}'
                    )
                )
            );
    }
}
