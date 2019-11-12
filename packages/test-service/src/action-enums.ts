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

export type LanguageServerAction = string;
export const LanguageServerActions = {
    'completion': 'completion',
    'definition': 'definition',
    'declaration': 'declaration',
    'signatureHelp': 'signatureHelp',
    'implementation': 'implementation',
    'typeDefinition': 'typeDefinition',
    'hover': 'hover',
    'documentHighlight': 'documentHighlight',
    'workspaceSymbols': 'workspaceSymbols',
    'documentFormattingEdits': 'documentFormattingEdits',
    'documentRangeFormattingEdits': 'documentRangeFormattingEdits',
    'onTypeFormattingEdits': 'onTypeFormattingEdits',
    'documentLinks': 'documentLinks',
    'codeActions': 'codeActions',
    'codeLenses': 'codeLenses',
    'references': 'references',
    'symbols': 'symbols',
    'documentColors': 'documentColors',
    'foldingRange': 'foldingRange',
    'renameEdits': 'renameEdits'
};
