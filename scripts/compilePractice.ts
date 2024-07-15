import * as fs from "fs";
import process from "process";
import { Address, Cell } from "@ton/core";
import { compileFunc } from "@ton-community/func-js";

async function compileScript() {
  console.log(
    "==================================================================="
  );
  console.log("Compile script is running,");
  const compileResult = await compileFunc({
    targets: ["./contracts/practice.fc"],
    sources: (x) => fs.readFileSync(x).toString("utf8"),
  });

  if (compileResult.status === "error") {
    console.log("- OOPS AN ERROR OCCURRED!!");
    console.log(compileResult.message);

    process.exit(1);
  }

  console.log("- Compilation successful");

  const hexArtifact = "build/main.compiled-practice.json";

  fs.writeFileSync(
    hexArtifact,
    JSON.stringify({
      hex: Cell.fromBoc(Buffer.from(compileResult.codeBoc, "base64"))[0]
        .toBoc()
        .toString("hex"),
    })
  );

  const addyConverted = Address.parse(
    "0:a3935861f79daf59a13d6d182e1640210c02f98e3df18fda74b8f5ab141abf18"
  );
  console.log({ addyConverted });

  console.log("- Compiled code saved to ", hexArtifact);
}

compileScript();
