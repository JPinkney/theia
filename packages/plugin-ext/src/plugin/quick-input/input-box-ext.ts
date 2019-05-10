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

import { InputBox, QuickInputButton } from '@theia/plugin';
import { QuickInputExt } from './quick-input-ext';
import { Emitter, Event } from '@theia/core/lib/common/event';

import { QuickOpenMain } from '../../common';
import { QuickOpenExtImpl } from '../quick-open';

export class InputBoxExt extends QuickInputExt implements InputBox {

    private _buttons: ReadonlyArray<QuickInputButton>;
    private _password: boolean;
    private _placeholder: string | undefined;
    private _prompt: string | undefined;
    private _validationMessage: string | undefined;
    private _value: string;

    private readonly onDidChangeValueEmitter: Emitter<string>;
    private readonly onDidAcceptEmitter: Emitter<void>;
    private readonly onDidTriggerButtonEmitter: Emitter<QuickInputButton>;

    private proxy: QuickOpenMain;

    private isVisible: boolean;

    // TODO: Replace with custom implementation ??
    constructor(proxy: QuickOpenMain, quickOpenExt: QuickOpenExtImpl) {
        super(quickOpenExt);
        this.proxy = proxy;
        this._buttons = [];
        this._password = false;
        this._placeholder = '';
        this._prompt = '';
        this._validationMessage = '';
        this._value = '';
        this.onDidChangeValueEmitter = new Emitter<string>();
        this.onDidAcceptEmitter = new Emitter<void>();
        this.onDidTriggerButtonEmitter = new Emitter<QuickInputButton>();

        quickOpenExt.onDidChangeValue(changedValue => {
            this.onDidChangeValueEmitter.fire(changedValue);
        });
        quickOpenExt.onDidAccept(() => {
            this.onDidAcceptEmitter.fire(undefined);
        });
        quickOpenExt.onDidTriggerButton(quickInputButton => {
            console.log('triggered button in input-box-ext.ts');
            this.onDidTriggerButtonEmitter.fire(quickInputButton);
        });
    }

    get onDidAccept(): Event<void> {
        return this.onDidAcceptEmitter.event;
    }

    get onDidChangeValue(): Event<string> {
        return this.onDidChangeValueEmitter.event;
    }

    get onDidTriggerButton(): Event<QuickInputButton> {
        return this.onDidTriggerButtonEmitter.event;
    }

    get buttons(): ReadonlyArray<QuickInputButton> {
        return this._buttons;
    }

    set buttons(buttons: ReadonlyArray<QuickInputButton>) {
        this._buttons = buttons;
        this.update();
    }

    get password(): boolean {
        return this._password;
    }

    set password(password: boolean) {
        this._password = password;
        this.update();
    }

    get placeholder(): string | undefined {
        return this._placeholder;
    }

    set placeholder(placeholder: string | undefined) {
        this._placeholder = placeholder;
        this.update();
    }

    get prompt(): string | undefined {
        return this._prompt;
    }

    set prompt(prompt: string | undefined) {
        this._prompt = prompt;
        this.update();
    }

    get validationMessage(): string | undefined {
        return this._validationMessage;
    }

    set validationMessage(validationMessage: string | undefined) {
        this._validationMessage = validationMessage;
        this.update();
    }

    get value(): string {
        return this._value;
    }

    set value(value: string) {
        this._value = value;
        this.update();
    }

    private update(): void {
        /**
         * We don't need to update anything if its not visible
         */
        if (!this.isVisible) {
            return;
        }
        console.log('sending the updated parameters to the backend');
        this.proxy.$setInputBox(
            this.busy,
            this.buttons,
            this.enabled,
            this.ignoreFocusOut,
            this.password,
            this.placeholder,
            this.prompt,
            this.step,
            this.title,
            this.totalSteps,
            this.validationMessage,
            this.value
        );
    }

    hide(): void {
        this.isVisible = false;
        super.hide();
    }

    show(): void {
        // Call across the proxy
        this.isVisible = true;
        this.proxy.$showInputBox(this);
    }
}
