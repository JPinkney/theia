/*
 * Copyright (C) 2018 Red Hat, Inc.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import { VirtualWidget, SELECTED_CLASS, ContextMenuRenderer, Menu } from "@theia/core/lib/browser";
import { DebugSession } from "../debug-session";
import { h } from '@phosphor/virtualdom';
import { DebugProtocol } from 'vscode-debugprotocol';
import { Emitter, Event, CommandRegistry } from "@theia/core";
import { inject } from "inversify";
import { CommandRegistry as phosphorRegistry } from "@phosphor/commands";
import { DEBUG_COMMANDS } from "../debug-command";

/**
 * Is it used to display list of threads.
 */
export class DebugThreadsWidget extends VirtualWidget {
    private _threads: DebugProtocol.Thread[] = [];
    private _threadId?: number;
    private _threadStatus: Map<number, boolean> = new Map();

    private readonly onDidSelectThreadEmitter = new Emitter<number | undefined>();

    constructor(protected readonly debugSession: DebugSession,
        @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer,
        @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry) {
        super();
        this.id = this.toDocumentId();
        this.addClass(Styles.THREADS_CONTAINER);
        this.node.setAttribute("tabIndex", "0");

        this.debugSession.on('thread', event => this.onThreadEvent(event));
        this.debugSession.on('connected', event => this.refreshThreads());
        this.debugSession.on('changeStatus', (thread, changeTo) => {
            this._threadStatus.set(thread, changeTo);
        });

        if (this.debugSession.isConnected) {
            this.refreshThreads();
        }
    }

    get threads(): DebugProtocol.Thread[] {
        return this._threads;
    }

    set threads(threads: DebugProtocol.Thread[]) {
        this._threads = threads;
        this.update();
    }

    get threadId(): number | undefined {
        return this._threadId;
    }

    set threadId(threadId: number | undefined) {
        if (this.threadId) {
            const element = document.getElementById(this.toDocumentId(this.threadId));
            if (element) {
                element.className = Styles.THREAD;
            }
            if (this._threadStatus.has(this.threadId)) {
                this._threadStatus.delete(this.threadId);
            }
        }

        if (threadId) {
            const element = document.getElementById(this.toDocumentId(threadId));
            if (element) {
                element.className = `${Styles.THREAD} ${SELECTED_CLASS}`;
            }
            if (this._threadStatus.has(threadId)) {
                this._threadStatus.delete(threadId);
            }
            this._threadStatus.set(threadId, true);
        }

        this._threadId = threadId;
    }

    get onDidSelectThread(): Event<number | undefined> {
        return this.onDidSelectThreadEmitter.event;
    }

    public getStatusByThreadID(threadID?: number): boolean {
        if (!this._threadId) {
            return false;
        }
        if (!threadID && this._threadId) {
            return !!this._threadStatus.get(this._threadId);
        }
        if (threadID) {
            return !!this._threadStatus.get(threadID);
        }
        return false;
    }

    protected render(): h.Child {
        const header = h.div({ className: "theia-header" }, "Threads");
        const items: h.Child = [];

        for (const thread of this.threads) {
            const className = Styles.THREAD + (thread.id === this.threadId ? ` ${SELECTED_CLASS}` : '');

            const item =
                h.div({
                    id: this.toDocumentId(thread.id),
                    className,
                    onclick: event => {
                        this.threadId = thread.id;
                        this.onDidSelectThreadEmitter.fire(this.threadId);
                    },
                    oncontextmenu: (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.onDidSelectThreadEmitter.fire(this.threadId);

                        const commands = new phosphorRegistry();
                        const menu = new Menu({
                            commands
                        });

                        commands.addCommand(DEBUG_COMMANDS.TOGGLE_THREAD_STATUS.id, {
                            execute: (threadInfo: any) => {
                                if (threadInfo["threadID"] === -1) {
                                    return;
                                }
                                if (threadInfo["threadStatus"]) {
                                    this.debugSession.pause(threadInfo["threadID"]);
                                } else {
                                    this.debugSession.resume(threadInfo["threadID"]);
                                }
                            },
                            label: this.getStatusByThreadID() ? "Resume" : "Suspend"
                        });

                        menu.addItem({
                            type: 'command',
                            command: DEBUG_COMMANDS.TOGGLE_THREAD_STATUS.id,
                            args: {
                                "threadID": this._threadId ? this._threadId : -1,
                                "threadStatus": this.getStatusByThreadID()
                            }
                        });

                        menu.open(event.x, event.y);
                    }
                }, thread.name);
            items.push(item);
        }

        return [header, h.div(items)];
    }

    private toDocumentId(threadId?: number): string {
        return `debug-threads-${this.debugSession.sessionId}` + (threadId ? `-${threadId}` : '');
    }

    private onThreadEvent(event: DebugProtocol.ThreadEvent): void {
        this.refreshThreads(true);
    }

    private refreshThreads(remainThreadSelected?: boolean): void {
        const selectedThreadId = this.threadId;

        this.threads = [];
        this.threadId = undefined;
        this.onDidSelectThreadEmitter.fire(undefined);
        this.debugSession.threads().then(response => {
            this.threads = response.body.threads;

            const remainThreadExists = this.threads.filter(thread => thread.id === selectedThreadId).length !== 0;
            this.threadId = remainThreadSelected && remainThreadExists
                ? selectedThreadId
                : (this.threads.length ? this.threads[0].id : undefined);

            this.onDidSelectThreadEmitter.fire(this.threadId);
        });
    }
}

export namespace Styles {
    export const DEBUG_PANEL = 'theia-debug-panel';
    export const DEBUG_TARGET = 'theia-debug-target';
    export const THREADS_CONTAINER = 'theia-debug-threads-container';
    export const THREAD = 'theia-debug-thread';
    export const STACK_FRAMES_CONTAINER = 'theia-debug-stack-frames-container';
    export const STACK_FRAME = 'theia-debug-stack-frame';
}
