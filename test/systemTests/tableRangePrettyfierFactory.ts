import * as assert from 'assert';
import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import { TableDocumentRangePrettyfier } from "../../src/extension/tableDocumentRangePrettyfier";
import { TableFactory } from "../../src/modelFactory/tableFactory";
import { AlignmentFactory } from "../../src/modelFactory/alignmentFactory";
import { TableValidator } from "../../src/modelFactory/tableValidator";
import { TableViewModelFactory } from "../../src/viewModelFactories/tableViewModelFactory";
import { RowViewModelFactory } from "../../src/viewModelFactories/rowViewModelFactory";
import { ContentPadCalculator } from "../../src/padCalculation/contentPadCalculator";
import { TableStringWriter } from "../../src/writers/tableStringWriter";
import { ILogger } from "../../src/diagnostics/logger";
import { ConsoleLogger } from '../../src/diagnostics/consoleLogger';
import { MarkdownTextDocumentStub } from "../stubs/markdownTextDocumentStub";
import { TrimmerTransformer } from '../../src/modelFactory/transformers/trimmerTransformer';
import { BorderTransformer } from '../../src/modelFactory/transformers/borderTransformer';
import { SelectionInterpreter } from '../../src/modelFactory/selectionInterpreter';
import { PadCalculatorSelector } from '../../src/padCalculation/padCalculatorSelector';
import { AlignmentMarkerStrategy } from '../../src/viewModelFactories/alignmentMarking';

export class PrettyfierFromFile {
    private readonly _logger: ILogger;

    constructor(logger: ILogger = null) {
        this._logger = logger == null ? new ConsoleLogger() : logger;
    }

    public assertPrettyfiedAsExpected(fileNamePrefix: string): void {
        this.assertEditsPrettyfied(
            this.makeTextEdit(this.readFileContents(`${fileNamePrefix}-input.md`)),
            this.readFileContents(`${fileNamePrefix}-expected.md`)
        );
    }

    private assertEditsPrettyfied(edits: vscode.TextEdit[], expected: string): void {
        assert.equal(edits.length, 1);
        const expectedLines = expected.split(/\r\n|\r|\n/);
        const actualLines = edits[0].newText.split(/\r\n|\r|\n/);
        assert.equal(actualLines.length, expectedLines.length);
        for (let i = 0; i < actualLines.length; i++)
            assert.equal(actualLines[i], expectedLines[i]);
    }

    private makeTextEdit(fileContents: string): vscode.TextEdit[] {
        const doc = new MarkdownTextDocumentStub(fileContents);
        return this.createPrettyfier().provideDocumentRangeFormattingEdits(doc, doc.getFullRange(), null, null);
    }

    private readFileContents(fileName: string) {
        return fs.readFileSync(path.resolve(__dirname, fileName), 'utf-8');
    }

    private createPrettyfier(): TableDocumentRangePrettyfier {
        return new TableDocumentRangePrettyfier(
            new TableFactory(
                new AlignmentFactory(),
                new SelectionInterpreter(false),
                new TrimmerTransformer(new BorderTransformer(null))
            ),
            new TableValidator(new SelectionInterpreter(false)),
            new TableViewModelFactory(new RowViewModelFactory(
                new ContentPadCalculator(new PadCalculatorSelector(), " "), 
                new AlignmentMarkerStrategy(":")
            )),
            new TableStringWriter(),
            [ this._logger ]
        );
    }
}