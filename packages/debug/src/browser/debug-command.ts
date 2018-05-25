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

import { injectable, inject } from "inversify";
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry } from "@theia/core/lib/common";
import { MAIN_MENU_BAR, MenuPath } from "@theia/core/lib/common/menu";
import { DebugService } from "../common/debug-model";
import { DebugSessionManager } from "./debug-session";
import { DebugConfigurationManager } from "./debug-configuration";
import { DebugProtocol } from "vscode-debugprotocol/lib/debugProtocol";
import { DebugThreadSelectionService, ThreadSelection } from "./debug-selection-service";

export const DEBUG_SESSION_CONTEXT_MENU: MenuPath = ['debug-session-context-menu'];
export const DEBUG_SESSION_THREAD_CONTEXT_MENU: MenuPath = ['debug-session-thread-context-menu'];

export namespace DebugSessionContextMenu {
    export const STOP = [...DEBUG_SESSION_CONTEXT_MENU, '1_stop'];
    export const RESUME_ALL_THREADS = [...DEBUG_SESSION_CONTEXT_MENU, '3_resume_all_threads'];
    export const SUSPEND_ALL_THREADS = [...RESUME_ALL_THREADS, '2_suspend_all_threads'];
}

export namespace ThreadContextMenu {
    export const RESUME_THREAD = [...DEBUG_SESSION_THREAD_CONTEXT_MENU, '2_resume'];
    export const SUSPEND_THREAD = [...RESUME_THREAD, '1_suspend'];
}

export namespace DebugMenus {
    export const DEBUG = [...MAIN_MENU_BAR, "4_debug"];
    export const DEBUG_STOP = [...DEBUG, '2_stop'];
    export const DEBUG_START = [...DEBUG_STOP, '1_start'];
    export const ADD_CONFIGURATION = [...DEBUG, '4_add_configuration'];
    export const OPEN_CONFIGURATION = [...ADD_CONFIGURATION, '3_open_configuration'];
}

export namespace DEBUG_COMMANDS {
    export const START = {
        id: 'debug.start',
        label: 'Start'
    };

    export const STOP = {
        id: 'debug.stop',
        label: 'Stop'
    };

    export const OPEN_CONFIGURATION = {
        id: 'debug.configuration.open',
        label: 'Open configuration'
    };

    export const ADD_CONFIGURATION = {
        id: 'debug.configuration.add',
        label: 'Add configuration'
    };

    export const SUSPEND_THREAD = {
        id: 'debug.thread.suspend',
        label: 'Suspend thread'
    };

    export const RESUME_THREAD = {
        id: 'debug.thread.resume',
        label: 'Resume thread'
    };

    export const SUSPEND_ALL_THREADS = {
        id: 'debug.thread.suspend.all',
        label: 'Suspend all threads'
    };

    export const RESUME_ALL_THREADS = {
        id: 'debug.thread.resume.all',
        label: 'Resume all threads'
    };
}

@injectable()
export class DebugCommandHandlers implements MenuContribution, CommandContribution {
    @inject(DebugService)
    protected readonly debug: DebugService;
    @inject(DebugSessionManager)
    protected readonly debugSessionManager: DebugSessionManager;
    @inject(DebugConfigurationManager)
    protected readonly debugConfigurationManager: DebugConfigurationManager;
    @inject(DebugThreadSelectionService)
    protected readonly selectionService: DebugThreadSelectionService;

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerSubmenu(DebugMenus.DEBUG, 'Debug');
        menus.registerMenuAction(DebugMenus.DEBUG_START, {
            commandId: DEBUG_COMMANDS.START.id
        });
        menus.registerMenuAction(DebugMenus.DEBUG_STOP, {
            commandId: DEBUG_COMMANDS.STOP.id
        });
        menus.registerMenuAction(DebugMenus.OPEN_CONFIGURATION, {
            commandId: DEBUG_COMMANDS.OPEN_CONFIGURATION.id
        });
        menus.registerMenuAction(DebugMenus.ADD_CONFIGURATION, {
            commandId: DEBUG_COMMANDS.ADD_CONFIGURATION.id
        });
        menus.registerMenuAction(DebugSessionContextMenu.STOP, {
            commandId: DEBUG_COMMANDS.STOP.id
        });
        menus.registerMenuAction(DebugSessionContextMenu.SUSPEND_ALL_THREADS, {
            commandId: DEBUG_COMMANDS.SUSPEND_ALL_THREADS.id
        });
        menus.registerMenuAction(DebugSessionContextMenu.RESUME_ALL_THREADS, {
            commandId: DEBUG_COMMANDS.RESUME_ALL_THREADS.id
        });
        menus.registerMenuAction(ThreadContextMenu.SUSPEND_THREAD, {
            commandId: DEBUG_COMMANDS.SUSPEND_THREAD.id
        });
        menus.registerMenuAction(ThreadContextMenu.RESUME_THREAD, {
            commandId: DEBUG_COMMANDS.RESUME_THREAD.id
        });
    }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(DEBUG_COMMANDS.START);
        registry.registerHandler(DEBUG_COMMANDS.START.id, {
            execute: () => {
                this.debugConfigurationManager.selectConfiguration()
                    .then(configuration => this.debug.resolveDebugConfiguration(configuration))
                    .then(configuration => this.debug.start(configuration).then(sessionId => ({ sessionId, configuration })))
                    .then(({ sessionId, configuration }) => this.debugSessionManager.create(sessionId, configuration))
                    .catch(error => {
                        console.log(error);
                    });
            },
            isEnabled: () => true,
            isVisible: () => true
        });

        registry.registerCommand(DEBUG_COMMANDS.STOP);
        registry.registerHandler(DEBUG_COMMANDS.STOP.id, {
            execute: () => {
                const debugSession = this.debugSessionManager.getActiveDebugSession();
                if (debugSession) {
                    debugSession.disconnect();
                }
            },
            isEnabled: () => this.debugSessionManager.getActiveDebugSession() !== undefined,
            isVisible: () => true
        });

        registry.registerCommand(DEBUG_COMMANDS.OPEN_CONFIGURATION);
        registry.registerHandler(DEBUG_COMMANDS.OPEN_CONFIGURATION.id, {
            execute: () => this.debugConfigurationManager.openConfigurationFile(),
            isEnabled: () => true,
            isVisible: () => true
        });

        registry.registerCommand(DEBUG_COMMANDS.ADD_CONFIGURATION);
        registry.registerHandler(DEBUG_COMMANDS.ADD_CONFIGURATION.id, {
            execute: () => this.debugConfigurationManager.addConfiguration(),
            isEnabled: () => true,
            isVisible: () => true
        });

        registry.registerCommand(DEBUG_COMMANDS.SUSPEND_ALL_THREADS);
        registry.registerHandler(DEBUG_COMMANDS.SUSPEND_ALL_THREADS.id, {
            execute: () => {
                const debugSession = this.debugSessionManager.getActiveDebugSession();
                if (debugSession) {
                    debugSession.threads().then(response => {
                        const threads: DebugProtocol.Thread[] = response.body.threads;
                        // tslint:disable-next-line:forin
                        for (const thread in threads) {
                            const curr_thread: DebugProtocol.Thread = threads[thread];
                            debugSession.pause(curr_thread.id).then(pauseResponse => {
                                debugSession.emit('changeStatus', curr_thread.id, false);
                            });
                        }
                    });
                }
            },
            isEnabled: () => true,
            isVisible: () => true
        });

        registry.registerCommand(DEBUG_COMMANDS.RESUME_ALL_THREADS);
        registry.registerHandler(DEBUG_COMMANDS.RESUME_ALL_THREADS.id, {
            execute: () => {
                const debugSession = this.debugSessionManager.getActiveDebugSession();
                if (debugSession) {
                    debugSession.threads().then(response => {
                        const threads: DebugProtocol.Thread[] = response.body.threads;
                        // tslint:disable-next-line:forin
                        for (const thread in threads) {
                            const curr_thread: DebugProtocol.Thread = threads[thread];
                            debugSession.resume(curr_thread.id).then(resumeResponse => {
                                debugSession.emit('changeStatus', curr_thread.id, true);
                            });
                        }
                    });
                }
            },
            isEnabled: () => true,
            isVisible: () => true
        });

        registry.registerCommand(DEBUG_COMMANDS.SUSPEND_THREAD);
        registry.registerHandler(DEBUG_COMMANDS.SUSPEND_THREAD.id, {
            execute: () => {
                const debugSession = this.debugSessionManager.getActiveDebugSession();
                if (debugSession) {
                    const thread: ThreadSelection = this.selectionService.selection;
                    debugSession.pause(thread.threadId).then(pauseResponse => {
                        if (pauseResponse.success) {
                            debugSession.emit('changeStatus', thread.threadId, false);
                        }
                    });
                }
            },
            isEnabled: () => this.selectionService.selection && this.selectionService.selection.status,
            isVisible: () => true
        });

        registry.registerCommand(DEBUG_COMMANDS.RESUME_THREAD);
        registry.registerHandler(DEBUG_COMMANDS.RESUME_THREAD.id, {
            execute: () => {
                const debugSession = this.debugSessionManager.getActiveDebugSession();
                if (debugSession) {
                    const thread: ThreadSelection = this.selectionService.selection;
                    debugSession.resume(thread.threadId).then(resumeResponse => {
                        if (resumeResponse.success) {
                            debugSession.emit('changeStatus', thread.threadId, true);
                        }
                    });
                }
            },
            isEnabled: () => this.selectionService.selection && !this.selectionService.selection["status"],
            isVisible: () => true
        });
    }
}
