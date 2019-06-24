/********************************************************************************
 * Copyright (C) 2019 Red Hat, Inc. and others.
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

import { Range as R, Position as P, Location as L } from 'vscode-languageserver-types';
import URI from 'vscode-uri';
import * as theia from '@theia/plugin';

// Here is a mapping of VSCode commands to monaco commands with their conversions
export namespace KnownCommands {

    /**
     * Commands that you want to apply custom conversions to rather than pass through the automatic args converter.
     * Would be useful in the case where theia provides some command and you need to provide custom conversions
     */
    // tslint:disable-next-line:no-any
    export const exclusions: { [id: string]: [string, (args: any[] | undefined) => any[] | undefined] } = {};
    exclusions['editor.action.showReferences'] = ['textEditor.commands.showReferences', createConversionFunction(
        (uri: URI) => uri.toString(),
        fromPositionToP,
        toArrayConversion(fromLocationToL))];

    /**
     * Commands that have a name in theia that is different from their name in vscode
     */
    export const mappings: { [id: string]: string } = {};

    /**
     * Mapping of all editor.action commands to their monaco counterpart.
     * executeCommand<T> inside of the plugin command registry will automatically convert
     * incoming arguments from vscode api types to monaco types
     */
    mappings['editor.action.select.all'] = 'monaco.editor.action.select.all';
    mappings['editor.action.moveCarretLeftAction'] = 'monaco.editor.action.moveCarretLeftAction';
    mappings['editor.action.moveCarretRightAction'] = 'monaco.editor.action.moveCarretRightAction';
    mappings['editor.action.transposeLetters'] = 'monaco.editor.action.transposeLetters';
    mappings['editor.action.clipboardCopyWithSyntaxHighlightingAction'] = 'monaco.editor.action.clipboardCopyWithSyntaxHighlightingAction';
    mappings['editor.action.commentLine'] = 'monaco.editor.action.commentLine';
    mappings['editor.action.addCommentLine'] = 'monaco.editor.action.addCommentLine';
    mappings['editor.action.removeCommentLine'] = 'monaco.editor.action.removeCommentLine';
    mappings['editor.action.blockComment'] = 'monaco.editor.action.blockComment';
    mappings['editor.action.showContextMenu'] = 'monaco.editor.action.showContextMenu';
    mappings['cursorUndo'] = 'monaco.cursorUndo';
    mappings['editor.unfold'] = 'monaco.editor.unfold';
    mappings['editor.unfoldRecursively'] = 'monaco.editor.unfoldRecursively';
    mappings['editor.fold'] = 'monaco.editor.fold';
    mappings['editor.foldRecursively'] = 'monaco.editor.foldRecursively';
    mappings['editor.foldAll'] = 'monaco.editor.foldAll';
    mappings['editor.unfoldAll'] = 'monaco.editor.unfoldAll';
    mappings['editor.foldAllBlockComments'] = 'monaco.editor.foldAllBlockComments';
    mappings['editor.foldAllMarkerRegions'] = 'monaco.editor.foldAllMarkerRegions';
    mappings['editor.unfoldAllMarkerRegions'] = 'monaco.editor.unfoldAllMarkerRegions';
    mappings['editor.foldLevel1'] = 'monaco.editor.foldLevel1';
    mappings['editor.foldLevel2'] = 'monaco.editor.foldLevel2';
    mappings['editor.foldLevel3'] = 'monaco.editor.foldLevel3';
    mappings['editor.foldLevel4'] = 'monaco.editor.foldLevel4';
    mappings['editor.foldLevel5'] = 'monaco.editor.foldLevel5';
    mappings['editor.foldLevel6'] = 'monaco.editor.foldLevel6';
    mappings['editor.foldLevel7'] = 'monaco.editor.foldLevel7';
    mappings['editor.action.fontZoomIn'] = 'monaco.editor.action.fontZoomIn';
    mappings['editor.action.fontZoomOut'] = 'monaco.editor.action.fontZoomOut';
    mappings['editor.action.fontZoomReset'] = 'monaco.editor.action.fontZoomReset';
    mappings['editor.action.formatDocument'] = 'monaco.editor.action.formatDocument';
    mappings['editor.action.formatSelection'] = 'monaco.editor.action.formatSelection';
    mappings['editor.action.copyLinesUpAction'] = 'monaco.editor.action.copyLinesUpAction';
    mappings['editor.action.copyLinesDownAction'] = 'monaco.editor.action.copyLinesDownAction';
    mappings['editor.action.moveLinesUpAction'] = 'monaco.editor.action.moveLinesUpAction';
    mappings['editor.action.moveLinesDownAction'] = 'monaco.editor.action.moveLinesDownAction';
    mappings['editor.action.sortLinesAscending'] = 'monaco.editor.action.sortLinesAscending';
    mappings['editor.action.sortLinesDescending'] = 'monaco.editor.action.sortLinesDescending';
    mappings['editor.action.trimTrailingWhitespace'] = 'monaco.editor.action.trimTrailingWhitespace';
    mappings['editor.action.deleteLines'] = 'monaco.editor.action.deleteLines';
    mappings['editor.action.indentLines'] = 'monaco.editor.action.indentLines';
    mappings['editor.action.outdentLines'] = 'monaco.editor.action.outdentLines';
    mappings['editor.action.insertLineBefore'] = 'monaco.editor.action.insertLineBefore';
    mappings['editor.action.insertLineAfter'] = 'monaco.editor.action.insertLineAfter';
    mappings['deleteAllLeft'] = 'monaco.deleteAllLeft';
    mappings['deleteAllRight'] = 'monaco.deleteAllRight';
    mappings['editor.action.joinLines'] = 'monaco.editor.action.joinLines';
    mappings['editor.action.transpose'] = 'monaco.editor.action.transpose';
    mappings['editor.action.transformToUppercase'] = 'monaco.editor.action.transformToUppercase';
    mappings['editor.action.transformToLowercase'] = 'monaco.editor.action.transformToLowercase';
    mappings['editor.action.smartSelect.grow'] = 'monaco.editor.action.smartSelect.grow';
    mappings['editor.action.smartSelect.shrink'] = 'monaco.editor.action.smartSelect.shrink';
    mappings['editor.action.toggleHighContrast'] = 'monaco.editor.action.toggleHighContrast';
    mappings['editor.action.gotoLine'] = 'monaco.editor.action.gotoLine';
    mappings['editor.action.quickOutline'] = 'monaco.editor.action.quickOutline';
    mappings['editor.action.inPlaceReplace.up'] = 'monaco.editor.action.inPlaceReplace.up';
    mappings['editor.action.inPlaceReplace.down'] = 'monaco.editor.action.inPlaceReplace.down';
    mappings['editor.action.diffReview.next'] = 'monaco.editor.action.diffReview.next';
    mappings['editor.action.diffReview.prev'] = 'monaco.editor.action.diffReview.prev';
    mappings['editor.action.selectToBracket'] = 'monaco.editor.action.selectToBracket';
    mappings['editor.action.jumpToBracket'] = 'monaco.editor.action.jumpToBracket';
    mappings['editor.action.marker.next'] = 'monaco.editor.action.marker.next';
    mappings['editor.action.marker.prev'] = 'monaco.editor.action.marker.prev';
    mappings['editor.action.marker.nextInFiles'] = 'monaco.editor.action.marker.nextInFiles';
    mappings['editor.action.marker.prevInFiles'] = 'monaco.editor.action.marker.prevInFiles';
    mappings['editor.action.showHover'] = 'monaco.editor.action.showHover';
    mappings['editor.action.openLink'] = 'monaco.editor.action.openLink';
    mappings['editor.action.quickFix'] = 'monaco.editor.action.quickFix';
    mappings['editor.action.refactor'] = 'monaco.editor.action.refactor';
    mappings['editor.action.sourceAction'] = 'monaco.editor.action.sourceAction';
    mappings['editor.action.organizeImports'] = 'monaco.editor.action.organizeImports';
    mappings['editor.action.triggerParameterHints'] = 'monaco.editor.action.triggerParameterHints';
    mappings['editor.action.rename'] = 'monaco.editor.action.rename';
    mappings['editor.action.triggerSuggest'] = 'monaco.editor.action.triggerSuggest';
    mappings['editor.action.wordHighlight.next'] = 'monaco.editor.action.wordHighlight.next';
    mappings['editor.action.wordHighlight.prev'] = 'monaco.editor.action.wordHighlight.prev';
    mappings['editor.action.showAccessibilityHelp'] = 'monaco.editor.action.showAccessibilityHelp';
    mappings['editor.action.inspectTokens'] = 'monaco.editor.action.inspectTokens';
    mappings['actions.findWithSelection'] = 'monaco.actions.findWithSelection';
    mappings['editor.action.nextMatchFindAction'] = 'monaco.editor.action.nextMatchFindAction';
    mappings['editor.action.previousMatchFindAction'] = 'monaco.editor.action.previousMatchFindAction';
    mappings['editor.action.nextSelectionMatchFindAction'] = 'monaco.editor.action.nextSelectionMatchFindAction';
    mappings['editor.action.previousSelectionMatchFindAction'] = 'monaco.editor.action.previousSelectionMatchFindAction';
    mappings['editor.action.insertCursorAbove'] = 'monaco.editor.action.insertCursorAbove';
    mappings['editor.action.insertCursorBelow'] = 'monaco.editor.action.insertCursorBelow';
    mappings['editor.action.insertCursorAtEndOfEachLineSelected'] = 'monaco.editor.action.insertCursorAtEndOfEachLineSelected';
    mappings['editor.action.addSelectionToNextFindMatch'] = 'monaco.editor.action.addSelectionToNextFindMatch';
    mappings['editor.action.addSelectionToPreviousFindMatch'] = 'monaco.editor.action.addSelectionToPreviousFindMatch';
    mappings['editor.action.moveSelectionToNextFindMatch'] = 'monaco.editor.action.moveSelectionToNextFindMatch';
    mappings['editor.action.moveSelectionToPreviousFindMatch'] = 'monaco.editor.action.moveSelectionToPreviousFindMatch';
    mappings['editor.action.selectHighlights'] = 'monaco.editor.action.selectHighlights';
    mappings['editor.action.changeAll'] = 'monaco.editor.action.changeAll';
    mappings['editor.action.goToDeclaration'] = 'monaco.editor.action.goToDeclaration';
    mappings['editor.action.openDeclarationToTheSide'] = 'monaco.editor.action.openDeclarationToTheSide';
    mappings['editor.action.previewDeclaration'] = 'monaco.editor.action.previewDeclaration';
    mappings['editor.action.peekImplementation'] = 'monaco.editor.action.peekImplementation';
    mappings['editor.action.goToTypeDefinition'] = 'monaco.editor.action.goToTypeDefinition';
    mappings['editor.action.peekTypeDefinition'] = 'monaco.editor.action.peekTypeDefinition';
    mappings['editor.action.referenceSearch.trigger'] = 'monaco.editor.action.referenceSearch.trigger';

    /**
     * Navigation
     */
    mappings['workbench.action.gotoLine'] = 'monaco.editor.action.gotoLine';
    mappings['workbench.action.gotoSymbol'] = 'monaco.editor.action.quickOutline';
    mappings['workbench.actions.view.problems'] = 'problemsView:toggle';

    /**
     * File Management
     */
    mappings['workbench.action.files.saveAs'] = 'file.saveAs';

    /**
     * Display
     */
    mappings['workbench.view.explorer'] = 'navigator.reveal';
    mappings['workbench.view.search'] = 'search-in-workspace.toggle';
    mappings['workbench.view.scm'] = 'scmView:toggle';
    mappings['workbench.view.debug'] = 'debug:toggle';
    mappings['workbench.view.extensions'] = 'pluginsView:toggle';
    mappings['workbench.action.output.toggleOutput'] = 'output:toggle';
    mappings['workbench.action.terminal.openNativeConsole'] = 'terminal:new';

    /**
     * Search
     */
    mappings['workbench.view.search'] = 'search-in-workspace.open';

    // Map all the properties from exclusions from their vscode command to their theia command
    for (const mappedFrom in exclusions) {
        if (!exclusions.hasOwnProperty(mappedFrom)) {
            continue;
        }
        const mappedTo = exclusions[mappedFrom];
        mappings[mappedFrom] = mappedTo[0];
    }

    // tslint:disable-next-line:no-any
    export function map<T>(id: string, args: any[] | undefined, toDo: (mappedId: string, mappedArgs: any[] | undefined) => T): T {
        if (exclusions[id]) {
            return toDo(exclusions[id][0], exclusions[id][1](args));
        } else if (mappings[id]) {
            return toDo(mappings[id], args);
        } else {
            return toDo(id, args);
        }
    }

    // tslint:disable-next-line:no-any
    type conversionFunction = ((parameter: any) => any) | undefined;
    // tslint:disable-next-line:no-any
    function createConversionFunction(...conversions: conversionFunction[]): (args: any[] | undefined) => any[] | undefined {
        // tslint:disable-next-line:no-any
        return function (args: any[] | undefined): any[] | undefined {
            if (!args) {
                return args;
            }
            // tslint:disable-next-line:no-any
            return args.map(function (arg: any, index: number): any {
                if (index < conversions.length) {
                    const conversion = conversions[index];
                    if (conversion) {
                        return conversion(arg);
                    }
                }
                return arg;
            });
        };
    }
    // tslint:enable: no-any
    function fromPositionToP(p: theia.Position): P {
        return P.create(p.line, p.character);
    }

    function fromRangeToR(r: theia.Range): R {
        return R.create(fromPositionToP(r.start), fromPositionToP(r.end));
    }

    function fromLocationToL(l: theia.Location): L {
        return L.create(l.uri.toString(), fromRangeToR(l.range));
    }

}

function toArrayConversion<T, U>(f: (a: T) => U): (a: T[]) => U[] {
    return function (a: T[]) {
        return a.map(f);
    };
}
