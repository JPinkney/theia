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
import { DebugSessionManager, DebugSession } from "./debug-session";
import { DebugConfigurationManager } from "./debug-configuration";

export const DEBUG_SESSION_CONTEXT_MENU: MenuPath = ['debug-session-context-menu'];

export namespace DebugSessionContextMenu {
    export const STOP = [...DEBUG_SESSION_CONTEXT_MENU, '1_stop'];
    export const DEBUG_SUSPEND_ALL_THREADS = [...STOP, '6_j'];
    export const DEBUG_RESUME_ALL_THREADS = [...DEBUG_SUSPEND_ALL_THREADS, '5_q'];
    export const DEBUG_SUSPEND_CURRENT_THREAD = [...DEBUG_RESUME_ALL_THREADS, '4_a'];
    export const DEBUG_RESUME_CURRENT_THREAD = [...DEBUG_SUSPEND_CURRENT_THREAD, '3_n'];
}

export namespace DebugMenus {
    export const DEBUG = [...MAIN_MENU_BAR, "4_debug"];
    export const DEBUG_STOP = [...DEBUG, '2_stop'];
    export const DEBUG_START = [...DEBUG_STOP, '1_start'];
    export const ADD_CONFIGURATION = [...DEBUG, '7_add_configuration'];
    export const OPEN_CONFIGURATION = [...ADD_CONFIGURATION, '8_open_configuration'];
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

    export const SUSPEND_CURRENT_THREAD = {
        id: 'debug.suspend.current_thread',
        label: 'Suspend current thread'
    };

    export const SUSPEND_ALL_THREADS = {
        id: 'debug.suspend.all_thread',
        label: 'Suspend all threads'
    };

    export const RESUME_CURRENT_THREAD = {
        id: 'debug.resume.current_thread',
        label: 'Resume current thread'
    };

    export const RESUME_ALL_THREADS = {
        id: 'debug.resume.all_threads',
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
        menus.registerMenuAction(DebugSessionContextMenu.DEBUG_SUSPEND_CURRENT_THREAD, {
            commandId: DEBUG_COMMANDS.SUSPEND_CURRENT_THREAD.id
        });
        menus.registerMenuAction(DebugSessionContextMenu.DEBUG_RESUME_CURRENT_THREAD, {
            commandId: DEBUG_COMMANDS.RESUME_CURRENT_THREAD.id
        });
        menus.registerMenuAction(DebugSessionContextMenu.DEBUG_SUSPEND_ALL_THREADS, {
            commandId: DEBUG_COMMANDS.SUSPEND_ALL_THREADS.id
        });
        menus.registerMenuAction(DebugSessionContextMenu.DEBUG_RESUME_ALL_THREADS, {
            commandId: DEBUG_COMMANDS.RESUME_ALL_THREADS.id
        });
    }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(DEBUG_COMMANDS.START);
        registry.registerHandler(DEBUG_COMMANDS.START.id, {
            execute: () => {
                this.debugConfigurationManager.selectConfiguration()
                    .then(configuration => this.debug.resolveDebugConfiguration(configuration))
                    .then(configuration => {
                        return this.debug.start(configuration).then(sessionId => {
                            return { sessionId, configuration };
                        });
                    })
                    .then(({ sessionId, configuration }) => {
                        return this.debugSessionManager.create(sessionId, configuration);
                    })
                    .then(debugSession => {
                        debugSession.initialize().then((response) => {
                            if (response.success) {
                                this.debugSessionManager.setActiveDebugSession(debugSession.sessionId);
                            }
                        });
                    });
            },
            isEnabled: () => true,
            isVisible: () => true
        });

        registry.registerCommand(DEBUG_COMMANDS.STOP);
        registry.registerHandler(DEBUG_COMMANDS.STOP.id, {
            execute: (x: any) => {
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

        registry.registerCommand(DEBUG_COMMANDS.SUSPEND_CURRENT_THREAD);
        registry.registerHandler(DEBUG_COMMANDS.SUSPEND_CURRENT_THREAD.id, {
            execute: () => {
                const self = this;
                self.doThreadAction(function (debugSession: DebugSession) {
                    debugSession.pauseThread(1).then();
                });
            },
            isEnabled: () => true,
            isVisible: () => this.debugSessionManager.getActiveDebugSession() !== undefined && this.debugSessionManager.isSuspendActionAvailable
        });

        registry.registerCommand(DEBUG_COMMANDS.RESUME_CURRENT_THREAD);
        registry.registerHandler(DEBUG_COMMANDS.RESUME_CURRENT_THREAD.id, {
            execute: () => {
                const self = this;
                self.doThreadAction(function (debugSession: DebugSession) {
                    debugSession.resumeThread(1).then();
                });
            },
            isEnabled: () => true,
            isVisible: () => this.debugSessionManager.getActiveDebugSession() !== undefined && !this.debugSessionManager.isSuspendActionAvailable
        });

        registry.registerCommand(DEBUG_COMMANDS.SUSPEND_ALL_THREADS);
        registry.registerHandler(DEBUG_COMMANDS.SUSPEND_ALL_THREADS.id, {
            execute: () => {
                const self = this;
                self.doThreadAction(function (debugSession: DebugSession) {
                    debugSession.getThreads().then(
                        resp => {
                            resp.body.threads.forEach(thread => {
                                debugSession.pauseThread(thread.id);
                            });
                        }
                    );
                });
            },
            isEnabled: () => true,
            isVisible: () => this.debugSessionManager.getActiveDebugSession() !== undefined && this.debugSessionManager.isSuspendActionAvailable
        });

        registry.registerCommand(DEBUG_COMMANDS.RESUME_ALL_THREADS);
        registry.registerHandler(DEBUG_COMMANDS.RESUME_ALL_THREADS.id, {
            execute: () => {
                const self = this;
                self.doThreadAction(function (debugSession: DebugSession) {
                    debugSession.getThreads().then(
                        resp => {
                            resp.body.threads.forEach(thread => {
                                debugSession.resumeThread(thread.id);
                            });
                        }
                    );
                });
            },
            isEnabled: () => true,
            isVisible: () => this.debugSessionManager.getActiveDebugSession() !== undefined && !this.debugSessionManager.isSuspendActionAvailable
        });

    }

    private doThreadAction(callback: Function) {
        this.debugSessionManager.toggleSuspendAction();
        const debugSession = this.debugSessionManager.getActiveDebugSession();
        if (debugSession) {
            callback(debugSession);
        }
    }
}
