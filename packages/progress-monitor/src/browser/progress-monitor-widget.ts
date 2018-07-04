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

import { injectable, postConstruct, inject } from "inversify";
import { Message, Panel, StatusBar, StatusBarEntry, StatusBarAlignment } from "@theia/core/lib/browser";
import { EditorManager } from "@theia/editor/lib/browser";
// import { ProgressMonitorItem } from "./progress-monitor-item";
import { IProgressMonitor } from "./progress-monitor-impl";
import { ProgressMonitorItem } from "./progress-monitor-item";

export const PROGRESS_MONITOR_WIDGET_KIND = 'progressMonitorView';

/**
 * This class is going to be the base of all the status bars
 */
@injectable()
export class ProgressMonitorWidget extends Panel {

    private readonly progressNotificationName = "progress-monitor-notification";
    private statusBarTimeout: NodeJS.Timer;
    private progressItems: Map<string, ProgressMonitorItem>;

    constructor( @inject(StatusBar) protected readonly statusBar: StatusBar,
        @inject(EditorManager) protected readonly editorManager: EditorManager) {
        super();
        this.id = PROGRESS_MONITOR_WIDGET_KIND;
        this.title.label = 'Progress Monitor';
        this.title.iconClass = 'fa fa-flag';
        this.title.closable = true;
        this.addClass('theia-progress-monitor');
    }

    @postConstruct()
    protected init(): void {
        this.update();
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this.node.focus();
    }

    protected onUpdateRequest(msg: Message): void {
        super.onUpdateRequest(msg);
        this.showProgressMessage("dfgdfg");
    }

    protected showProgressMessage(message: string) {
        const widget = this.editorManager.currentEditor;
        if (widget) {
            clearTimeout(this.statusBarTimeout);
            const statusEntry = {
                alignment: StatusBarAlignment.LEFT,
                priority: 1,
                text: message
            } as StatusBarEntry;
            this.statusBar.setElement(this.progressNotificationName, statusEntry);
            this.statusBarTimeout = setTimeout(() => {
                this.statusBar.removeElement(this.progressNotificationName);
            }, 3000);
        } else {
            this.statusBar.removeElement(this.progressNotificationName);
        }
    }

    public updateProgressItem(progressItemName: string, monitor: IProgressMonitor) {
        const progressItem = this.progressItems.get(progressItemName);
        if (progressItem) {
            progressItem.updateProgress(monitor);
        } else {
            const newProgressItem = new ProgressMonitorItem(monitor);
            this.progressItems.set(progressItemName, newProgressItem);
            newProgressItem.activate();
        }
    }
}
