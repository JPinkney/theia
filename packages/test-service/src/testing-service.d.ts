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

import { LanguageServerAction } from './action-enums';
declare module '@theia/testservice' {

    export namespace languageserver {
        // tslint:disable
        export function completion(handle: number, model: any, position: any, context: any, token: any): any;
        export function definition(handle: number, resource: any, position: any, token: any): any;
        export function declaration(handle: number, resource: any, position: any, token: any): any;
        export function signatureHelp(handle: number, resource: any, position: any, context: any, token: any): any;
        export function implementation(handle: number, resource: any, position: any, token: any): any;
        export function typeDefinition(handle: number, resource: any, position: any, token: any): any;
        export function hover(handle: number, resource: any, position: any, token: any): any;
        export function documentHighlight(handle: number, resource: any, position: any, token: any): any;
        export function workspaceSymbols(handle: number, query: any, token: any): any;
        export function documentFormattingEdits(handle: number, resource: any, options: any, token: any): any;
        export function documentRangeFormattingEdits(handle: number, resource: any, range: any, options: any, token: any): any;
        export function onTypeFormattingEdits(handle: number, resource: any, position: any, ch: string, options: any, token: any): any;
        export function documentLinks(handle: number, resource: any, token: any): any;
        export function codeActions(handle: number, resource: any, rangeOrSelection: any, context: any, token: any): any;
        export function codeLenses(handle: number, resource: any, token: any): any;
        export function references(handle: number, resource: any, position: any, context: any, token: any): any;
        export function symbols(handle: number, model: any, token: any): any;
        export function documentColors(handle: number, resource: any, token: any): any;
        export function foldingRange(callId: number, resource: any, context: any, token: any): any;
        export function renameEdits(handle: number, resource: any, position: any, newName: string, token: any): any;

        /**
         * This method basically handles looking up a vscode extension with an action corresponding to the handle you want
         */
        export function handleLookUp(extensionID: string, action: LanguageServerAction): Promise<number | undefined>;

    }

}
