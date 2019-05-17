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

import { QuickOpenMain, ITransferInputBox } from '../../common';
import { QuickOpenExtImpl } from '../quick-open';
import { TitleButton } from '@theia/core/lib/browser/quick-open/quick-open-service';
import { QuickInputButtons, ThemeIcon } from '../types-impl';

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

    private visible: boolean;

    // TODO: Replace with disposable emitters
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
            this.onDidTriggerButtonEmitter.fire(quickInputButton);
        });
        this.visible = false;
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

    protected update(): void {
        /**
         * The args are just going to be set when we call show for the first time.
         * We return early when its invisible to avoid race condition
         */
        if (!this.visible) {
            return;
        }

        const convertedButtons = this.convertQuickInputToCorrectLocation(this.buttons);
        this.proxy.$setInputBox(
            this.busy,
            convertedButtons,
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
        super.hide();
    }

    show(): void {
        this.visible = true;
        /**
         * This is sent as a serialized object because
         * we need access to the getters and setters to know when
         * to update the InputBox on the client side but this isn't possible via
         * sending the InputBox through because it does not preserve the getters/setters
         * which makes the object properties inaccessible
         */
        const convertedButtons = this.convertQuickInputToCorrectLocation(this.buttons);
        const inputBoxSettings = {
            busy: this.busy,
            buttons: convertedButtons,
            enabled: this.enabled,
            ignoreFocusOut: this.ignoreFocusOut,
            password: this.password,
            placeholder: this.placeholder,
            prompt: this.prompt,
            step: this.step,
            title: this.title,
            totalSteps: this.totalSteps,
            validationMessage: this.validationMessage,
            value: this.value
        } as ITransferInputBox;
        this.proxy.$showInputBox(inputBoxSettings);
    }

    /**
     * In VSCode the BACK button shows on the left
     * whereas implementations of QuickInputButton
     * show on the right
     */
    private convertQuickInputToCorrectLocation(buttons: ReadonlyArray<QuickInputButton>): ReadonlyArray<TitleButton> {
        const convertedButtons = [];
        for (const b of buttons as TitleButton[]) {
            if (this.isBack(b)) {
                b.location = 0;
            } else {
                b.location = 1;
            }
            if (b.iconPath instanceof ThemeIcon) {
                const themeIconClass = b.iconPath.id === 'folder' ? 'fa fa-folder' : 'fa fa-file';
                b.iconClass = themeIconClass;
            }
            convertedButtons.push(b);
        }
        console.dir(convertedButtons);
        return convertedButtons;
    }

    private isBack(btn: QuickInputButton): boolean {
        return btn.iconPath === QuickInputButtons.Back.iconPath && btn.tooltip === QuickInputButtons.Back.tooltip;
    }

}
