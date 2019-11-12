/********************************************************************************
 * Copyright (C) 2018 Red Hat, Inc. and others.
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

import * as testservice from '@theia/testservice';
import { RPCProtocol } from '@theia/plugin-ext/lib/common/rpc-protocol';
import { Plugin } from '@theia/plugin-ext/lib/common/plugin-api-rpc';
import { PLUGIN_RPC_CONTEXT } from './common/test-protocol';
import { LanguagesExtTestImpl } from './languages-test';
import { LanguageServerAction } from '@theia/testservice/lib/action-enums';

export interface TestApiFactory {
    (plugin: Plugin): typeof testservice;
}

export function createAPIFactory(rpc: RPCProtocol): TestApiFactory {

    const testLanguages = rpc.set(PLUGIN_RPC_CONTEXT.TEST_EXT, new LanguagesExtTestImpl(rpc));

    return function (plugin: Plugin): typeof testservice {

        const languageserver: typeof testservice.languageserver = {

            // tslint:disable
            completion(handle: any, model: any, position: any, context: any, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
                return testLanguages.provideCompletionItems(handle, model, position, context, token);
            },
            definition(handle: number, resource: any, position: any, token: any): any {
                return testLanguages.provideDefinition(handle, resource, position, token);
            },
            declaration(handle: number, resource: any, position: any, token: any): any {
                return testLanguages.provideDeclaration(handle, resource, position, token);
            },
            signatureHelp(handle: number, resource: any, position: any, context: any, token: any): any {
                return testLanguages.provideSignatureHelp(handle, resource, position, context, token);
            },
            implementation(handle: number, resource: any, position: any, token: any): any {
                return testLanguages.provideImplementation(handle, resource, position, token);
            },
            typeDefinition(handle: number, resource: any, position: any, token: any): any {
                return testLanguages.provideTypeDefinition(handle, resource, position, token);
            },
            hover(handle: number, resource: any, position: any, token: any): any {
                return testLanguages.provideHover(handle, resource, position, token);
            },
            documentHighlight(handle: number, resource: any, position: any, token: any): any {
                return testLanguages.provideDocumentHighlights(handle, resource, position, token);
            },
            workspaceSymbols(handle: number, query: string, token: any): any {
                return testLanguages.provideWorkspaceSymbols(handle, query, token);
            },
            documentFormattingEdits(handle: number, resource: any, options: any, token: any): any {
                return testLanguages.provideDocumentFormattingEdits(handle, resource, options, token);
            },
            documentRangeFormattingEdits(handle: number, resource: any, range: any, options: any, token: any): any {
                return testLanguages.provideDocumentRangeFormattingEdits(handle, resource, range, options, token);
            },
            onTypeFormattingEdits(handle: number, resource: any, position: any, ch: string, options: any, token: any): any {
                return testLanguages.provideOnTypeFormattingEdits(handle, resource, position, ch, options, token);
            },
            documentLinks(handle: number, resource: any, token: any): any {
                return testLanguages.provideLinks(handle, resource, token);
            },
            codeActions(handle: number, resource: any, rangeOrSelection: any, context: any, token: any): any {
                return testLanguages.provideCodeActions(handle, resource, rangeOrSelection, context, token);
            },
            codeLenses(handle: number, resource: any, token: any): any {
                return testLanguages.provideCodeLenses(handle, resource, token);
            },
            references(handle: number, resource: any, position: any, context: any, token: any): any {
                return testLanguages.provideReferences(handle, resource, position, context, token);
            },
            // tslint:disable-next-line:no-any
            symbols(handle: number, model: any, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.DocumentSymbol[]> {
                return testLanguages.provideDocumentSymbols(handle, model, token);
            },
            documentColors(handle: number, resource: any, token: any): any {
                return testLanguages.provideDocumentColors(handle, resource, token);
            },
            foldingRange(callId: number, resource: any, context: any, token: any): any {
                return testLanguages.provideFoldingRanges(callId, resource, context, token);
            },
            renameEdits(handle: number, resource: any, position: any, newName: string, token: any): any {
                return testLanguages.provideRenameEdits(handle, resource, position, newName, token);
            },
            handleLookUp(extensionID: string, action: LanguageServerAction): Promise<number | undefined> {
                return testLanguages.handleLookUp(extensionID, action);
            }
        };

        return <typeof testservice>{
            languageserver
        };

    };
}
