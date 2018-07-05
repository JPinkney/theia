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

import { injectable, inject } from "inversify";
import { StatusBar, StatusBarEntry, StatusBarAlignment } from "@theia/core/lib/browser";
import { EditorManager } from "@theia/editor/lib/browser";

export const PROGRESS_MONITOR_WIDGET_KIND = 'progressMonitorView';

@injectable()
export class ProgressMonitorStatusItem {

    private readonly progressNotificationName = "progress-monitor-notification";
    private statusBarTimeout: NodeJS.Timer;

    constructor(@inject(StatusBar) protected readonly statusBar: StatusBar,
        @inject(EditorManager) protected readonly editorManager: EditorManager) {
        this.createStatusBarItem();
    }

    protected createStatusBarItem() {
        const widget = this.editorManager.currentEditor;
        if (widget) {
            clearTimeout(this.statusBarTimeout);
            const statusEntry = {
                alignment: StatusBarAlignment.LEFT,
                priority: 1,
                text: "THIS IS SOME TEXT THAT WILL BE REPLACED",
                onclick: () => {
                    console.log("Has been clicked!");
                }
            } as StatusBarEntry;
            this.statusBar.setElement(this.progressNotificationName, statusEntry);
            this.statusBarTimeout = setTimeout(() => {
                this.statusBar.removeElement(this.progressNotificationName);
            }, 3000);
        } else {
            this.statusBar.removeElement(this.progressNotificationName);
        }
    }
}
