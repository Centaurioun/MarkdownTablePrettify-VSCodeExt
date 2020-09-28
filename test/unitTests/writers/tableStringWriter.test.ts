import * as assert from 'assert';
import { assertExt } from "../../assertExtensions";
import { TableViewModel } from "../../../src/viewModels/tableViewModel";
import { TableStringWriter } from "../../../src/writers/tableStringWriter";
import { RowViewModel } from "../../../src/viewModels/rowViewModel";

suite("TableStringWriter tests", () => {
    const eol = "\n";

    test("writeTable() with valid input writes the header on the first row", () => {
        const input : TableViewModel = new TableViewModel();
        input.header = makeRowViewModel(["c1", "c2"]);
        input.separator = makeRowViewModel(["-", "-"]);
        input.rows = [ makeRowViewModel(["v1", "v2"]) ];

        const tableText: string = createSut().writeTable(input);

        assertExt.isNotNull(tableText);
        const lines = tableText.split(/\r\n|\r|\n/);
        assert.strictEqual(lines[0], "c1|c2");
    });

    test("writeTable() with valid input writes the separator on the second row", () => {
        const input : TableViewModel = new TableViewModel();
        input.header = makeRowViewModel(["c1", "c2"]);
        input.separator = makeRowViewModel(["---", "--"]);
        input.rows = [ makeRowViewModel(["v1", "v2"]) ];

        const tableText: string = createSut().writeTable(input);

        assertExt.isNotNull(tableText);
        const lines = tableText.split(/\r\n|\r|\n/);
        assert.strictEqual(lines[1], "---|--");
    });

    test("writeTable() with valid input writes the rows from the 3rd row on", () => {
        const input : TableViewModel = new TableViewModel();
        input.header = makeRowViewModel(["c1", "c2"]);
        input.separator = makeRowViewModel(["-", "-"]);
        input.rows = [ 
            makeRowViewModel(["v1", "v2"]),
            makeRowViewModel(["v3", "v4"]),
            makeRowViewModel(["", "v5"])
        ];

        const tableText: string = createSut().writeTable(input);

        assertExt.isNotNull(tableText);
        const lines = tableText.split(/\r\n|\r|\n/);
        assert.strictEqual(lines.length, 5);
        assert.strictEqual(lines[2], "v1|v2");
        assert.strictEqual(lines[3], "v3|v4");
        assert.strictEqual(lines[4], "|v5");
    });

    test("writeTable() null table throws exception", () => {
        const writer = createSut();
        assert.throws(() => writer.writeTable(null));
    });

    test("writeTable() table without header throws exception", () => {
        const input : TableViewModel = new TableViewModel();
        input.separator = makeRowViewModel([]);
        input.rows = [ makeRowViewModel([]) ];

        const writer = createSut();

        assert.throws(() => writer.writeTable(input));
    });

    test("writeTable() table without separator throws exception", () => {
        const input : TableViewModel = new TableViewModel();
        input.header = makeRowViewModel([]);
        input.rows = [ makeRowViewModel([]) ];

        const writer = createSut();

        assert.throws(() => writer.writeTable(input));
    });

    test("writeTable() table with null rows throws exception", () => {
        const input : TableViewModel = new TableViewModel();
        input.header = makeRowViewModel([]);
        input.separator = makeRowViewModel([]);

        const writer = createSut();

        assert.throws(() => writer.writeTable(input));
    });

    test("writeTable() table with no rows throws exception", () => {
        const input : TableViewModel = new TableViewModel();
        input.header = makeRowViewModel([]);
        input.rows = [ ];

        const writer = createSut();

        assert.throws(() => writer.writeTable(input));
    });

    test("writeTable() writes left borders on all rows for viewModel having hasLeftBorderSet", () => {
        const input : TableViewModel = new TableViewModel();
        input.hasLeftBorder = true;
        input.header = makeRowViewModel(["c1", "c2"]);
        input.separator = makeRowViewModel(["-", "-"]);
        input.rows = [ 
            makeRowViewModel(["v1", "v2"]),
            makeRowViewModel(["v3", "v4"]),
            makeRowViewModel(["v5", "v6"])
        ];

        const tableText: string = createSut().writeTable(input);

        assertExt.isNotNull(tableText);
        const lines = tableText.split(/\r\n|\r|\n/);
        assert.strictEqual(lines.length, 5);
        assert.strictEqual(lines[2], "|v1|v2");
        assert.strictEqual(lines[3], "|v3|v4");
        assert.strictEqual(lines[4], "|v5|v6");
    });

    test("writeTable() writes right borders on all rows for viewModel having hasRightBorderSet", () => {
        const input : TableViewModel = new TableViewModel();
        input.hasRightBorder = true;
        input.header = makeRowViewModel(["c1", "c2"]);
        input.separator = makeRowViewModel(["-", "-"]);
        input.rows = [ 
            makeRowViewModel(["v1", "v2"]),
            makeRowViewModel(["v3", "v4"]),
            makeRowViewModel(["v5", "v6"])
        ];

        const tableText: string = createSut().writeTable(input);

        assertExt.isNotNull(tableText);
        const lines = tableText.split(/\r\n|\r|\n/);
        assert.strictEqual(lines.length, 5);
        assert.strictEqual(lines[2], "v1|v2|");
        assert.strictEqual(lines[3], "v3|v4|");
        assert.strictEqual(lines[4], "v5|v6|");
    });

    function makeRowViewModel(values: string[]) {
        return new RowViewModel(values, eol);
    }

    function createSut() : TableStringWriter {
        return new TableStringWriter();
    }
});