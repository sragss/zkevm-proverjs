const chai = require("chai");
const assert = chai.assert;
const fs = require("fs");
const path = require("path");

const verifyZkasm = require("../common").verifyZkasm;

describe("test main sm", async function () {
    this.timeout(10000000000);

    it("It should create the pols main", async () => {
        await verifyZkasm("../zkasm/counters/mem_align.zkasm", true, ['storage', 'mem', 'binary', 'arith', 'padding_pg', 'padding_kk']);
    });
});