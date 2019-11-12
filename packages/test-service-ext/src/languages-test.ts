/********************************************************************************
 * Copyright (C) 2019 RedHat and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import { RPCProtocol } from '@theia/plugin-ext/lib/common/rpc-protocol';
import { LanguageExtTestInterface, LanguageMainTestInterface } from './common/test-protocol';
import { PLUGIN_RPC_CONTEXT } from '@theia/plugin-ext/lib/common/plugin-api-rpc';
import * as vst from 'vscode-languageserver-types';
import { LanguageServerAction } from '@theia/testservice/lib/action-enums';

export class LanguagesExtTestImpl implements LanguageExtTestInterface {

    private testMain: LanguageMainTestInterface;

    constructor(rpc: RPCProtocol) {
        this.testMain = rpc.getProxy(PLUGIN_RPC_CONTEXT.LANGUAGES_MAIN) as LanguageMainTestInterface;
    }

    provideCompletionItems(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        context: monaco.languages.CompletionContext, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
        return this.testMain.$provideCompletionItems(handle, model, position, context, token);
    }

    provideDefinition(handle: number, model: monaco.editor.ITextModel,
        position: monaco.Position, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {
        return this.testMain.$provideDefinition(handle, model, position, token);
    }

    provideDeclaration(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {
        return this.testMain.$provideDeclaration(handle, model, position, token);
    }

    provideSignatureHelp(handle: number, model: monaco.editor.ITextModel,
        position: monaco.Position, token: monaco.CancellationToken,
        context: monaco.languages.SignatureHelpContext): Promise<monaco.languages.ProviderResult<monaco.languages.SignatureHelpResult>> {
        return this.testMain.$provideSignatureHelp(handle, model, position, token, context);
    }

    provideImplementation(handle: number, model: monaco.editor.ITextModel,
        position: monaco.Position, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {
        return this.testMain.$provideImplementation(handle, model, position, token);
    }

    provideTypeDefinition(handle: number, model: monaco.editor.ITextModel,
        position: monaco.Position, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {
        return this.testMain.$provideTypeDefinition(handle, model, position, token);
    }

    provideHover(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Hover> {
        return this.testMain.$provideHover(handle, model, position, token);
    }

    provideDocumentHighlights(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.DocumentHighlight[]> {
        return this.testMain.$provideDocumentHighlights(handle, model, position, token);
    }

    // tslint:disable-next-line:no-any
    provideWorkspaceSymbols(handle: number, params: any, token: monaco.CancellationToken): Thenable<vst.SymbolInformation[]> {
        return this.testMain.$provideWorkspaceSymbols(handle, params, token);
    }

    provideDocumentFormattingEdits(handle: number, model: monaco.editor.ITextModel,
        options: monaco.languages.FormattingOptions, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {
        return this.testMain.$provideDocumentFormattingEdits(handle, model, options, token);
    }

    provideDocumentRangeFormattingEdits(handle: number, model: monaco.editor.ITextModel,
        range: Range, options: monaco.languages.FormattingOptions, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {
        return this.testMain.$provideDocumentRangeFormattingEdits(handle, model, range, options, token);
    }

    provideOnTypeFormattingEdits(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        ch: string, options: monaco.languages.FormattingOptions, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {
        return this.testMain.$provideOnTypeFormattingEdits(handle, model, position, ch, options, token);
    }

    provideLinks(handle: number, model: monaco.editor.ITextModel,
        token: monaco.CancellationToken): Promise<monaco.languages.ProviderResult<monaco.languages.ILinksList>> {
        return this.testMain.$provideLinks(handle, model, token);
    }

    provideCodeActions(handle: number, model: monaco.editor.ITextModel,
        rangeOrSelection: Range, context: monaco.languages.CodeActionContext,
        token: monaco.CancellationToken): Promise<monaco.languages.CodeActionList | Promise<monaco.languages.CodeActionList>> {
        return this.testMain.$provideCodeActions(handle, model, rangeOrSelection, context, token);
    }

    provideCodeLenses(handle: number, model: monaco.editor.ITextModel,
        token: monaco.CancellationToken): Promise<monaco.languages.ProviderResult<monaco.languages.CodeLensList>> {
        return this.testMain.$provideCodeLenses(handle, model, token);
    }

    provideReferences(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        context: monaco.languages.ReferenceContext, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Location[]> {
        return this.testMain.$provideReferences(handle, model, position, context, token);
    }

    provideDocumentSymbols(handle: number, model: monaco.editor.ITextModel,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.DocumentSymbol[]> {
        return this.testMain.$provideDocumentSymbols(handle, model, token);
    }

    provideDocumentColors(handle: number, model: monaco.editor.ITextModel,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.IColorInformation[]> {
        return this.testMain.$provideDocumentColors(handle, model, token);
    }

    provideFoldingRanges(handle: number, model: monaco.editor.ITextModel,
        context: monaco.languages.FoldingContext, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.FoldingRange[]> {
        return this.testMain.$provideFoldingRanges(handle, model, context, token);
    }

    provideRenameEdits(handle: number, model: monaco.editor.ITextModel,
        position: monaco.Position, newName: string, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.WorkspaceEdit & monaco.languages.Rejection> {
        return this.testMain.$provideRenameEdits(handle, model, position, newName, token);
    }

    handleLookUp(extensionID: string, action: LanguageServerAction): Promise<number | undefined> {
        return this.testMain.$handleLookUp(extensionID, action);
    }

}
