import { ethers } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import {
  DecentPoemsRenderer,
  DecentPoemsRenderer__factory,
} from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { base64, fetchJson } from "ethers/lib/utils";

chai.use(solidity);
chai.use(chaiAsPromised);
const { expect } = chai;

const AddressZero = ethers.constants.AddressZero;
const AddressOne = AddressZero.replace(/.$/, "1");

describe("DecentPoemsRender", () => {
  let renderer: DecentPoemsRenderer;
  let alice: SignerWithAddress, bob: SignerWithAddress;

  let authors: string[];
  const verses = [
    "test0",
    "test1",
    "test2",
    "test3",
    "test4",
    "test5",
    "test6",
  ];
  const words = [
    "ameba",
    "cane",
    "zuzzurullone",
    "parziale",
    "quarantadue",
    "no",
    "alberto",
  ];

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();

    const DecentPoemsRendererFactory = (await ethers.getContractFactory(
      "DecentPoemsRenderer",
      alice
    )) as DecentPoemsRenderer__factory;
    renderer = await DecentPoemsRendererFactory.deploy();
    await renderer.deployed();

    authors = [
      alice.address,
      bob.address,
      alice.address,
      alice.address,
      bob.address,
      alice.address,
    ];
  });

  describe("DecentPoemsRenderer", async () => {
    describe("getPoem", async () => {
      it("should not include the first verse (title)", async () => {
        const result = await renderer.getPoem(verses);

        expect(result).to.not.include(verses[0]);
      });

      it("should return verses concatenated by double new lines", async () => {
        const expected = verses
          .slice(1, 7)
          .reduce((verse, poem) => `${verse}\\n\\n${poem}`);

        const result = await renderer.getPoem(verses);

        expect(result).equal(expected);
      });

      it("should escape double quotes", async () => {
        const verses = ["", 'This is a "double quote" string'];

        const result = await renderer.getPoem(verses);

        expect(result).equal('This is a \\"double quote\\" string');
      });

      it("should escape new lines", async () => {
        const verses = ["", "This is a \n new line"];

        const result = await renderer.getPoem(verses);

        expect(result).equal("This is a \\n new line");
      });

      it("should escape carriage returns", async () => {
        const verses = ["", "This is a \r carriage return"];

        const result = await renderer.getPoem(verses);

        expect(result).equal("This is a \\r carriage return");
      });
    });

    describe("getDescription", async () => {
      it("concatenates the list of authors to the poem", async () => {
        const result = await renderer.getDescription(
          verses,
          authors,
          AddressZero
        );

        const expected = "Authors:\\n\\n* ".concat(
          authors.join("\\n* ").toLowerCase()
        );

        expect(result).include(expected);
      });

      it("concatenates the split address", async () => {
        const result = await renderer.getDescription(
          verses,
          authors,
          bob.address
        );

        const expected = `0xSplit:\\n[${bob.address.toLowerCase()}](https://app.0xsplits.xyz/accounts/${bob.address.toLowerCase()}/)`;

        expect(result).include(expected);
      });

      it("concatenates the license at the end", async () => {
        const result = await renderer.getDescription(
          verses,
          authors,
          AddressZero
        );

        const expected = "License: CC BY-NC-ND 4.0";

        expect(result).include(expected);
      });
    });

    describe("getSVG", async () => {
      it("returns the correct svg", async () => {
        const result = await renderer.getSVG(words);

        const correct =
          "<svg viewBox='0 0 600 600' version='1.1' width='600' height='600' xmlns='http://www.w3.org/2000/svg'><style>text{font-family:'Courier New',Courier,monospace;font-size:35px;color:#000;line-height:1.2em}</style><rect width='100%' height='100%' fill='#e2dde7'/><text x='50' y='90' font-weight='700' font-size='42'>ameba               </text><text x='50' y='180'>cane                </text><text x='50' y='250'>zuzzurullone        </text><text x='50' y='320'>parziale            </text><text x='50' y='390'>quarantadue         </text><text x='50' y='460'>no                  </text><text x='50' y='530'>alberto             </text></svg>";

        expect(result).equal(correct);
      });
    });

    describe("getJSON", async () => {
      it("should return a valid JSON", async () => {
        const funkyVerses = [
          "Hello \n World",
          "Hello \n World",
          "Hello \r World",
          'Hello " World',
        ];
        const data = await renderer.getJSON(
          funkyVerses,
          words,
          authors,
          bob.address
        );

        const result = await fetchJson(data);

        expect(result).to.have.property("name");
        expect(result).to.have.property("description");
        expect(result).to.have.property("image");
        expect(result).to.have.property("attributes");
      });

      it("should use first verse as name", async () => {
        const data = await renderer.getJSON(verses, [], [], AddressZero);

        const result = await fetchJson(data);

        expect(result["name"]).equal(verses[0]);
      });

      it("should escape name", async () => {
        const data = await renderer.getJSON(
          ['Test \n \r "'],
          [],
          [],
          AddressZero
        );

        const json = Buffer.from(data.slice(29), "base64").toString();

        expect(json.slice(9, 22)).equal('Test \\n \\r \\"');
      });
    });
  });
});
