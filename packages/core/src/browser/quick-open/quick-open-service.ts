/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
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

import { injectable } from 'inversify';
import { QuickOpenModel } from './quick-open-model';
import { MessageType } from '../../common/message-service-protocol';
import URI from '../../common/uri';

enum Location {
    left = 0,
    right = 1
}
export interface TitleButton {
    location: Location;
    iconPath: URI | { dark: URI, light: URI } | { id: string };
    tooltip?: string | undefined;
}

export type QuickOpenOptions = Partial<QuickOpenOptions.Resolved>;
export namespace QuickOpenOptions {
    export interface FuzzyMatchOptions {
        /**
         * Default: `false`
         */
        enableSeparateSubstringMatching?: boolean
    }
    export interface Resolved {
        /**
         * Extended options for inputbox
         */
        readonly busy: boolean
        readonly enabled: boolean;
        readonly step: number | undefined
        readonly title: string | undefined
        readonly totalSteps: number | undefined
        readonly buttons: ReadonlyArray<TitleButton>

        readonly prefix: string;
        readonly placeholder: string;
        readonly ignoreFocusOut: boolean;

        readonly fuzzyMatchLabel: boolean | FuzzyMatchOptions;
        readonly fuzzyMatchDetail: boolean | FuzzyMatchOptions;
        readonly fuzzyMatchDescription: boolean | FuzzyMatchOptions;
        readonly fuzzySort: boolean;

        /** The amount of first symbols to be ignored by quick open widget (e.g. don't affect matching). */
        readonly skipPrefix: number;

        /**
         * Whether to display the items that don't have any highlight.
         */
        readonly showItemsWithoutHighlight: boolean;

        /**
         * `true` if the quick open widget provides a way for the user to securely enter a password.
         * Otherwise, `false`.
         */
        readonly password: boolean;

        selectIndex(lookFor: string): number;

        onClose(canceled: boolean): void;
    }
    export const defaultOptions: Resolved = Object.freeze({
        busy: false,
        enabled: true,
        step: undefined,
        title: undefined,
        totalSteps: undefined,
        prefix: '',
        placeholder: '',
        ignoreFocusOut: false,
        buttons: [],

        fuzzyMatchLabel: false,
        fuzzyMatchDetail: false,
        fuzzyMatchDescription: false,
        fuzzySort: false,

        skipPrefix: 0,

        showItemsWithoutHighlight: false,
        password: false,

        onClose: () => { /* no-op*/ },

        selectIndex: () => -1
    });
    export function resolve(options: QuickOpenOptions = {}, source: Resolved = defaultOptions): Resolved {
        return Object.assign({}, source, options);
    }
}

@injectable()
export class QuickOpenService {
    /**
     * It should be implemented by an extension, e.g. by the monaco extension.
     */
    open(model: QuickOpenModel, options?: QuickOpenOptions): void { }
    showDecoration(type: MessageType): void { }
    hideDecoration(): void { }
}
