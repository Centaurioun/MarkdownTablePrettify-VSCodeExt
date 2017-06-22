import * as assert from "assert";
import { assertExt } from "../assertExtensions";
import { IMock, Mock, It, Times } from "typemoq";
import { TableViewModelBuilder } from "../../src/viewModelBuilders/tableViewModelBuilder";
import { TableValidator } from "../../src/modelFactory/tableValidator";
import { TableViewModel } from "../../src/viewModels/tableViewModel";
import { RowViewModelBuilder } from "../../src/viewModelBuilders/rowViewModelBuilder";
import { RowViewModel } from "../../src/viewModels/rowViewModel";

suite("TableViewModelBuilder tests", () => {
    let _validator: IMock<TableValidator>;
    let _rowVmb: IMock<RowViewModelBuilder>;

    setup(() => {
        _validator = Mock.ofType<TableValidator>();
        _rowVmb = Mock.ofType<RowViewModelBuilder>();
    });

    test("build() with invalid table calls validator and throws exception", () => {
        const inputRows: string[][] = [];
        _validator
            .setup(v => v.isValid(inputRows, false))
            .returns(() => false)
            .verifiable(Times.once());

        const vmb = createViewModelBuilder();

        assert.throws(() => vmb.build(inputRows));
        _validator.verifyAll();
    });

    test("build() with valid table calls rowVmb methods", () => {
        const inputRows: string[][] = [
            ["c1", "c2"],
            ["v1", "v2"],
            ["v3", "v4"],
        ];
        const expectedSeparator = new RowViewModel([]);
        const expectedRow = new RowViewModel([]);
        _validator.setup(v => v.isValid(inputRows, false)).returns(() => true);

        _rowVmb
            .setup(m => m.buildSeparator())
            .returns(() => expectedSeparator)
            .verifiable(Times.once());
        _rowVmb
            .setup(m => m.buildRow(It.isAny()))
            .returns(() => expectedRow)
            .verifiable(Times.exactly(4));

        const vmb = createViewModelBuilder();
        vmb.build(inputRows);

        _rowVmb.verifyAll();
    });

    test("build() with valid table returns expected view model properties", () => {
        const inputRows: string[][] = [
            ["c1", "c2"],
            ["v1", "v2"],
            ["v3", "v4"],
        ];
        const expectedSeparator = new RowViewModel([]);
        const expectedRow = new RowViewModel([]);
        _validator.setup(v => v.isValid(inputRows, false)).returns(() => true);
        _rowVmb.setup(m => m.buildSeparator()).returns(() => expectedSeparator)
        _rowVmb.setup(m => m.buildRow(It.isAny())).returns(() => expectedRow);

        const tableVm = createViewModelBuilder().build(inputRows);

        assertExt.isNotNull(tableVm);
        assert.equal(tableVm.header, expectedRow);
        assert.equal(tableVm.separator, expectedSeparator);
        assertExt.isNotNull(tableVm.rows);
        assert.equal(tableVm.rows.length, 2);
        assert.equal(tableVm.rows[0], expectedRow);
        assert.equal(tableVm.rows[1], expectedRow);
    });


    /* TODO: 
        Move the CJK test from this class to somewhere else when possible.
    */

    test("build() valid table with CJK characters returns expected view model", () => {
        const inputRows: string[][] = [
            ["h", "h"],
            ["𠁻", "𣄿 content"]
        ];
        _validator
            .setup(v => v.isValid(inputRows, false))
            .returns(() => true)
            .verifiable(Times.once());

        const vm = createViewModelBuilder().build(inputRows);

        assertViewModelPropertiesSet(vm);
        assert.equal(vm.header.getValueAt(0), "h  ");
        assert.equal(vm.header.getValueAt(1), " h");
        assert.equal(vm.separator.getValueAt(0), "---");
        assert.equal(vm.separator.getValueAt(1), "------------");
        assert.equal(vm.rows.length, 1);
        assert.equal(vm.rows[0].getValueAt(0), "𠁻 ");
        assert.equal(vm.rows[0].getValueAt(1), " 𣄿 content");
        _validator.verifyAll();
    });

    function assertViewModelPropertiesSet(viewModel: TableViewModel) {
        assertExt.isNotNull(viewModel);
        assertExt.isNotNull(viewModel.header);
        assertExt.isNotNull(viewModel.separator);
        assertExt.isNotNull(viewModel.rows);
    }

    function createViewModelBuilder(): TableViewModelBuilder {
        return new TableViewModelBuilder(_validator.object, _rowVmb.object);
    }
});