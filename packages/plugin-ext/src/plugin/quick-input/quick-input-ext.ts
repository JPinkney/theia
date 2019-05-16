/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
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

import { Emitter, Event } from '@theia/core/lib/common/event';
import { QuickInput } from '@theia/plugin';
import { DisposableCollection } from '@theia/core/lib/common/disposable';
import { QuickOpenExtImpl } from '../quick-open';

export class QuickInputExt implements QuickInput {

    protected _title: string | undefined;
    protected _step: number | undefined;
    protected _totalSteps: number | undefined;
    protected _enabled: boolean;
    protected _busy: boolean;
    protected _ignoreFocusOut: boolean;

    private readonly onDidHideEmitter: Emitter<void>;

    private disposableCollection: DisposableCollection;
    constructor(quickOpenExt: QuickOpenExtImpl) {
        this._busy = false;
        this._enabled = true;
        this._ignoreFocusOut = false;

        this.disposableCollection = new DisposableCollection();
        this.disposableCollection.push(this.onDidHideEmitter = new Emitter());
        quickOpenExt.onDidHide(() => {
            this.onDidHideEmitter.fire(undefined);
        });
    }

    get title(): string | undefined {
        return this._title;
    }

    set title(title: string | undefined) {
        this._title = title;
    }

    get step(): number | undefined {
        return this._step;
    }

    set step(step: number | undefined) {
        this._step = step;
    }

    get totalSteps(): number | undefined {
        return this._totalSteps;
    }

    set totalSteps(totalSteps: number | undefined) {
        this._totalSteps = totalSteps;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(enabled: boolean) {
        this._enabled = enabled;
    }

    get busy(): boolean {
        return this._busy;
    }

    set busy(busy: boolean) {
        this._busy = busy;
    }

    get ignoreFocusOut(): boolean {
        return this._ignoreFocusOut;
    }

    set ignoreFocusOut(ignoreFocusOut: boolean) {
        this._ignoreFocusOut = ignoreFocusOut;
    }

    show(): void {
        throw new Error('Method not implemented.');
    }

    dispose(): void {
        this.disposableCollection.dispose();
    }

    hide(): void {
        this.dispose();
    }

    get onDidHide(): Event<void> {
        return this.onDidHideEmitter.event;
    }
}
