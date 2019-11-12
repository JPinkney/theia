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

import { injectable, inject } from 'inversify';
import { PluginInfo } from '@theia/plugin-ext/lib/common/plugin-api-rpc';
import { SerializedDocumentFilter } from '@theia/plugin-ext/lib/common/plugin-api-rpc-model';
import { LanguagesMainImpl } from '@theia/plugin-ext/lib/main/browser/languages-main';
import { LanguageMainTestInterface } from '../common/test-protocol';
import * as theia from '@theia/plugin';
import { RPCProtocol } from '@theia/plugin-ext/lib/common/rpc-protocol';
import { LanguageServerAction, LanguageServerActions } from '@theia/testservice/lib/action-enums';

@injectable()
export class LanguagesMainTest extends LanguagesMainImpl implements LanguageMainTestInterface {

    private pluginFeatureToHandleMap: Map<string, Map<LanguageServerAction, number>>;

    constructor(@inject(RPCProtocol) rpc: RPCProtocol) {
        super(rpc);
        this.pluginFeatureToHandleMap = new Map();
    }

    // tslint:disable-next-line:no-any
    $provideCompletionItems(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        context: monaco.languages.CompletionContext, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
        return super.provideCompletionItems(handle, model, position, context, token);
    }

    $provideDefinition(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {
        return super.provideDefinition(handle, model, position, token);
    }

    $provideDeclaration(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {
        return super.provideDeclaration(handle, model, position, token);
    }

    $provideSignatureHelp(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        token: monaco.CancellationToken, context: monaco.languages.SignatureHelpContext): Promise<monaco.languages.ProviderResult<monaco.languages.SignatureHelpResult>> {
        return super.provideSignatureHelp(handle, model, position, token, context);
    }

    $provideImplementation(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {
        return super.provideImplementation(handle, model, position, token);
    }

    $provideTypeDefinition(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {
        return super.provideTypeDefinition(handle, model, position, token);
    }

    $provideHover(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Hover> {
        return super.provideHover(handle, model, position, token);
    }

    $provideDocumentHighlights(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.DocumentHighlight[]> {
        return super.provideDocumentHighlights(handle, model, position, token);
    }

    // tslint:disable-next-line:no-any
    $provideWorkspaceSymbols(handle: number, params: any, token: monaco.CancellationToken): Thenable<import('vscode-languageserver-types').SymbolInformation[]> {
        return super.provideWorkspaceSymbols(handle, params, token);
    }

    $provideDocumentFormattingEdits(handle: number, model: monaco.editor.ITextModel, options: monaco.languages.FormattingOptions,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {
        return super.provideDocumentFormattingEdits(handle, model, options, token);
    }

    // tslint:disable-next-line:no-any
    $provideDocumentRangeFormattingEdits(handle: number, model: monaco.editor.ITextModel, range: any, options: monaco.languages.FormattingOptions,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {
        return super.provideDocumentRangeFormattingEdits(handle, model, range, options, token);
    }

    $provideOnTypeFormattingEdits(handle: number, model: monaco.editor.ITextModel, position: monaco.Position, ch: string, options: monaco.languages.FormattingOptions,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {
        return super.provideOnTypeFormattingEdits(handle, model, position, ch, options, token);
    }

    $provideLinks(handle: number, model: monaco.editor.ITextModel, token: monaco.CancellationToken): Promise<monaco.languages.ProviderResult<monaco.languages.ILinksList>> {
        return super.provideLinks(handle, model, token);
    }

    // tslint:disable-next-line:no-any
    $provideCodeActions(handle: number, model: monaco.editor.ITextModel, rangeOrSelection: any, context: monaco.languages.CodeActionContext,
        token: monaco.CancellationToken): Promise<monaco.languages.CodeActionList | Promise<monaco.languages.CodeActionList>> {
        return super.provideCodeActions(handle, model, rangeOrSelection, context, token);
    }

    $provideCodeLenses(handle: number, model: monaco.editor.ITextModel, token: monaco.CancellationToken): Promise<monaco.languages.ProviderResult<monaco.languages.CodeLensList>> {
        return super.provideCodeLenses(handle, model, token);
    }

    $provideReferences(handle: number, model: monaco.editor.ITextModel, position: monaco.Position, context: monaco.languages.ReferenceContext,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Location[]> {
        return super.provideReferences(handle, model, position, context, token);
    }

    $provideDocumentColors(handle: number, model: monaco.editor.ITextModel,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.IColorInformation[]> {
        return super.provideDocumentColors(handle, model, token);
    }

    $provideFoldingRanges(handle: number, model: monaco.editor.ITextModel, context: monaco.languages.FoldingContext,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.FoldingRange[]> {
        return super.provideFoldingRanges(handle, model, context, token);
    }

    $provideRenameEdits(handle: number, model: monaco.editor.ITextModel, position: monaco.Position, newName: string,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.WorkspaceEdit & monaco.languages.Rejection> {
        return super.provideRenameEdits(handle, model, position, newName, token);
    }

    $provideDocumentSymbols(handle: number, model: monaco.editor.ITextModel,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.DocumentSymbol[]> {
        return super.provideDocumentSymbols(handle, model, token);
    }

    // tslint:disable
    $registerCompletionSupport(handle: number, pluginInfo: PluginInfo,
        selector: SerializedDocumentFilter[], triggerCharacters: string[], supportsResolveDetails: boolean): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.completion);
        super.$registerCompletionSupport(handle, pluginInfo, selector, triggerCharacters, supportsResolveDetails);
    }

    $registerDefinitionProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.definition);
        super.$registerDefinitionProvider(handle, pluginInfo, selector);
    }

    $registerDeclarationProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.declaration);
        super.$registerDeclarationProvider(handle, pluginInfo, selector);
    }

    $registerReferenceProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.references);
        super.$registerReferenceProvider(handle, pluginInfo, selector);
    }

    $registerSignatureHelpProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], metadata: theia.SignatureHelpProviderMetadata): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.signatureHelp);
        super.$registerSignatureHelpProvider(handle, pluginInfo, selector, metadata);
    }

    $registerImplementationProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.implementation);
        super.$registerImplementationProvider(handle, pluginInfo, selector);
    }

    $registerTypeDefinitionProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.typeDefinition);
        super.$registerTypeDefinitionProvider(handle, pluginInfo, selector);
    }

    $registerHoverProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.hover);
        super.$registerHoverProvider(handle, pluginInfo, selector);
    }

    $registerDocumentHighlightProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.documentHighlight);
        super.$registerDocumentHighlightProvider(handle, pluginInfo, selector);
    }

    $registerWorkspaceSymbolProvider(handle: number, pluginInfo: PluginInfo): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.workspaceSymbols);
        super.$registerWorkspaceSymbolProvider(handle, pluginInfo);
    }

    $registerDocumentLinkProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.documentLinks);
        super.$registerDocumentLinkProvider(handle, pluginInfo, selector);
    }

    $registerCodeLensSupport(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], eventHandle: number): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.codeLenses);
        super.$registerCodeLensSupport(handle, pluginInfo, selector, eventHandle);
    }

    $registerOutlineSupport(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.symbols);
        super.$registerOutlineSupport(handle, pluginInfo, selector);
    }

    $registerDocumentFormattingSupport(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.documentFormattingEdits);
        super.$registerDocumentFormattingSupport(handle, pluginInfo, selector);
    }

    $registerRangeFormattingProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.documentRangeFormattingEdits);
        super.$registerRangeFormattingProvider(handle, pluginInfo, selector);
    }

    $registerOnTypeFormattingProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], autoFormatTriggerCharacters: string[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.onTypeFormattingEdits);
        super.$registerOnTypeFormattingProvider(handle, pluginInfo, selector, autoFormatTriggerCharacters);
    }

    $registerFoldingRangeProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.foldingRange);
        super.$registerFoldingRangeProvider(handle, pluginInfo, selector);
    }

    $registerDocumentColorProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.documentColors);
        super.$registerDocumentColorProvider(handle, pluginInfo, selector);
    }

    // $registerQuickFixProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], codeActionKinds?: string[]): void {
    //     this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions);
    //     super.$registerQuickFixProvider(handle, pluginInfo, selector);
    // }

    $registerRenameProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], supportsResolveLocation: boolean): void {
        this.registerPluginWithFeatureHandle(handle, pluginInfo.id, LanguageServerActions.renameEdits);
        super.$registerRenameProvider(handle, pluginInfo, selector, supportsResolveLocation);
    }

    private registerPluginWithFeatureHandle(handle: number, extensionID: string, action: LanguageServerAction): void {
        if (this.pluginFeatureToHandleMap.has(extensionID)) {
            // tslint:disable-next-line:no-any
            (this.pluginFeatureToHandleMap.get(extensionID) as any).set(action, handle);
        } else {
            this.pluginFeatureToHandleMap.set(extensionID, new Map().set(action, handle));
        }
    }

    private findHandle(extensionID: string, action: LanguageServerAction): number | undefined {
        const actionToHandle = this.pluginFeatureToHandleMap.get(extensionID);
        if (this.pluginFeatureToHandleMap.has(extensionID)) {
            // tslint:disable-next-line:no-any
            return (actionToHandle as any).get(action);
        }
        return undefined;
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    async $handleLookUp(extensionID: string, action: LanguageServerAction): Promise<number | undefined> {
        // If it is not currently in the pluginFeatureToHandleMap then continuously ping every seconds and finally return when its found
        // If its not found then the test will just fail because of timeout issue
        const amount = 30;
        for (let i = 0; i < amount; i++) {

            const handle = this.findHandle(extensionID, action);
            if (!handle) {
                await this.sleep(1000);
            } else {
                return handle;
            }
        }

        return undefined;
    }

}
