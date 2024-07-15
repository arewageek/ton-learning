import {
  Cell,
  StateInit,
  beginCell,
  contractAddress,
  storeStateInit,
  toNano,
} from "@ton/core";
import { hex } from "../build/main.compiled.json";
import qs from "qs";
import qrcode from "qrcode-terminal";
import dotenv from "dotenv";

dotenv.config();

async function deployContract() {
  console.log(
    "====================================================================================================="
  );

  console.log(
    `Deploying main.fc contract to the TON ${
      process.env.TESTNET ? "Testnet" : "Mainnet"
    }...`
  );

  const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
  const dataCell = new Cell();

  const initState: StateInit = {
    code: codeCell,
    data: dataCell,
  };

  const initStateBuilder = beginCell();
  storeStateInit(initState)(initStateBuilder);
  const initStateCell = initStateBuilder.endCell();

  const address = contractAddress(0, {
    code: codeCell,
    data: dataCell,
  });

  console.log(`Contract will be deployed to ${address.toString()}`);

  console.log("=========================================");
  console.log(
    `Please scan the QR code below to deploy contract to ${
      process.env.TESTNET ? "testnet" : "mainnet"
    }`
  );
  console.log("=========================================");

  const link = `https://${
    process.env.TESTNET ? "test." : ""
  }tonhub.com/transfer/${address.toString({
    testOnly: process.env.TESTNET ? true : false,
  })}?${qs.stringify({
    text: "Deploy Contract",
    amount: toNano("0.05").toString(10),
    init: initStateCell.toBoc({ idx: false }).toString("base64"),
  })}`;

  qrcode.generate(
    link,
    {
      small: true,
    },
    (code) => {
      console.log(code);
    }
  );
}

deployContract();
