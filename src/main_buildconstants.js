
const fs = require("fs");
const path = require("path");
const { buildPoseidonGolden,log2 } = require("@0xpolygonhermez/zkevm-commonjs");
const buildPoseidonBN128 = require("circomlibjs").buildPoseidon;

const version = require("../package").version;

const { exportMerkleGroupMultipol } = require("./binfiles.js");

const { extendPol } = require("./polutils");

const Merkle = require("./merkle.js");
const MerkleGroupMultipol = require("./merkle_group_multipol.js");
const starkStruct = require("./starkstruct");

const smArith = require("./sm/sm_arith/sm_arith.js");
const smBinary = require("./sm/sm_binary.js");
const smByte4 = require("./sm/sm_byte4.js");
const smGlobal = require("./sm/sm_global.js");
const smKeccakF = require("./sm/sm_keccakf/sm_keccakf.js");
const smMain = require("./sm/sm_main/sm_main.js");
const smMemAlign = require("./sm/sm_mem_align.js");
const smMem = require("./sm/sm_mem.js");
const smNine2One = require("./sm/sm_nine2one.js");
const smNormGate9 = require("./sm/sm_norm_gate9.js");
const smPaddingKK = require("./sm/sm_padding_kk.js");
const smPaddingKKBit = require("./sm/sm_padding_kkbit.js");
const smPaddingPG = require("./sm/sm_padding_pg.js");
const smPoseidonG = require("./sm/sm_poseidong.js");
const smRom = require("./sm/sm_rom.js");
const smStorage = require("./sm/sm_storage/sm_storage.js");

const { newConstantPolsArray, compile } = require("@0xpolygonhermez/pilcom");
const { F1Field } = require("ffjavascript");

const argv = require("yargs")
    .version(version)
    .usage("zkprover -r <rom.json> -o <constant.bin|json>")
    .alias("r", "rom")
    .alias("o", "output")
    .argv;

async function run() {
    const poseidonGolden = await buildPoseidonGolden();
    const F = poseidonGolden.F;

    const poseidonBN128 = await buildPoseidonBN128();

    if (typeof(argv.rom) !== "string") {
        throw new Error("A rom file needs to be specified")
    }
    const romFile = argv.rom.trim();

    if (typeof(argv.output) !== "string") {
        throw new Error("A output file needs to be specified")
    }
    const outputFile = argv.output.trim();

    Fr = new F1Field("0xFFFFFFFF00000001");

    const rom = JSON.parse(await fs.promises.readFile(romFile, "utf8"));
    const pil = await compile(Fr, path.join(__dirname, "..", "pil", "main.pil"));



    const constPols = newConstantPolsArray(pil);

    // BREAK HERE TO DETECT N

    const N = constPols.Main.STEP.polDeg;
    const Nbits = log2(N);
    const extendBits = 1;

    console.log("Arith...");
    await smArith.buildConstants(constPols.Arith);
    console.log("Binary...");
    await smBinary.buildConstants(constPols.Binary);
    console.log("Byte4...");
    await smByte4.buildConstants(constPols.Byte4);
    console.log("Global...");
    await smGlobal.buildConstants(constPols.Global);
    console.log("KeccakF...");
    await smKeccakF.buildConstants(constPols.KeccakF);
    console.log("Main...");
    await smMain.buildConstants(constPols.Main);
    console.log("MemAlign...");
    await smMemAlign.buildConstants(constPols.MemAlign);
    console.log("Mem...");
    await smMem.buildConstants(constPols.Mem);
    console.log("Nine2One...");
    await smNine2One.buildConstants(constPols.Nine2One);
    console.log("NormGate9...");
    await smNormGate9.buildConstants(constPols.NormGate9);
    console.log("PaddingKK...");
    await smPaddingKK.buildConstants(constPols.PaddingKK);
    console.log("PaddingKKBits...");
    await smPaddingKKBit.buildConstants(constPols.PaddingKKBit);
    console.log("PaddingPG...");
    await smPaddingPG.buildConstants(constPols.PaddingPG);
    console.log("PoseidonG...");
    await smPoseidonG.buildConstants(constPols.PoseidonG);
    console.log("Rom...");
    await smRom.buildConstants(constPols.Rom, rom);
    console.log("Storage...");
    await smStorage.buildConstants(constPols.Storage);

    for (let i=0; i<constPolsArrayDef.length; i++) {
        if (constPolsArray[i].length != N) {
            throw new Error(`Polinomial not fited ${constPolsArrayDef[i].name}` )
        }
    }

    await constPols.saveToFile(outputFile);

    console.log("Constants generated succefully!");
}

run().then(()=> {
    process.exit(0);
}, (err) => {
    console.log(err.message);
    console.log(err.stack);
    process.exit(1);
});

function buildZhInv_2ns(pol, F, N) {
    let sn = F.shift;
    const nBits = log2(N);
    for (let i=0; i<nBits-1; i++) {
        sn = F.square(sn);
    }
    e = F.inv(F.sub(sn, F.one));
    o = F.inv(F.sub(F.neg(sn), F.one));
    for ( let i=0; i<N; i++) pol[i] =  i % 2 ? o : e;
}

function buildZh_2ns(pol, F, N) {
    let sn = F.shift;
    const nBits = log2(N);
    for (let i=0; i<nBits-1; i++) {
        sn = F.square(sn);
    }
    e = F.sub(sn, F.one);
    o = F.sub(F.neg(sn), F.one);
    for ( let i=0; i<N; i++) pol[i] =  i % 2 ? o : e;
}
