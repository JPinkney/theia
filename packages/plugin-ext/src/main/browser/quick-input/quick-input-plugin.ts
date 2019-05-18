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

import { inject, injectable } from 'inversify';
import { QuickInputOptions, QuickOpenItem, QuickOpenMode, QuickOpenService } from '@theia/core/lib/browser/quick-open/';
import { Deferred } from '@theia/core/lib/common/promise-util';
import { MessageType } from '@theia/core/lib/common/message-service-protocol';
import { Emitter, Event } from '@theia/core/lib/common/event';
import { DisposableCollection } from '@theia/core/lib/common/disposable';

@injectable()
export class QuickInputPluginService {

    @inject(QuickOpenService)
    protected readonly quickOpenService: QuickOpenService;

    protected onDidHideEmitter: Emitter<void>;
    protected onDidAcceptEmitter: Emitter<void>;
    protected onDidChangeValueEmitter: Emitter<string>;

    private disposableCollection: DisposableCollection;

    constructor() {
        this.disposableCollection = new DisposableCollection();
        this.disposableCollection.push(this.onDidHideEmitter = new Emitter());
        this.disposableCollection.push(this.onDidAcceptEmitter = new Emitter());
        this.disposableCollection.push(this.onDidChangeValueEmitter = new Emitter());
    }

    get onDidHide(): Event<void> {
        return this.onDidHideEmitter.event;
    }

    get onDidAccept(): Event<void> {
        return this.onDidAcceptEmitter.event;
    }

    get onDidChangeValue(): Event<string> {
        return this.onDidChangeValueEmitter.event;
    }

    open(options: QuickInputOptions): Promise<string | undefined> {
        const result = new Deferred<string | undefined>();
        const prompt = this.createPrompt(options.prompt);
        let label = prompt;
        let currentText = '';
        const validateInput = options && options.validateInput;
        this.quickOpenService.open({
            onType: async (lookFor, acceptor) => {
                this.onDidChangeValueEmitter.fire(lookFor);
                const error = validateInput ? await validateInput(lookFor) : undefined;
                label = error || prompt;
                if (error) {
                    this.quickOpenService.showDecoration(MessageType.Error);
                } else {
                    this.quickOpenService.hideDecoration();
                }
                acceptor([new QuickOpenItem({
                    label,
                    run: mode => {
                        if (!error && mode === QuickOpenMode.OPEN) {
                            result.resolve(currentText);
                            this.onDidAcceptEmitter.fire(undefined);
                            return true;
                        }
                        return false;
                    }
                })]);
                currentText = lookFor;
            }
        }, {
                prefix: options.value,
                placeholder: options.placeHolder,
                password: options.password,
                ignoreFocusOut: options.ignoreFocusOut,
                title: options.title,
                step: options.step,
                totalSteps: options.totalSteps,
                busy: options.busy,
                enabled: options.enabled,
                buttons: options.buttons,
                onClose: () => {
                    result.resolve(undefined);
                    this.onDidHideEmitter.fire(undefined);
                    this.onDidHideEmitter.dispose();
                    this.onDidAcceptEmitter.dispose();
                    this.onDidChangeValueEmitter.dispose();
                    this.disposableCollection.dispose();
                }
            });
        return result.promise;
    }

    protected defaultPrompt = "Press 'Enter' to confirm your input or 'Escape' to cancel";
    protected createPrompt(prompt?: string): string {
        return prompt ? `${prompt} (${this.defaultPrompt})` : this.defaultPrompt;
    }

}
