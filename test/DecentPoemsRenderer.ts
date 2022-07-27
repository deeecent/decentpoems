import { ethers } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { Renderer, Renderer__factory } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { readFileSync, readSync } from "fs";
import { BigNumber, wordlists } from "ethers";
import { getEVMTimestamp, mineEVMBlock } from "./evm";

chai.use(solidity);
chai.use(chaiAsPromised);
const { expect } = chai;

const AddressZero = ethers.constants.AddressZero;
const AddressOne = AddressZero.replace(/.$/, "1");

describe("DecentPoemsRender", () => {
  let renderer: Renderer;
  let alice: SignerWithAddress, bob: SignerWithAddress;

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();

    const RendererFactory = (await ethers.getContractFactory(
      "Renderer",
      alice
    )) as Renderer__factory;
    renderer = await RendererFactory.deploy();
    await renderer.deployed();
  });

  describe("RendererFactory", async () => {
    it("returns the correct svg", async () => {
      const result = await renderer.getSVG([
        "ameba",
        "cane",
        "zuzzurullone",
        "parziale",
        "quarantadue",
        "no",
        "alberto",
      ]);

      const correct =
        "<svg width='600' height='600'><style>text{font-family:'Courier New',Courier,monospace;font-size:35px;color:#000;line-height:1.2em}</style><rect width='100%' height='100%' fill='beige'/><text x='50' y='90' font-weight='700' font-size='42'>               </text><text x='50' y='180'>cane                </text><text x='50' y='250'>zuzzurullone        </text><text x='50' y='320'>parziale            </text><text x='50' y='390'>quarantadue         </text><text x='50' y='460'>no                  </text><text x='50' y='530'>alberto             </text></svg>";

      expect(result).equal(correct);
    });

    it("returns the correct description", async () => {
      const result = await renderer.getDescription(
        [
          "Solidity 0.8.14 is not fully supported yet. You can still use Hardhat, but some features, like stack traces, might not work correctly.",
          "Solidity 0.8.14 is not fully supported yet. You can still use Hardhat, but some features, like stack traces, might not work correctly.",
          "Solidity 0.8.14 is not fully supported yet. You can still use Hardhat, but some features, like stack traces, might not work correctly.",
          "Solidity 0.8.14 is not fully supported yet. You can still use Hardhat, but some features, like stack traces, might not work correctly.",
          "Solidity 0.8.14 is not fully supported yet. You can still use Hardhat, but some features, like stack traces, might not work correctly.",
          "Solidity 0.8.14 is not fully supported yet. You can still use Hardhat, but some features, like stack traces, might not work correctly.",
        ],
        [
          alice.address,
          bob.address,
          alice.address,
          alice.address,
          bob.address,
          alice.address,
        ]
      );

      console.log(result);
    });
  });
});
