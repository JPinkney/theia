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

import { InputBoxOptions, QuickInputButton } from '@theia/plugin';
import { interfaces } from 'inversify';
import { QuickOpenModel, QuickOpenItem, QuickOpenMode } from '@theia/core/lib/browser/quick-open/quick-open-model';
import { RPCProtocol } from '../../api/rpc-protocol';
import { QuickOpenExt, QuickOpenMain, MAIN_RPC_CONTEXT, PickOptions, PickOpenItem, ITransferInputBox } from '../../api/plugin-api';
import { MonacoQuickOpenService } from '@theia/monaco/lib/browser/monaco-quick-open-service';
import { QuickInputPluginService } from './quick-input/quick-input-plugin';
import { TitleButton } from '@theia/core/lib/browser/quick-open/quick-open-service';

export class QuickOpenMainImpl implements QuickOpenMain, QuickOpenModel {

    private quickInput: QuickInputPluginService;
    private doResolve: (value?: number | number[] | PromiseLike<number | number[]> | undefined) => void;
    private proxy: QuickOpenExt;
    private delegate: MonacoQuickOpenService;
    private acceptor: ((items: QuickOpenItem[]) => void) | undefined;
    private items: QuickOpenItem[] | undefined;

    private activeElement: HTMLElement | undefined;

    constructor(rpc: RPCProtocol, container: interfaces.Container) {
        this.proxy = rpc.getProxy(MAIN_RPC_CONTEXT.QUICK_OPEN_EXT);
        this.delegate = container.get(MonacoQuickOpenService);
        this.quickInput = container.get(QuickInputPluginService);
    }

    private cleanUp() {
        this.items = undefined;
        this.acceptor = undefined;
        if (this.activeElement) {
            this.activeElement.focus();
        }
        this.activeElement = undefined;
    }

    $show(options: PickOptions): Promise<number | number[]> {
        this.activeElement = window.document.activeElement as HTMLElement;
        this.delegate.open(this, {
            fuzzyMatchDescription: options.matchOnDescription,
            fuzzyMatchLabel: true,
            fuzzyMatchDetail: options.matchOnDetail,
            placeholder: options.placeHolder,
            onClose: () => {
                this.cleanUp();
            }
        });

        return new Promise((resolve, reject) => {
            this.doResolve = resolve;
        });
    }

    // tslint:disable-next-line:no-any
    $setItems(items: PickOpenItem[]): Promise<any> {
        this.items = [];
        for (const i of items) {
            this.items.push(new QuickOpenItem({
                label: i.label,
                description: i.description,
                detail: i.detail,
                run: mode => {
                    if (mode === QuickOpenMode.OPEN) {
                        this.proxy.$onItemSelected(i.handle);
                        this.doResolve(i.handle);
                        this.cleanUp();
                        return true;
                    }
                    return false;
                }
            }));
        }
        if (this.acceptor) {
            this.acceptor(this.items);
        }
        return Promise.resolve();
    }

    // tslint:disable-next-line:no-any
    $setError(error: Error): Promise<any> {
        throw new Error('Method not implemented.');
    }

    $input(options: InputBoxOptions, validateInput: boolean): Promise<string | undefined> {
        if (validateInput) {
            options.validateInput = val => this.proxy.$validateInput(val);
        }

        return this.quickInput.open(options);
    }

    $showInputBox(inputBox: ITransferInputBox): void {
        this.quickInput.open({
            busy: inputBox.busy,
            enabled: inputBox.enabled,
            ignoreFocusOut: inputBox.ignoreFocusOut,
            password: inputBox.password,
            step: inputBox.step,
            title: inputBox.title,
            totalSteps: inputBox.totalSteps,
            buttons: inputBox.buttons,
            validationMessage: inputBox.validationMessage,
            placeHolder: inputBox.placeholder,
            value: inputBox.value,
            prompt: inputBox.prompt
        });
        this.delegate.onDidTriggerButton(clickedButton => {
            /**
             * Convert the compatible TitleButton to a
             * QuickInputButton so that you do not have a
             * location setting on the backend
             */
            const convertedQuickInputButton = {
                iconPath: clickedButton.iconPath,
                tooltip: clickedButton.tooltip
            } as QuickInputButton;
            this.proxy.$onDidTriggerButton(convertedQuickInputButton);
        });
        this.quickInput.onDidAccept(() => {
            this.proxy.$onDidAccept();
        });
        this.quickInput.onDidChangeValue(changedValue => {
            this.proxy.$onDidChangeValue(changedValue);
        });
        this.quickInput.onDidHide(() => {
            this.proxy.$onDidHide();
        });
    }

    $setInputBox(
        busy: boolean,
        buttons: TitleButton[],
        enabled: boolean,
        ignoreFocusOut: boolean,
        password: boolean,
        placeholder: string,
        prompt: string | undefined,
        step: number | undefined,
        title: string | undefined,
        totalSteps: number | undefined,
        validationMessage: string | undefined,
        value: string | undefined) {

        this.delegate.setTitle(title);
        this.delegate.setStep(step);
        this.delegate.setTotalSteps(totalSteps);
        this.delegate.setButtons(buttons);
        this.delegate.setEnabled(enabled);
        this.delegate.setPassword(password);
        this.delegate.setPlaceHolder(placeholder);
    }

    onType(lookFor: string, acceptor: (items: QuickOpenItem[]) => void): void {
        this.acceptor = acceptor;
        if (this.items) {
            acceptor(this.items);
        }
    }

}
